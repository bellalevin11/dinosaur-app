const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM dinosaurs");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// SIGNUP
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length === 0) {
      return res.status(400).send("Username cannot be blank");
    }

    if (trimmedUsername.length > 50) {
      return res.status(400).send("Username must be 50 characters or fewer");
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
      return res
        .status(400)
        .send("Username must be 3-20 characters and contain only letters, numbers, or underscores");
    }

    if (password.length < 8) {
      return res.status(400).send("Password must be at least 8 characters long");
    }

    if (password.length > 100) {
      return res.status(400).send("Password must be 100 characters or fewer");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, points",
      [trimmedUsername, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).send("Username already exists");
    }

    res.status(500).send("An error occurred");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length === 0) {
      return res.status(400).send("Username cannot be blank");
    }

    if (trimmedUsername.length > 50) {
      return res.status(400).send("Username must be 50 characters or fewer");
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
      return res
        .status(400)
        .send("Username must be 3-20 characters and contain only letters, numbers, or underscores");
    }

    if (password.length > 100) {
      return res.status(400).send("Password must be 100 characters or fewer");
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [trimmedUsername]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Invalid credentials");
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).send("Invalid credentials");
    }

    res.json({
      id: user.id,
      username: user.username,
      points: user.points
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// ADD POINTS
app.post("/add-points", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send("Missing user ID");
  }

  try {
    const result = await pool.query(
      "UPDATE users SET points = points + 10 WHERE id = $1 RETURNING id, username, points",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// GET ALL DINOSAURS
app.get("/dinosaurs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM dinosaurs ORDER BY points_required ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// CHECK UNLOCKS
app.post("/check-unlocks", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send("Missing user ID");
  }

  try {
    const userResult = await pool.query(
      "SELECT points FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const points = userResult.rows[0].points;

    const dinosResult = await pool.query(
      "SELECT * FROM dinosaurs WHERE points_required <= $1",
      [points]
    );

    const qualifiedDinos = dinosResult.rows;

    const unlockedResult = await pool.query(
      "SELECT dinosaur_id FROM unlocked_dinosaurs WHERE user_id = $1",
      [userId]
    );

    const unlockedIds = unlockedResult.rows.map((d) => d.dinosaur_id);

    const newUnlocks = qualifiedDinos.filter(
      (d) => !unlockedIds.includes(d.id)
    );

    for (const dino of newUnlocks) {
      await pool.query(
        "INSERT INTO unlocked_dinosaurs (user_id, dinosaur_id) VALUES ($1, $2)",
        [userId, dino.id]
      );
    }

    res.json({ unlocked: newUnlocks });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// GET UNLOCKED DINOSAURS FOR A USER
app.get("/unlocked/:userId", async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).send("Missing user ID");
  }

  try {
    const result = await pool.query(
      `SELECT d.*
       FROM unlocked_dinosaurs u
       JOIN dinosaurs d ON u.dinosaur_id = d.id
       WHERE u.user_id = $1
       ORDER BY d.points_required ASC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});