const { getPool } = require("../config/db");

exports.getFavorites = async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query(`
      SELECT f.favorite_id, pl.pet_id, pl.pet_name, pl.breed, pl.status, c.name AS category
      FROM   Favorites   f
      JOIN   PetListings pl ON f.pet_id       = pl.pet_id
      JOIN   Categories  c  ON pl.category_id = c.category_id
      WHERE  f.user_id = ?
    `, [req.user.user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.addFavorite = async (req, res) => {
  const { pet_id } = req.body;
  if (!pet_id) return res.status(400).json({ message: "pet_id is required." });
  try {
    const db = await getPool();
    const [dup] = await db.query(
      "SELECT 1 FROM Favorites WHERE user_id=? AND pet_id=?",
      [req.user.user_id, pet_id]
    );
    if (dup.length) return res.status(409).json({ message: "Already in favourites." });

    const [[{ next_id }]] = await db.query("SELECT COALESCE(MAX(favorite_id),0)+1 AS next_id FROM Favorites");
    await db.query(
      "INSERT INTO Favorites (favorite_id,user_id,pet_id) VALUES (?,?,?)",
      [next_id, req.user.user_id, pet_id]
    );
    res.status(201).json({ message: "Added to favourites." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const db = await getPool();
    await db.query(
      "DELETE FROM Favorites WHERE user_id=? AND pet_id=?",
      [req.user.user_id, req.params.petId]
    );
    res.json({ message: "Removed from favourites." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
