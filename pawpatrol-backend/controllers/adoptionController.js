const { getPool } = require("../config/db");

exports.getAdoptions = async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query(`
      SELECT ar.request_id, ar.status, ar.request_date,
             u.name AS adopter_name, u.email AS adopter_email, u.phone AS adopter_phone,
             pl.pet_name, pl.breed, pl.location AS pet_location,
             c.name AS category
      FROM   AdoptionRequests ar
      JOIN   Users       u  ON ar.user_id     = u.user_id
      JOIN   PetListings pl ON ar.pet_id      = pl.pet_id
      JOIN   Categories  c  ON pl.category_id = c.category_id
      WHERE  (? IN ('ngo','shop_owner')) OR ar.user_id = ?
      ORDER  BY ar.request_date DESC
    `, [req.user.role, req.user.user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createAdoption = async (req, res) => {
  const { pet_id } = req.body;
  if (!pet_id) return res.status(400).json({ message: "pet_id is required." });

  try {
    const db = await getPool();

    const [pets] = await db.query("SELECT status FROM PetListings WHERE pet_id = ?", [pet_id]);
    if (!pets[0])                            return res.status(404).json({ message: "Pet not found." });
    if (pets[0].status !== "available")      return res.status(409).json({ message: "Pet is not available for adoption." });

    const [dup] = await db.query(
      "SELECT 1 FROM AdoptionRequests WHERE user_id=? AND pet_id=? AND status='pending'",
      [req.user.user_id, pet_id]
    );
    if (dup.length) return res.status(409).json({ message: "You already have a pending request for this pet." });

    const [[{ next_id }]] = await db.query("SELECT COALESCE(MAX(request_id),0)+1 AS next_id FROM AdoptionRequests");

    await db.query(
      "INSERT INTO AdoptionRequests (request_id,user_id,pet_id) VALUES (?,?,?)",
      [next_id, req.user.user_id, pet_id]
    );

    res.status(201).json({ message: "Adoption request submitted.", request_id: next_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateAdoptionStatus = async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status))
    return res.status(400).json({ message: "status must be 'accepted' or 'rejected'." });

  try {
    const db = await getPool();

    const [[row]] = await db.query(
      "SELECT pet_id, status FROM AdoptionRequests WHERE request_id=?",
      [req.params.id]
    );
    if (!row)                        return res.status(404).json({ message: "Request not found." });
    if (row.status !== "pending")    return res.status(409).json({ message: "Request is no longer pending." });

    await db.query("UPDATE AdoptionRequests SET status=? WHERE request_id=?", [status, req.params.id]);

    if (status === "accepted") {
      await db.query("UPDATE PetListings SET status='adopted' WHERE pet_id=?", [row.pet_id]);
      await db.query(
        "UPDATE AdoptionRequests SET status='rejected' WHERE pet_id=? AND request_id<>? AND status='pending'",
        [row.pet_id, req.params.id]
      );
    }

    res.json({ message: `Request ${status}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
