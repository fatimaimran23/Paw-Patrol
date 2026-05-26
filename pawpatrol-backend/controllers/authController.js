const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { getPool } = require("../config/db");

const signToken = (user_id, role) =>
  jwt.sign({ user_id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

exports.register = async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "name, email, password and role are required." });

  const allowedRoles = ["user", "shop_owner", "ngo"];
  if (!allowedRoles.includes(role))
    return res.status(400).json({ message: `role must be one of: ${allowedRoles.join(", ")}` });

  try {
    const db = await getPool();

    const [exists] = await db.query("SELECT 1 FROM Users WHERE email=?", [email]);
    if (exists.length) return res.status(409).json({ message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);
    const [[{ next_id }]] = await db.query("SELECT COALESCE(MAX(user_id),0)+1 AS next_id FROM Users");

    await db.query(
      "INSERT INTO Users (user_id,name,email,password,role,phone,location) VALUES (?,?,?,?,?,?,?)",
      [next_id, name, email, hashed, role, phone || null, location || null]
    );

    const token = signToken(next_id, role);
    res.status(201).json({ token, user: { user_id: next_id, name, email, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "email and password are required." });

  try {
    const db = await getPool();
    const [[user]] = await db.query(
      "SELECT user_id,name,email,password,role FROM Users WHERE email=?",
      [email]
    );
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

exports.getMe = async (req, res) => {
  try {
    const db = await getPool();
    const [[user]] = await db.query(
      "SELECT user_id,name,email,role,phone,location,created_at FROM Users WHERE user_id=?",
      [req.user.user_id]
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
