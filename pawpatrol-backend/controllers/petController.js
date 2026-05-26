const { getPool } = require("../config/db");

exports.getPets = async (req, res) => {
  const { species, location, search } = req.query;
  try {
    const db = await getPool();
    let where = "WHERE pl.status = 'available'";
    const params = [];

    if (species)  { where += " AND c.name = ?";                                                        params.push(species); }
    if (location) { where += " AND pl.location LIKE ?";                                                params.push(`%${location}%`); }
    if (search)   { where += " AND (pl.pet_name LIKE ? OR pl.breed LIKE ? OR pl.description LIKE ?)";  params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const [rows] = await db.query(`
      SELECT pl.pet_id, pl.pet_name, pl.breed, pl.age, pl.description,
             pl.location, pl.status, pl.created_at,
             c.name AS category,
             u.name AS owner_name, u.phone AS owner_phone, u.role AS owner_role
      FROM   PetListings pl
      JOIN   Users      u ON pl.owner_id    = u.user_id
      JOIN   Categories c ON pl.category_id = c.category_id
      ${where}
      ORDER BY pl.created_at DESC
    `, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query("SELECT * FROM Categories ORDER BY name");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getPetById = async (req, res) => {
  try {
    const db = await getPool();
    const [[pet]] = await db.query(`
      SELECT pl.*, c.name AS category, u.name AS owner_name, u.phone AS owner_phone
      FROM   PetListings pl
      JOIN   Users      u ON pl.owner_id    = u.user_id
      JOIN   Categories c ON pl.category_id = c.category_id
      WHERE  pl.pet_id = ?
    `, [req.params.id]);
    if (!pet) return res.status(404).json({ message: "Pet not found." });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createPet = async (req, res) => {
  const { pet_name, breed, age, description, location, category_id } = req.body;
  if (!pet_name || !category_id)
    return res.status(400).json({ message: "pet_name and category_id are required." });
  try {
    const db = await getPool();
    const [[{ next_id }]] = await db.query("SELECT COALESCE(MAX(pet_id),0)+1 AS next_id FROM PetListings");

    await db.query(
      "INSERT INTO PetListings (pet_id,pet_name,breed,age,description,location,owner_id,category_id) VALUES (?,?,?,?,?,?,?,?)",
      [next_id, pet_name, breed || null, age || null, description || null, location || null, req.user.user_id, category_id]
    );
    res.status(201).json({ message: "Pet listed successfully.", pet_id: next_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updatePet = async (req, res) => {
  const { pet_name, breed, age, description, location, status, category_id } = req.body;
  try {
    const db = await getPool();
    await db.query(`
      UPDATE PetListings SET
        pet_name    = COALESCE(?, pet_name),
        breed       = COALESCE(?, breed),
        age         = COALESCE(?, age),
        description = COALESCE(?, description),
        location    = COALESCE(?, location),
        status      = COALESCE(?, status),
        category_id = COALESCE(?, category_id)
      WHERE pet_id = ?
    `, [pet_name||null, breed||null, age||null, description||null, location||null, status||null, category_id||null, req.params.id]);
    res.json({ message: "Pet updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const db = await getPool();
    await db.query("DELETE FROM PetListings WHERE pet_id=?", [req.params.id]);
    res.json({ message: "Pet deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
