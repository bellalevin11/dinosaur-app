import { useCallback, useEffect, useState } from "react";
import "./App.css";
import DinoViewer from "./DinoViewer";

const USERNAME_ALLOWED_PATTERN = /^[A-Za-z0-9_]+$/;
const PASSWORD_MIN_LENGTH = 8;
const DINO_IMAGE_PATHS = {
  "Tyrannosaurus Rex": "/images/trex.jpg",
  Triceratops: "/images/triceratops.jpg",
  Stegosaurus: "/images/stegosaurus.jpg",
  Velociraptor: "/images/velociraptor.jpg"
};

const getDinoImagePath = (dino) => {
  if (dino.image_path) {
    if (dino.image_path.startsWith("/") || dino.image_path.startsWith("http")) {
      return dino.image_path;
    }

    if (dino.image_path.startsWith("images/")) {
      return `/${dino.image_path}`;
    }

    return `/images/${dino.image_path}`;
  }

  return DINO_IMAGE_PATHS[dino.name] || "";
};

function App() {
  // State variables to manage user and dinosaur data
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load saved user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setShowOnboarding(!hasSeenWelcome(parsedUser.id));
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

  const hasSeenWelcome = (userId) => {
    return localStorage.getItem(`dinoquest-welcome-seen-${userId}`) === "true";
  };

  const markWelcomeSeen = (userId) => {
    localStorage.setItem(`dinoquest-welcome-seen-${userId}`, "true");
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setMessage("");
    setIsError(false);
    setPassword("");
  };

  const getMissingFieldsMessage = () => {
    const missingUsername = username.trim().length === 0;
    const missingPassword = password.length === 0;

    if (missingUsername && missingPassword) {
      return "Username and password are required";
    }

    if (missingUsername) {
      return "Username is required";
    }

    if (missingPassword) {
      return "Password is required";
    }

    return "";
  };

  const getUsernameValidationMessage = () => {
    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return "Username must be 3-20 characters";
    }

    if (!USERNAME_ALLOWED_PATTERN.test(trimmedUsername)) {
      return "Username can only contain letters, numbers, and underscores";
    }

    return "";
  };

  const getPasswordValidationMessage = () => {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return "Password must be at least 8 characters";
    }

    return "";
  };

  const validateAuthFields = () => {
    const missingMessage = getMissingFieldsMessage();
    if (missingMessage) return missingMessage;

    const usernameMessage = getUsernameValidationMessage();
    if (usernameMessage) return usernameMessage;

    const passwordMessage = getPasswordValidationMessage();
    if (passwordMessage) return passwordMessage;

    return "";
  };

  const showValidationError = (validationMessage) => {
    setIsError(true);
    setMessage(validationMessage);
  };

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
    const validationMessage = validateAuthFields();

    if (validationMessage) {
      showValidationError(validationMessage);
      return;
    }

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
      setMessage("Account created! Log in to start exploring.");
      setAuthMode("login");
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
    const validationMessage = validateAuthFields();

    if (validationMessage) {
      showValidationError(validationMessage);
      return;
    }

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
        setMessage(res.status === 401 ? "Incorrect username or password" : text);
        return;
      }

      const data = JSON.parse(text);
      setCurrentUser(data);
      localStorage.setItem("currentUser", JSON.stringify(data));
      setShowOnboarding(!hasSeenWelcome(data.id));
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
  const generateQuestion = useCallback(() => {
    if (dinosaurs.length < 3) return;

    const shuffled = [...dinosaurs].sort(() => 0.5 - Math.random());
    const selectedChoices = shuffled.slice(0, 3);
    const correctAnswer =
      selectedChoices[Math.floor(Math.random() * selectedChoices.length)];

    setQuestion(correctAnswer);
    setChoices(selectedChoices);
  }, [dinosaurs]);

  // Generate a question if there are enough dinosaurs
  useEffect(() => {
    if (dinosaurs.length >= 3) {
      generateQuestion();
    }
  }, [dinosaurs, generateQuestion]);

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

  const startExploring = () => {
    if (currentUser) {
      markWelcomeSeen(currentUser.id);
    }

    setShowOnboarding(false);
    setMessage("");
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setShowOnboarding(false);
    setAuthMode("login");
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

  if (showOnboarding) {
    return (
      <div className="onboarding-page">
        <section className="onboarding-panel">
          <p className="eyebrow">First expedition</p>
          <h1>Welcome to DinoQuest</h1>
          <p className="onboarding-intro">
            Your collection starts here. Play quick challenges, earn points,
            and bring more dinosaurs into your prehistoric gallery.
          </p>

          <div className="onboarding-steps">
            <div className="onboarding-step">
              <span className="step-number">1</span>
              <p>Play minigames to earn points</p>
            </div>
            <div className="onboarding-step">
              <span className="step-number">2</span>
              <p>Use points to unlock dinosaurs</p>
            </div>
            <div className="onboarding-step">
              <span className="step-number">3</span>
              <p>Click unlocked dinosaurs to explore them in 3D</p>
            </div>
          </div>

          <button className="action-button onboarding-button" onClick={startExploring}>
            Start Exploring
          </button>
        </section>
      </div>
    );
  }

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
          <button className="logout-button" onClick={logout}>Logout</button>
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
                  {!unlocked && <div className="card-icon">🔒</div>}

                  <h3>{dino.name}</h3>

                  <div className="card-image-wrapper">
                    <img
                      src={getDinoImagePath(dino)}
                      alt={dino.name}
                      className={`card-image ${!unlocked ? "silhouette-image" : ""}`}
                    />
                  </div>

                  {!unlocked && (
                    <p>Unlock at {dino.points_required} points</p>
                  )}
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

            <button className="action-button" onClick={startGame}>Start Game</button>
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
          <div className="modal-content dino-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDinoModal}>
              X
            </button>

            <div className="dino-modal-header">
              <div>
                <p className="eyebrow">3D discovery</p>
                <h2>{selectedDino.name}</h2>
              </div>
              <p className="status unlocked">Unlocked</p>
            </div>

            <div className="dino-modal-body">
              <div className="viewer-panel">
                {selectedDino.model_path && (
                  <DinoViewer
                    modelPath={selectedDino.model_path}
                    scale={selectedDino.model_scale}
                    yOffset={selectedDino.model_y_offset}
                    rotationY={selectedDino.model_rotation_y}
                  />
                )}
                <p className="viewer-help">Drag around to rotate the dinosaur. Scroll to zoom in and out.</p>
              </div>

              <div className="dino-info-panel">
                <h3>Field Notes</h3>
                <p>{selectedDino.description}</p>
                <p><strong>Diet:</strong> {selectedDino.diet}</p>
                <p><strong>Period:</strong> {selectedDino.period}</p>
                <p><strong>Length:</strong> {selectedDino.length}</p>
                <p><strong>Habitat:</strong> {selectedDino.habitat}</p>
                <p><strong>Fun Fact:</strong> {selectedDino.fun_fact}</p>
                <p><strong>Unlock Requirement:</strong> {selectedDino.points_required} points</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  const isLoginMode = authMode === "login";
  const authTitle = isLoginMode
    ? "Welcome back to DinoQuest"
    : "Create your DinoQuest account";
  const authSubtitle = isLoginMode
    ? "Log in with your existing account to continue your dinosaur collection."
    : "New explorers can create an account before starting the first expedition.";
  const togglePrompt = isLoginMode
    ? "New to DinoQuest? Click Sign Up to get started."
    : "Already have a DinoQuest account?";

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <p className="eyebrow">{isLoginMode ? "Existing users" : "New users"}</p>
          <h1 className="auth-title">{authTitle}</h1>
          <p className="auth-subtitle">{authSubtitle}</p>
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

          {!isLoginMode && (
            <div className="requirements-panel">
              <p>Account requirements</p>
              <ul>
                <li>Username must be 3-20 characters</li>
                <li>Username can only contain letters, numbers, and underscores</li>
                <li>Password must be at least 8 characters</li>
              </ul>
            </div>
          )}

          <div className="auth-button-group">
            <button
              className="auth-button primary"
              onClick={isLoginMode ? login : signup}
              type="button"
            >
              {isLoginMode ? "Login" : "Create Account"}
            </button>
          </div>

          <div className="auth-switch-row">
            <span>{togglePrompt}</span>
            <button
              className="text-button"
              onClick={() => switchAuthMode(isLoginMode ? "signup" : "login")}
              type="button"
            >
              {isLoginMode ? "Sign Up" : "Back to Login"}
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
