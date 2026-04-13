import { useEffect, useState } from "react";

function App() {
  // State variables to manage user and dinosaur data
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [dinosaurs, setDinosaurs] = useState([]);
  const [unlockedDinos, setUnlockedDinos] = useState([]);
  const [question, setQuestion] = useState(null);
  const [choices, setChoices] = useState([]);

  // Load saved user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch dinosaur data on initial render
  useEffect(() => {
    fetchDinosaurs();
  }, []);

  // Update unlocked dinosaurs whenever the current user changes
  useEffect(() => {
    if (currentUser) {
      fetchUnlocked(currentUser.id);
    } else {
      setUnlockedDinos([]);
    }
  }, [currentUser]);

  // Generate a question if there are enough dinosaurs
  useEffect(() => {
    if (dinosaurs.length >= 3) {
      generateQuestion();
    }
  }, [dinosaurs]);

  // Fetch all dinosaurs from the server
  const fetchDinosaurs = async () => {
    try {
      const res = await fetch("http://localhost:5001/dinosaurs");
      if (!res.ok) {
        throw new Error("Could not fetch dinosaurs");
      }
      const data = await res.json();
      setDinosaurs(data);
    } catch (err) {
      console.error(err);
      setMessage("Error loading dinosaurs");
    }
  };

  // Fetch unlocked dinosaurs for a user
  const fetchUnlocked = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5001/unlocked/${userId}`);
      if (!res.ok) {
        throw new Error("Could not fetch unlocked dinosaurs");
      }
      const data = await res.json();
      setUnlockedDinos(data);
    } catch (err) {
      console.error(err);
      setMessage("Error loading unlocked dinosaurs");
    }
  };

  const signup = async () => {
    try {
      const res = await fetch("http://localhost:5001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        throw new Error("Signup failed");
      }

      await res.json();
      setMessage("Signup successful. You can now log in.");
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Error signing up");
    }
  };

  const login = async () => {
    try {
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        throw new Error("Invalid login");
      }

      const data = await res.json();
      setCurrentUser(data);
      localStorage.setItem("currentUser", JSON.stringify(data));
      setMessage("Login successful");
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Login failed");
    }
  };

  const addPointsToUser = async (pointsToAdd) => {
    try {
      const res = await fetch("http://localhost:5001/add-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUser.id,
          pointsToAdd
        })
      });

      if (!res.ok) {
        throw new Error("Could not add points");
      }

      const updatedUser = await res.json();
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      const unlockRes = await fetch("http://localhost:5001/check-unlocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: updatedUser.id })
      });

      if (!unlockRes.ok) {
        throw new Error("Could not check unlocks");
      }

      const unlockData = await unlockRes.json();
      await fetchUnlocked(updatedUser.id);

      if (unlockData.unlocked && unlockData.unlocked.length > 0) {
        setMessage(`Correct! You earned ${pointsToAdd} points and unlocked a new dinosaur!`);
      } else {
        setMessage(`Correct! You earned ${pointsToAdd} points.`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error adding points");
    }
  };

  const generateQuestion = () => {
    if (dinosaurs.length < 3) return;

    const shuffled = [...dinosaurs].sort(() => 0.5 - Math.random());
    const selectedChoices = shuffled.slice(0, 3);
    const correctAnswer =
      selectedChoices[Math.floor(Math.random() * selectedChoices.length)];

    setQuestion(correctAnswer);
    setChoices(selectedChoices);
  };

  const handleGuess = async (selectedName) => {
    if (!question) return;

    if (selectedName === question.name) {
      await addPointsToUser(10);
    } else {
      setMessage(`Wrong. The correct answer was ${question.name}.`);
    }

    generateQuestion();
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setMessage("Logged out");
  };

  if (currentUser) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Welcome, {currentUser.username}!</h1>
        <p>Points: {currentUser.points}</p>

        <button onClick={logout}>Logout</button>

        <p>{message}</p>

        <h2>Guess the Dinosaur</h2>
        {question && (
          <div
            style={{
              border: "1px solid black",
              padding: "15px",
              marginBottom: "20px"
            }}
          >
            <p><strong>Clue:</strong> {question.clue}</p>
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleGuess(choice.name)}
                style={{ display: "block", margin: "10px 0" }}
              >
                {choice.name}
              </button>
            ))}
          </div>
        )}

        <h2>Your Unlocked Collection</h2>
        {unlockedDinos.length === 0 ? (
          <p>No dinosaurs unlocked yet.</p>
        ) : (
          unlockedDinos.map((dino) => (
            <div
              key={dino.id}
              style={{
                border: "1px solid green",
                margin: "10px 0",
                padding: "10px"
              }}
            >
              <h3>{dino.name}</h3>
              <p>{dino.description}</p>
              <p>Unlocked</p>
            </div>
          ))
        )}

        <h2>All Dinosaurs</h2>
        {dinosaurs.map((dino) => {
          const isUnlocked = unlockedDinos.some(
            (unlocked) => unlocked.id === dino.id
          );

          return (
            <div
              key={dino.id}
              style={{
                border: "1px solid black",
                margin: "10px 0",
                padding: "10px",
                opacity: isUnlocked ? 1 : 0.5
              }}
            >
              <h3>{dino.name}</h3>
              <p>{dino.description}</p>
              <p>Points needed: {dino.points_required}</p>
              <p>Status: {isUnlocked ? "Unlocked" : "Locked"}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>DinoDex Login</h1>

      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={signup}>Sign Up</button>
      <button onClick={login} style={{ marginLeft: "10px" }}>
        Login
      </button>

      <p>{message}</p>
    </div>
  );
}

export default App;