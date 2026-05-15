// controllers/adoptionController.js
const { getPool, sql } = require("../config/db");

// ── GET /api/adoptions  – ngo/shop_owner sees all; regular user sees own ──────
exports.getAdoptions = async (req, res) => {
  try {
    const db = await getPool();
    const r  = await db.request()
      .input("user_id", sql.Int,     req.user.user_id)
      .input("role",    sql.VarChar, req.user.role)
      .query(`
        SELECT ar.request_id, ar.status, ar.request_date,
               u.name  AS adopter_name,  u.email AS adopter_email, u.phone AS adopter_phone,
               pl.pet_name, pl.breed,    pl.location AS pet_location,
               c.name  AS category
        FROM   AdoptionRequests ar
        JOIN   Users            u   ON ar.user_id      = u.user_id
        JOIN   PetListings      pl  ON ar.pet_id        = pl.pet_id
        JOIN   Categories       c   ON pl.category_id   = c.category_id
        WHERE  (@role IN ('ngo','shop_owner')) OR ar.user_id = @user_id
        ORDER  BY ar.request_date DESC
      `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/adoptions  – any logged-in user ─────────────────────────────────
exports.createAdoption = async (req, res) => {
  const { pet_id } = req.body;
  if (!pet_id) return res.status(400).json({ message: "pet_id is required." });

  try {
    const db = await getPool();

    // Pet available?
    const pet = await db.request()
      .input("pet_id", sql.Int, pet_id)
      .query("SELECT status FROM PetListings WHERE pet_id = @pet_id");
    if (!pet.recordset[0])                           return res.status(404).json({ message: "Pet not found." });
    if (pet.recordset[0].status !== "available")     return res.status(409).json({ message: "Pet is not available for adoption." });

    // Duplicate pending request?
    const dup = await db.request()
      .input("user_id", sql.Int, req.user.user_id)
      .input("pet_id",  sql.Int, pet_id)
      .query("SELECT 1 FROM AdoptionRequests WHERE user_id=@user_id AND pet_id=@pet_id AND status='pending'");
    if (dup.recordset.length) return res.status(409).json({ message: "You already have a pending request for this pet." });

    const idRow  = await db.request().query("SELECT ISNULL(MAX(request_id),0)+1 AS next_id FROM AdoptionRequests");
    const req_id = idRow.recordset[0].next_id;

    await db.request()
      .input("request_id", sql.Int, req_id)
      .input("user_id",    sql.Int, req.user.user_id)
      .input("pet_id",     sql.Int, pet_id)
      .query("INSERT INTO AdoptionRequests (request_id,user_id,pet_id) VALUES (@request_id,@user_id,@pet_id)");

    res.status(201).json({ message: "Adoption request submitted.", request_id: req_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── PATCH /api/adoptions/:id  – ngo / shop_owner updates status ───────────────
exports.updateAdoptionStatus = async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status))
    return res.status(400).json({ message: "status must be 'accepted' or 'rejected'." });

  try {
    const db = await getPool();

    const row = await db.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT pet_id, status FROM AdoptionRequests WHERE request_id=@id");
    if (!row.recordset[0])                        return res.status(404).json({ message: "Request not found." });
    if (row.recordset[0].status !== "pending")    return res.status(409).json({ message: "Request is no longer pending." });

    const pet_id = row.recordset[0].pet_id;

    await db.request()
      .input("id",     sql.Int,     req.params.id)
      .input("status", sql.VarChar, status)
      .query("UPDATE AdoptionRequests SET status=@status WHERE request_id=@id");

    if (status === "accepted") {
      await db.request()
        .input("pet_id", sql.Int, pet_id)
        .query("UPDATE PetListings SET status='adopted' WHERE pet_id=@pet_id");

      await db.request()
        .input("pet_id", sql.Int, pet_id)
        .input("id",     sql.Int, req.params.id)
        .query("UPDATE AdoptionRequests SET status='rejected' WHERE pet_id=@pet_id AND request_id<>@id AND status='pending'");
    }

    res.json({ message: `Request ${status}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
