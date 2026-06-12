const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const ALLOWED_ORIGINS = (
  process.env.CLIENT_ORIGIN ||
  "http://localhost:3000,http://localhost:3001,http://localhost:3002"
).split(",");

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json());

const checkUnlocksForUser = async (userId) => {
  const userResult = await pool.query(
    "SELECT points FROM users WHERE id = $1",
    [userId]
  );

  if (userResult.rows.length === 0) {
    return null;
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

  return newUnlocks;
};

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

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return res.status(400).send("Username must be 3-20 characters");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return res.status(400).send("Username can only contain letters, numbers, and underscores");
    }

    if (password.length < 8) {
      return res.status(400).send("Password must be at least 8 characters");
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

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return res.status(400).send("Username must be 3-20 characters");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return res.status(400).send("Username can only contain letters, numbers, and underscores");
    }

    if (password.length > 100) {
      return res.status(400).send("Password must be 100 characters or fewer");
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [trimmedUsername]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Incorrect username or password");
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).send("Incorrect username or password");
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

// AWARD POINTS FOR DINO SPEED QUIZ
app.post("/speed-quiz-reward", async (req, res) => {
  const { userId, quizScore } = req.body;
  const parsedUserId = Number(userId);
  const parsedScore = Number(quizScore);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return res.status(400).send("Missing user ID");
  }

  if (!Number.isInteger(parsedScore) || parsedScore < 0 || parsedScore > 30) {
    return res.status(400).send("Invalid quiz score");
  }

  const rewardPoints = parsedScore * 5;

  try {
    const result = await pool.query(
      "UPDATE users SET points = points + $1 WHERE id = $2 RETURNING id, username, points",
      [rewardPoints, parsedUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const unlocked = await checkUnlocksForUser(parsedUserId);

    res.json({
      user: result.rows[0],
      rewardPoints,
      unlocked: unlocked || []
    });
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
    const unlocked = await checkUnlocksForUser(userId);

    if (!unlocked) {
      return res.status(404).send("User not found");
    }

    res.json({ unlocked });
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

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
