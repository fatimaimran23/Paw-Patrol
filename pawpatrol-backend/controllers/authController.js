// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { getPool, sql } = require("../config/db");

// ── Helper ────────────────────────────────────────────────────────────────────
const signToken = (user_id, role) =>
  jwt.sign({ user_id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── POST /api/auth/register ───────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "name, email, password and role are required." });
  }
  const allowedRoles = ["user", "shop_owner", "ngo"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: `role must be one of: ${allowedRoles.join(", ")}` });
  }

  try {
    const db = await getPool();

    // Check duplicate email
    const exists = await db.request()
      .input("email", sql.VarChar, email)
      .query("SELECT 1 FROM Users WHERE email = @email");
    if (exists.recordset.length) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Auto-increment user_id
    const idRow   = await db.request().query("SELECT ISNULL(MAX(user_id),0)+1 AS next_id FROM Users");
    const user_id = idRow.recordset[0].next_id;

    await db.request()
      .input("user_id",  sql.Int,     user_id)
      .input("name",     sql.VarChar, name)
      .input("email",    sql.VarChar, email)
      .input("password", sql.VarChar, hashed)
      .input("role",     sql.VarChar, role)
      .input("phone",    sql.VarChar, phone    || null)
      .input("location", sql.VarChar, location || null)
      .query(`INSERT INTO Users (user_id,name,email,password,role,phone,location)
              VALUES (@user_id,@name,@email,@password,@role,@phone,@location)`);

    const token = signToken(user_id, role);
    res.status(201).json({ token, user: { user_id, name, email, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required." });
  }

  try {
    const db  = await getPool();
    const row = await db.request()
      .input("email", sql.VarChar, email)
      .query("SELECT user_id, name, email, password, role FROM Users WHERE email = @email");

    const user = row.recordset[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)  return res.status(401).json({ message: "Invalid credentials." });

    const token = signToken(user.user_id, user.role);
    res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/auth/me  (protected) ────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const db  = await getPool();
    const row = await db.request()
      .input("id", sql.Int, req.user.user_id)
      .query("SELECT user_id,name,email,role,phone,location,created_at FROM Users WHERE user_id=@id");
    if (!row.recordset[0]) return res.status(404).json({ message: "User not found." });
    res.json(row.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
