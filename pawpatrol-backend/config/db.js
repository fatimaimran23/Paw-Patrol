const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

const initSchema = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      user_id    INT PRIMARY KEY AUTO_INCREMENT,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(100) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(20) CHECK (role IN ('user', 'shop_owner', 'ngo')) NOT NULL,
      phone      VARCHAR(20),
      location   VARCHAR(100),
      created_at DATETIME DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Categories (
      category_id INT PRIMARY KEY AUTO_INCREMENT,
      name        VARCHAR(50) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS PetListings (
      pet_id      INT PRIMARY KEY AUTO_INCREMENT,
      pet_name    VARCHAR(100),
      breed       VARCHAR(100),
      age         INT,
      description TEXT,
      location    VARCHAR(100),
      status      VARCHAR(20) CHECK (status IN ('available', 'adopted')) DEFAULT 'available',
      created_at  DATETIME DEFAULT NOW(),
      owner_id    INT,
      category_id INT,
      FOREIGN KEY (owner_id)    REFERENCES Users(user_id)          ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS AdoptionRequests (
      request_id   INT PRIMARY KEY AUTO_INCREMENT,
      status       VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
      request_date DATETIME DEFAULT NOW(),
      user_id INT,
      pet_id  INT,
      FOREIGN KEY (user_id) REFERENCES Users(user_id)      ON DELETE NO ACTION,
      FOREIGN KEY (pet_id)  REFERENCES PetListings(pet_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS AbuseReports (
      report_id   INT PRIMARY KEY AUTO_INCREMENT,
      description TEXT NOT NULL,
      location    VARCHAR(100),
      status      VARCHAR(30) CHECK (status IN ('pending', 'under_investigation', 'resolved')) DEFAULT 'pending',
      created_at  DATETIME DEFAULT NOW(),
      reported_by INT,
      handled_by  INT,
      FOREIGN KEY (reported_by) REFERENCES Users(user_id) ON DELETE NO ACTION,
      FOREIGN KEY (handled_by)  REFERENCES Users(user_id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Favorites (
      favorite_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id     INT,
      pet_id      INT,
      FOREIGN KEY (user_id) REFERENCES Users(user_id)      ON DELETE NO ACTION,
      FOREIGN KEY (pet_id)  REFERENCES PetListings(pet_id) ON DELETE CASCADE,
      CONSTRAINT unique_favorite UNIQUE (user_id, pet_id)
    )
  `);

  // Seed categories if empty
  const [cats] = await pool.query(`SELECT COUNT(*) as count FROM Categories`);
  if (cats[0].count === 0) {
    await pool.query(`INSERT INTO Categories (category_id, name) VALUES (1,'Dog'),(2,'Cat'),(3,'Bird')`);
  }

  console.log("✅  Schema ready");
};

const getPool = async () => {
  if (!pool) {
    pool = mysql.createPool(process.env.DATABASE_URL);
    await initSchema(pool);
    console.log("✅  Connected to MySQL");
  }
  return pool;
};

module.exports = { getPool };
