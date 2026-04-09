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
    res.status(500).send("Database error");
  }
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});

// signup section for users
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]  // store the hash, not the plain text
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error signing up");
  }
});

// login section for users
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // fetch user by username only (can't query by hashed password)
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Invalid credentials");
    }

    const user = result.rows[0];

    // compare plain text input against the stored hash
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).send("Invalid credentials");
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});

// adds points to the user's account
app.post("/add-points", async (req, res) => {
  const { userId, pointsToAdd } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET points = points + $1 WHERE id = $2 RETURNING *",
      [pointsToAdd, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding points");
  }
});

// fetches all dinosaurs from the database and sends them to the client
app.get("/dinosaurs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM dinosaurs ORDER BY points_required ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching dinosaurs");
  }
});

// checks which dinosaurs the user has unlocked based on their points and updates the unlocked_dinosaurs table
app.post("/check-unlocks", async (req, res) => {
  const { userId } = req.body;

  try {
    // get user points
    const userResult = await pool.query(
      "SELECT points FROM users WHERE id = $1",
      [userId]
    );

    const points = userResult.rows[0].points;

    // get dinos user qualifies for
    const dinosResult = await pool.query(
      "SELECT * FROM dinosaurs WHERE points_required <= $1",
      [points]
    );

    const qualifiedDinos = dinosResult.rows;

    // get already unlocked dinos
    const unlockedResult = await pool.query(
      "SELECT dinosaur_id FROM unlocked_dinosaurs WHERE user_id = $1",
      [userId]
    );

    const unlockedIds = unlockedResult.rows.map(d => d.dinosaur_id);

    // find new unlocks
    const newUnlocks = qualifiedDinos.filter(
      d => !unlockedIds.includes(d.id)
    );

    // insert new unlocks
    for (let dino of newUnlocks) {
      await pool.query(
        "INSERT INTO unlocked_dinosaurs (user_id, dinosaur_id) VALUES ($1, $2)",
        [userId, dino.id]
      );
    }

    res.json({ unlocked: newUnlocks });

  } catch (err) {
    console.error(err);
    res.status(500).send("Unlock error");
  }
});

// endpoint to get all unlocked dinosaurs for a user
app.get("/unlocked/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query(
      `SELECT d.* 
       FROM unlocked_dinosaurs u
       JOIN dinosaurs d ON u.dinosaur_id = d.id
       WHERE u.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching unlocked dinos");
  }
});

