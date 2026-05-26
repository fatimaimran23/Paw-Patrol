require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/pets",      require("./routes/petRoutes"));
app.use("/api/adoptions", require("./routes/adoptionRoutes"));
app.use("/api/reports",   require("./routes/reportRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));

app.get("/", (_req, res) => res.json({ message: "PawPatrol API is running 🐾" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅  Server running on http://localhost:${PORT}`));
