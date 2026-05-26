const { getPool } = require("../config/db");

exports.getReports = async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query(`
      SELECT ab.report_id, ab.description, ab.location, ab.status, ab.created_at,
             r.name AS reported_by_name, r.email AS reported_by_email,
             h.name AS handled_by_name
      FROM   AbuseReports ab
      JOIN   Users r  ON ab.reported_by = r.user_id
      LEFT JOIN Users h ON ab.handled_by = h.user_id
      ORDER  BY ab.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createReport = async (req, res) => {
  const { description, location } = req.body;
  if (!description) return res.status(400).json({ message: "description is required." });
  try {
    const db = await getPool();
    const [[{ next_id }]] = await db.query("SELECT COALESCE(MAX(report_id),0)+1 AS next_id FROM AbuseReports");
    await db.query(
      "INSERT INTO AbuseReports (report_id,description,location,reported_by) VALUES (?,?,?,?)",
      [next_id, description, location || null, req.user.user_id]
    );
    res.status(201).json({ message: "Abuse report filed.", report_id: next_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.assignHandler = async (req, res) => {
  try {
    const db = await getPool();
    await db.query(
      "UPDATE AbuseReports SET handled_by=?, status='under_investigation' WHERE report_id=?",
      [req.user.user_id, req.params.id]
    );
    res.json({ message: "Handler assigned." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ["pending", "under_investigation", "resolved"];
  if (!valid.includes(status))
    return res.status(400).json({ message: `status must be one of: ${valid.join(", ")}` });
  try {
    const db = await getPool();
    await db.query("UPDATE AbuseReports SET status=? WHERE report_id=?", [status, req.params.id]);
    res.json({ message: "Status updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
