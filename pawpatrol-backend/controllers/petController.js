// controllers/petController.js
const { getPool, sql } = require("../config/db");

// ── GET /api/pets  ── list available pets (with optional filters) ─────────────
exports.getPets = async (req, res) => {
  const { species, location, size, gender, urgent, search } = req.query;
  try {
    const db   = await getPool();
    const req2 = db.request();

    let where = "WHERE pl.status = 'available'";

    if (species)  { req2.input("species",  sql.VarChar, species);         where += " AND c.name = @species"; }
    if (location) { req2.input("location", sql.VarChar, `%${location}%`); where += " AND pl.location LIKE @location"; }
    if (search)   { req2.input("search",   sql.VarChar, `%${search}%`);   where += " AND (pl.pet_name LIKE @search OR pl.breed LIKE @search OR pl.description LIKE @search)"; }

    const result = await req2.query(`
      SELECT pl.pet_id, pl.pet_name, pl.breed, pl.age, pl.description,
             pl.location, pl.status, pl.created_at,
             c.name AS category,
             u.name AS owner_name, u.phone AS owner_phone, u.role AS owner_role
      FROM   PetListings pl
      JOIN   Users       u ON pl.owner_id    = u.user_id
      JOIN   Categories  c ON pl.category_id = c.category_id
      ${where}
      ORDER BY pl.created_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/pets/categories ──────────────────────────────────────────────────
// NOTE: this route must be registered BEFORE /api/pets/:id so Express doesn't
//       treat "categories" as an id parameter.
exports.getCategories = async (req, res) => {
  try {
    const db = await getPool();
    const r  = await db.request().query("SELECT * FROM Categories ORDER BY name");
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/pets/:id ─────────────────────────────────────────────────────────
exports.getPetById = async (req, res) => {
  try {
    const db  = await getPool();
    const row = await db.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT pl.*, c.name AS category, u.name AS owner_name, u.phone AS owner_phone
        FROM   PetListings pl
        JOIN   Users       u ON pl.owner_id    = u.user_id
        JOIN   Categories  c ON pl.category_id = c.category_id
        WHERE  pl.pet_id = @id
      `);
    if (!row.recordset[0]) return res.status(404).json({ message: "Pet not found." });
    res.json(row.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/pets  (shop_owner or ngo only) ──────────────────────────────────
exports.createPet = async (req, res) => {
  const { pet_name, breed, age, description, location, category_id } = req.body;
  if (!pet_name || !category_id) {
    return res.status(400).json({ message: "pet_name and category_id are required." });
  }
  try {
    const db    = await getPool();
    const idRow = await db.request().query("SELECT ISNULL(MAX(pet_id),0)+1 AS next_id FROM PetListings");
    const pet_id = idRow.recordset[0].next_id;

    await db.request()
      .input("pet_id",      sql.Int,     pet_id)
      .input("pet_name",    sql.VarChar, pet_name)
      .input("breed",       sql.VarChar, breed       || null)
      .input("age",         sql.Int,     age         || null)
      .input("description", sql.Text,    description || null)
      .input("location",    sql.VarChar, location    || null)
      .input("owner_id",    sql.Int,     req.user.user_id)
      .input("category_id", sql.Int,     category_id)
      .query(`INSERT INTO PetListings (pet_id,pet_name,breed,age,description,location,owner_id,category_id)
              VALUES (@pet_id,@pet_name,@breed,@age,@description,@location,@owner_id,@category_id)`);

    res.status(201).json({ message: "Pet listed successfully.", pet_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── PUT /api/pets/:id  (owner only) ───────────────────────────────────────────
exports.updatePet = async (req, res) => {
  const { pet_name, breed, age, description, location, status, category_id } = req.body;
  try {
    const db = await getPool();
    await db.request()
      .input("id",          sql.Int,     req.params.id)
      .input("pet_name",    sql.VarChar, pet_name    || null)
      .input("breed",       sql.VarChar, breed       || null)
      .input("age",         sql.Int,     age         || null)
      .input("description", sql.Text,    description || null)
      .input("location",    sql.VarChar, location    || null)
      .input("status",      sql.VarChar, status      || null)
      .input("category_id", sql.Int,     category_id || null)
      .query(`UPDATE PetListings SET
                pet_name    = COALESCE(@pet_name,    pet_name),
                breed       = COALESCE(@breed,       breed),
                age         = COALESCE(@age,         age),
                description = COALESCE(@description, description),
                location    = COALESCE(@location,    location),
                status      = COALESCE(@status,      status),
                category_id = COALESCE(@category_id, category_id)
              WHERE pet_id = @id`);
    res.json({ message: "Pet updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── DELETE /api/pets/:id ──────────────────────────────────────────────────────
exports.deletePet = async (req, res) => {
  try {
    const db = await getPool();
    await db.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM PetListings WHERE pet_id = @id");
    res.json({ message: "Pet deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
