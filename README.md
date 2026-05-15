# 🐾 PawPatrol — Setup Guide

## Project Structure

```
PawPatrol/
├── pawpatrol-backend/          ← Express + mssql API
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── schema.sql              ← Run this in SSMS first
│   ├── .env                    ← Edit this with your DB details
│   ├── package.json
│   └── server.js
│
└── pawpatrol-frontend/         ← React app
    ├── public/index.html
    ├── src/
    │   ├── index.js
    │   └── App.js              ← ⚠️  Paste your full App.js here
    └── package.json
```

---

## Prerequisites

Install these before starting:

1. **Node.js** → https://nodejs.org  (v18 or newer)
2. **SQL Server** → Already installed if you're using SSMS
3. **SSMS** (SQL Server Management Studio) → for running the schema
4. **VS Code** → https://code.visualstudio.com

---

## Step 1 — Set Up the Database

1. Open **SSMS** and connect to your local SQL Server instance
2. Click **File → Open → File** and open `pawpatrol-backend/schema.sql`
3. Press **F5** (or click Execute) to run the entire script
4. You should see the `PawPatrol` database appear in the Object Explorer

---

## Step 2 — Configure the Backend

1. Open `pawpatrol-backend/.env` in VS Code
2. Edit these values:

```env
# If you use Windows Authentication (most common with SSMS):
DB_TRUSTED_CONNECTION=true
DB_SERVER=localhost          # or .\SQLEXPRESS  or  LAPTOP-NAME\SQLEXPRESS
DB_NAME=PawPatrol

# If you use SQL Server Authentication instead:
DB_TRUSTED_CONNECTION=false
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
```

> **Tip:** If you see `(localdb)\MSSQLLocalDB` in SSMS, set `DB_SERVER=localhost`  
> If you see `LAPTOP-NAME\SQLEXPRESS`, set `DB_SERVER=LAPTOP-NAME\SQLEXPRESS`

---

## Step 3 — Install & Run the Backend

Open a terminal in VS Code (`Ctrl + `` ` ``):

```bash
cd pawpatrol-backend
npm install
npm run dev
```

You should see:
```
✅  Connected to SQL Server – PawPatrol
✅  Server running on http://localhost:5000
```

Test it by opening http://localhost:5000 in your browser — you should see `PawPatrol API is running 🐾`

---

## Step 4 — Add Your App.js to the Frontend

1. Open `pawpatrol-frontend/src/App.js`
2. **Replace the entire file** with your original `App.js` (the one with all the pages)

---

## Step 5 — Install & Run the Frontend

Open a **second terminal** in VS Code:

```bash
cd pawpatrol-frontend
npm install
npm start
```

Your browser should open automatically at **http://localhost:3000**

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Cannot open database "PawPatrol"` | Run schema.sql in SSMS first |
| `Login failed for user ''` | Set `DB_TRUSTED_CONNECTION=true` in .env |
| `ECONNREFUSED :1433` | SQL Server service isn't running — open Services and start it |
| `Port 3000 in use` | Close other React apps, or run `set PORT=3001 && npm start` |
| `CORS error` in browser | Make sure backend is running on port 5000 |

---

## API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/pets | No | List available pets |
| GET | /api/pets/:id | No | Get pet details |
| POST | /api/pets | Yes | Add pet listing |
| GET | /api/adoptions | Yes | View adoption requests |
| POST | /api/adoptions | Yes | Submit adoption request |
| GET | /api/reports | Yes | View abuse reports |
| POST | /api/reports | Yes | File a report |
| GET | /api/favorites | Yes | View favorites |
| POST | /api/favorites | Yes | Add favorite |

---

## Running Both Servers

You need **two terminals open at the same time**:

- Terminal 1: `cd pawpatrol-backend && npm run dev`
- Terminal 2: `cd pawpatrol-frontend && npm start`
