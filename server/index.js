const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { db } = require("./db");
const { requireAuth } = require("./authMiddleware");

const app = express();
app.use(express.json());

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/*
------------------------------------
GET TEAMS (for dropdown in register)
------------------------------------
*/
app.get("/Api/teams", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, primary_color, secondary_color FROM team ORDER BY name"
    );

    res.json({ teams: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/*
------------------------------------
REGISTER
------------------------------------
*/
app.post("/Api/auth/register", async (req, res) => {
  try {
    const { username, password, teamId } = req.body;

    if (!username || !password || !teamId) {
      return res
        .status(400)
        .json({ error: "username, password and teamId are required" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // check if username exists
    const [existing] = await db.query(
      "SELECT id FROM korisnik WHERE username = ?",
      [username]
    );

    if (existing.length) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // verify team exists
    const [teamRows] = await db.query(
      "SELECT id FROM team WHERE id = ?",
      [teamId]
    );

    if (!teamRows.length) {
      return res.status(400).json({ error: "Invalid teamId" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO korisnik (username, password, team_id) VALUES (?, ?, ?)",
      [username, passwordHash, teamId]
    );

    const token = signToken(result.insertId);

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register failed" });
  }
});

/*
------------------------------------
LOGIN
------------------------------------
*/
app.post("/Api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }

    const [rows] = await db.query(
      "SELECT id, password FROM korisnik WHERE username = ?",
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user.id);

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/*
------------------------------------
CURRENT USER + TEAM COLORS
------------------------------------
*/
app.get("/Api/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await db.query(
      `SELECT 
        k.id,
        k.username,
        k.team_id,
        t.name AS team_name,
        t.primary_color,
        t.secondary_color
      FROM korisnik k
      JOIN team t ON t.id = k.team_id
      WHERE k.id = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/seasons", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT ID as id, yr FROM season ORDER BY yr DESC");
    res.json({ seasons: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/results", async (req, res) => {
  try {
    const seasonId = Number(req.query.seasonId);

    const [rows] = await db.query(
      `
      SELECT 
        d.ID as driver_id,
        d.name as driver_name,
        d.team as team_name,
        t.primary_color,
        SUM(p.amount) as total_points
      FROM points p
      JOIN driver d ON d.ID = p.driver_id
      LEFT JOIN team t ON t.name = d.team
      WHERE p.season_id = ?
      GROUP BY d.ID, d.name, d.team, t.primary_color
      ORDER BY total_points DESC
      `,
      [seasonId]
    );

    res.json({ results: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 3001}`);
});