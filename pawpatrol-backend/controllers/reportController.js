// controllers/reportController.js
const { getPool, sql } = require("../config/db");

// ── GET /api/reports ──────────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  try {
    const db = await getPool();
    const r  = await db.request().query(`
      SELECT ab.report_id, ab.description, ab.location, ab.status, ab.created_at,
             r.name  AS reported_by_name,  r.email AS reported_by_email,
             h.name  AS handled_by_name
      FROM   AbuseReports ab
      JOIN   Users r  ON ab.reported_by = r.user_id
      LEFT JOIN Users h ON ab.handled_by = h.user_id
      ORDER  BY ab.created_at DESC
    `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/reports ─────────────────────────────────────────────────────────
exports.createReport = async (req, res) => {
  const { description, location } = req.body;
  if (!description) return res.status(400).json({ message: "description is required." });

  try {
    const db     = await getPool();
    const idRow  = await db.request().query("SELECT ISNULL(MAX(report_id),0)+1 AS next_id FROM AbuseReports");
    const rep_id = idRow.recordset[0].next_id;

    await db.request()
      .input("report_id",   sql.Int,     rep_id)
      .input("description", sql.Text,    description)
      .input("location",    sql.VarChar, location || null)
      .input("reported_by", sql.Int,     req.user.user_id)
      .query("INSERT INTO AbuseReports (report_id,description,location,reported_by) VALUES (@report_id,@description,@location,@reported_by)");

    res.status(201).json({ message: "Abuse report filed.", report_id: rep_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── PATCH /api/reports/:id/assign  – ngo only ────────────────────────────────
exports.assignHandler = async (req, res) => {
  try {
    const db = await getPool();
    await db.request()
      .input("id",         sql.Int, req.params.id)
      .input("handler_id", sql.Int, req.user.user_id)
      .query(`UPDATE AbuseReports
              SET handled_by=@handler_id, status='under_investigation'
              WHERE report_id=@id`);
    res.json({ message: "Handler assigned." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── PATCH /api/reports/:id/status  – ngo only ────────────────────────────────
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ["pending", "under_investigation", "resolved"];
  if (!valid.includes(status))
    return res.status(400).json({ message: `status must be one of: ${valid.join(", ")}` });

  try {
    const db = await getPool();
    await db.request()
      .input("id",     sql.Int,     req.params.id)
      .input("status", sql.VarChar, status)
      .query("UPDATE AbuseReports SET status=@status WHERE report_id=@id");
    res.json({ message: "Status updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
