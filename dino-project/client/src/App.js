import { useEffect, useState } from "react";
import "./App.css";
import DinoViewer from "./DinoViewer";

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
  const [selectedDino, setSelectedDino] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isError, setIsError] = useState(false);

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

  // Fetch unlocked dinosaurs for the current user
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

  // Sign up a new user
  const signup = async () => {
    try {
      const res = await fetch("http://localhost:5001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const text = await res.text();

      if (!res.ok) {
        setIsError(true);
        setMessage(text);
        return;
      }

      setIsError(false);
      setMessage("Signup successful! You can now log in.");
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Something went wrong. Try again.");
    }
  };

  // Login a user
  const login = async () => {
    try {
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const text = await res.text();

      if (!res.ok) {
        setIsError(true);
        setMessage(text);
        return;
      }

      const data = JSON.parse(text);
      setCurrentUser(data);
      localStorage.setItem("currentUser", JSON.stringify(data));
      setIsError(false);
      setMessage("Login successful");
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Something went wrong. Try again.");
    }
  };

  // Add points to the current user
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

  // Generate a question
  const generateQuestion = () => {
    if (dinosaurs.length < 3) return;

    const shuffled = [...dinosaurs].sort(() => 0.5 - Math.random());
    const selectedChoices = shuffled.slice(0, 3);
    const correctAnswer =
      selectedChoices[Math.floor(Math.random() * selectedChoices.length)];

    setQuestion(correctAnswer);
    setChoices(selectedChoices);
  };

  // Handle a guess
  const handleGuess = async (selectedName) => {
    if (!question) return;

    if (selectedName === question.name) {
      await addPointsToUser(10);
      setMessage("Correct! You earned 10 points.");
    } else {
      setMessage(`Wrong. The correct answer was ${question.name}.`);
    }

    generateQuestion();
  };

  const openDinoModal = (dino) => {
    setSelectedDino(dino);
    setIsModalOpen(true);
  };

  const closeDinoModal = () => {
    setSelectedDino(null);
    setIsModalOpen(false);
  };

  const openInstructions = () => {
    setIsInstructionsOpen(true);
  };

  const closeInstructions = () => {
    setIsInstructionsOpen(false);
  };

  const startGame = () => {
    setIsInstructionsOpen(false);
    generateQuestion();
    setIsGameOpen(true);
  };

  const closeGame = () => {
    setIsGameOpen(false);
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setMessage("Logged out");
  };

  if (currentUser) {
  const totalDinosaurs = dinosaurs.length;
  const unlockedCount = unlockedDinos.length;
  const remainingCount = totalDinosaurs - unlockedCount;
  const completionPercentage =
    totalDinosaurs > 0
      ? Math.round((unlockedCount / totalDinosaurs) * 100)
      : 0;

  return (
    <div className="app">
      <div className="dashboard-navbar">
        <div className="navbar-left">
          <h1 className="dashboard-title">DinoQuest</h1>

          <div className="user-info">
            👤 {currentUser.username}
          </div>
        </div>

        <div className="navbar-right">
          <div className="points-badge">🦖 {currentUser.points}</div>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <h3>Unlocked</h3>
          <p>{unlockedCount}</p>
        </div>

        <div className="stat-card">
          <h3>Remaining</h3>
          <p>{remainingCount}</p>
        </div>

        <div className="stat-card">
          <h3>Games Played</h3>
          <p>--</p>
        </div>

        <div className="stat-card">
          <h3>Completion</h3>
          <p>{completionPercentage}%</p>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="minigames-panel">
          <h2>Minigames</h2>

          <div className="progress-section">
            <p>
              Progress: {unlockedCount} / {totalDinosaurs} dinosaurs unlocked
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="minigame-button-list">
            <button className="minigame-button" onClick={openInstructions}>
              <span>Guess the Dinosaur</span>
              <span>+10</span>
            </button>
          </div>

          <p className="message">{message}</p>
        </div>

        <div className="collection-panel">
          <h2>Dinosaur Collection</h2>

          <div className="collection-grid">
            {dinosaurs.map((dino) => {
              const unlocked = unlockedDinos.some(
                (unlockedDino) => unlockedDino.id === dino.id
              );

              return (
                <div
                  key={dino.id}
                  className={`collection-card ${unlocked ? "clickable-card unlocked-card" : "locked-card"}`}
                  onClick={unlocked ? () => openDinoModal(dino) : undefined}
                >
                  {!unlocked && (
                    <div className="card-icon">🔒</div>
                  )}

                  <h3>{unlocked ? dino.name : "???"}</h3>
                  <p>{unlocked ? (dino.diet || dino.description) : "Mystery dinosaur"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isInstructionsOpen && (
        <div className="modal-overlay" onClick={closeInstructions}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeInstructions}>
              X
            </button>

            <h2>Guess the Dinosaur</h2>
            <p>
              You will be shown a clue about a dinosaur. Choose the correct
              dinosaur from the answer choices.
            </p>
            <p>
              Each correct answer earns <strong>10 points</strong>.
            </p>
            <p>Use your points to unlock more dinosaurs in your collection.</p>

            <button onClick={startGame}>Start Game</button>
          </div>
        </div>
      )}

      {isGameOpen && (
        <div className="modal-overlay" onClick={closeGame}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeGame}>
              X
            </button>

            <h2>Guess the Dinosaur</h2>
            <p className="points-badge">🦖 {currentUser.points} Points</p>

            {question && (
              <div className="game-card">
                <p>
                  <strong>Clue:</strong> {question.clue}
                </p>

                {choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleGuess(choice.name)}
                    className="choice-button"
                  >
                    {choice.name}
                  </button>
                ))}
              </div>
            )}

            <p className="message">{message}</p>
          </div>
        </div>
      )}

      {isModalOpen && selectedDino && (
        <div className="modal-overlay" onClick={closeDinoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDinoModal}>
              X
            </button>

            <h2>{selectedDino.name}</h2>

            {selectedDino.model_path && (
              <DinoViewer
                modelPath={selectedDino.model_path}
                scale={selectedDino.model_scale}
                yOffset={selectedDino.model_y_offset}
              />
            )}

            <p>{selectedDino.description}</p>
            <p>Points needed: {selectedDino.points_required}</p>
            <p className="status unlocked">Unlocked</p>
          </div>
        </div>
      )}
    </div>
  );
}

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">DinoQuest</h1>
          <p className="auth-subtitle">
            Unlock dinosaurs by playing prehistoric minigames
          </p>
        </div>

        <div className="auth-form">
          <label className="auth-label">Username</label>
          <input
            className="auth-input"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="auth-button-group">
            <button className="auth-button secondary" onClick={signup}>
              Sign Up
            </button>
            <button className="auth-button primary" onClick={login}>
              Login
            </button>
          </div>

          {message && (
            <p className={`message ${isError ? "error" : "success"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;