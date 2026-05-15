// controllers/favoriteController.js
const { getPool, sql } = require("../config/db");

// ── GET /api/favorites  – current user's favourites ───────────────────────────
exports.getFavorites = async (req, res) => {
  try {
    const db = await getPool();
    const r  = await db.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`
        SELECT f.favorite_id, pl.pet_id, pl.pet_name, pl.breed, pl.status, c.name AS category
        FROM   Favorites   f
        JOIN   PetListings pl ON f.pet_id        = pl.pet_id
        JOIN   Categories  c  ON pl.category_id  = c.category_id
        WHERE  f.user_id = @user_id
      `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/favorites ────────────────────────────────────────────────────────
exports.addFavorite = async (req, res) => {
  const { pet_id } = req.body;
  if (!pet_id) return res.status(400).json({ message: "pet_id is required." });

  try {
    const db  = await getPool();
    const dup = await db.request()
      .input("user_id", sql.Int, req.user.user_id)
      .input("pet_id",  sql.Int, pet_id)
      .query("SELECT 1 FROM Favorites WHERE user_id=@user_id AND pet_id=@pet_id");
    if (dup.recordset.length) return res.status(409).json({ message: "Already in favourites." });

    const idRow = await db.request().query("SELECT ISNULL(MAX(favorite_id),0)+1 AS next_id FROM Favorites");
    await db.request()
      .input("fav_id",  sql.Int, idRow.recordset[0].next_id)
      .input("user_id", sql.Int, req.user.user_id)
      .input("pet_id",  sql.Int, pet_id)
      .query("INSERT INTO Favorites (favorite_id,user_id,pet_id) VALUES (@fav_id,@user_id,@pet_id)");

    res.status(201).json({ message: "Added to favourites." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── DELETE /api/favorites/:petId ──────────────────────────────────────────────
exports.removeFavorite = async (req, res) => {
  try {
    const db = await getPool();
    await db.request()
      .input("user_id", sql.Int, req.user.user_id)
      .input("pet_id",  sql.Int, req.params.petId)
      .query("DELETE FROM Favorites WHERE user_id=@user_id AND pet_id=@pet_id");
    res.json({ message: "Removed from favourites." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
