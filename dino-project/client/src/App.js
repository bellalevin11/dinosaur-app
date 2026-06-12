import { useCallback, useEffect, useState } from "react";
import "./App.css";
import DinoViewer from "./DinoViewer";

const USERNAME_ALLOWED_PATTERN = /^[A-Za-z0-9_]+$/;
const PASSWORD_MIN_LENGTH = 8;
const SPEED_QUIZ_DURATION = 30;
const DINO_IMAGE_PATHS = {
  "Tyrannosaurus Rex": "/images/trex.jpg",
  Triceratops: "/images/triceratops.jpg",
  Stegosaurus: "/images/stegosaurus.jpg",
  Velociraptor: "/images/velociraptor.jpg"
};

const dinoMapPositions = {
  Velociraptor: { top: "42%", left: "74%" },
  Triceratops: { top: "31%", left: "17%" },
  "Tyrannosaurus Rex": { top: "39%", left: "20.5%" },
  Stegosaurus: { top: "47%", left: "16.5%" },
  Ankylosaurus: { top: "50%", left: "24%" },
  Brachiosaurus: { top: "41.5%", left: "25.5%" }
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

const getSpeedQuizClue = (dino) => {
  const rawClue = dino.fun_fact || dino.description || dino.clue || "";
  const escapedName = dino.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Add support for "T-Rex" by checking for variations
  const nameVariations = [
    escapedName,
    "T-Rex", // Common shorthand for Tyrannosaurus Rex
    "Tyrannosaurus" // Full name as listed in the server
  ];

  const regex = new RegExp(nameVariations.join("|"), "gi");
  return rawClue.replace(regex, "This dinosaur");
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
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isSpeedInstructionsOpen, setIsSpeedInstructionsOpen] = useState(false);
  const [isSpeedGameOpen, setIsSpeedGameOpen] = useState(false);
  const [speedTimeLeft, setSpeedTimeLeft] = useState(SPEED_QUIZ_DURATION);
  const [speedQuestion, setSpeedQuestion] = useState(null);
  const [speedChoices, setSpeedChoices] = useState([]);
  const [speedScore, setSpeedScore] = useState(0);
  const [isSpeedGameOver, setIsSpeedGameOver] = useState(false);
  const [isSpeedTimerRunning, setIsSpeedTimerRunning] = useState(false);
  const [speedFeedback, setSpeedFeedback] = useState("");
  const [speedRewardPoints, setSpeedRewardPoints] = useState(0);
  const [speedRewardAwarded, setSpeedRewardAwarded] = useState(false);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/dinosaurs`);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/unlocked/${userId}`);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/add-points`, {
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

      const unlockRes = await fetch(`${import.meta.env.VITE_API_URL}/check-unlocks`, {
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

  const generateSpeedQuestion = useCallback(() => {
    if (dinosaurs.length < 4) {
      setSpeedQuestion(null);
      setSpeedChoices([]);
      setSpeedFeedback("Dino Speed Quiz needs at least 4 dinosaurs.");
      return;
    }

    const shuffled = [...dinosaurs].sort(() => 0.5 - Math.random());
    const correctAnswer = shuffled[0];
    const wrongAnswers = shuffled
      .filter((dino) => dino.id !== correctAnswer.id)
      .slice(0, 3);
    const answerChoices = [...wrongAnswers, correctAnswer].sort(
      () => 0.5 - Math.random()
    );

    setSpeedQuestion({
      answerId: correctAnswer.id,
      clue: getSpeedQuizClue(correctAnswer)
    });
    setSpeedChoices(answerChoices);
  }, [dinosaurs]);

  const awardSpeedQuizReward = useCallback(async () => {
    if (!currentUser) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/speed-quiz-reward`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUser.id,
          quizScore: Number(speedScore)
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (errorText.includes("Cannot POST /speed-quiz-reward")) {
          throw new Error("Backend route /speed-quiz-reward is not running. Restart the Express server.");
        }

        if (errorText.trim().startsWith("<!DOCTYPE html>")) {
          throw new Error("Backend returned an HTML error page. Check the Express server route.");
        }

        throw new Error(errorText || "Could not award speed quiz points");
      }

      const data = await res.json();
      setCurrentUser(data.user);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setSpeedRewardPoints(data.rewardPoints);
      await fetchUnlocked(data.user.id);

      if (data.unlocked && data.unlocked.length > 0) {
        setMessage(`Speed quiz complete! You earned ${data.rewardPoints} points and unlocked a new dinosaur!`);
      } else {
        setMessage(`Speed quiz complete! You earned ${data.rewardPoints} points.`);
      }
    } catch (err) {
      console.error(err);
      setSpeedFeedback(err.message || "Could not award speed quiz points.");
    }
  }, [currentUser, speedScore]);

  useEffect(() => {
    if (!isSpeedTimerRunning || isSpeedGameOver) return;

    const intervalId = setInterval(() => {
      setSpeedTimeLeft((timeLeft) => Math.max(timeLeft - 1, 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isSpeedTimerRunning, isSpeedGameOver]);

  useEffect(() => {
    if (!isSpeedTimerRunning || speedTimeLeft > 0 || speedRewardAwarded) return;

    setIsSpeedTimerRunning(false);
    setIsSpeedGameOver(true);
    setSpeedRewardAwarded(true);
    setSpeedQuestion(null);
    setSpeedChoices([]);
    awardSpeedQuizReward();
  }, [
    awardSpeedQuizReward,
    isSpeedTimerRunning,
    speedRewardAwarded,
    speedTimeLeft
  ]);

  const openSpeedInstructions = () => {
    setIsSpeedInstructionsOpen(true);
  };

  const closeSpeedInstructions = () => {
    setIsSpeedInstructionsOpen(false);
  };

  const startSpeedQuiz = () => {
    setIsSpeedInstructionsOpen(false);
    setIsSpeedGameOpen(true);
    setSpeedTimeLeft(SPEED_QUIZ_DURATION);
    setSpeedScore(0);
    setSpeedRewardPoints(0);
    setSpeedFeedback("");
    setIsSpeedGameOver(false);
    setSpeedRewardAwarded(false);
    generateSpeedQuestion();
    setIsSpeedTimerRunning(true);
  };

  const closeSpeedQuiz = () => {
    setIsSpeedGameOpen(false);
    setIsSpeedTimerRunning(false);
    setSpeedQuestion(null);
    setSpeedChoices([]);
    setSpeedFeedback("");
  };

  const handleSpeedAnswer = (selectedDinoId) => {
    if (!speedQuestion || isSpeedGameOver || !isSpeedTimerRunning) return;

    if (selectedDinoId === speedQuestion.answerId) {
      setSpeedScore((score) => score + 1);
      setSpeedFeedback("Correct!");
    } else {
      setSpeedFeedback("Not quite. Next one!");
    }

    generateSpeedQuestion();
  };

  const openMapModal = () => {
    setIsMapOpen(true);
  };

  const closeMapModal = () => {
    setIsMapOpen(false);
  };

  const openDinoModal = (dino) => {
    setSelectedDino(dino);
    setIsModalOpen(true);
  };

  const openDinoFromMap = (dino) => {
    setIsMapOpen(false);
    openDinoModal(dino);
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
              <span>+10 each</span>
            </button>
            <button className="minigame-button" onClick={openSpeedInstructions}>
              <span>Dino Speed Quiz</span>
              <span>+5 each</span>
            </button>
          </div>

          <p className="message">{message}</p>
        </div>

        <div className="collection-panel">
          <div className="collection-header">
            <h2>Dinosaur Collection</h2>
            <button className="map-button" onClick={openMapModal}>
              Map
            </button>
          </div>

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

      {isSpeedInstructionsOpen && (
        <div className="modal-overlay" onClick={closeSpeedInstructions}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeSpeedInstructions}>
              X
            </button>

            <h2>Dino Speed Quiz</h2>
            <p>You will have <strong>30 seconds</strong>.</p>
            <p>Answer as many dinosaur questions as possible before time runs out.</p>
            <p>Each correct answer increases your score.</p>
            <p>When time runs out, you earn <strong>5 points</strong> for each correct answer.</p>

            <button className="action-button" onClick={startSpeedQuiz}>Start Quiz</button>
          </div>
        </div>
      )}

      {isSpeedGameOpen && (
        <div className="modal-overlay" onClick={closeSpeedQuiz}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeSpeedQuiz}>
              X
            </button>

            <h2>Dino Speed Quiz</h2>

            <div className="speed-quiz-stats">
              <p className="points-badge">Time: {speedTimeLeft}s</p>
              <p className="points-badge">Score: {speedScore}</p>
            </div>

            {isSpeedGameOver ? (
              <div className="speed-results">
                <h3>Time's up!</h3>
                <p>Final score: {speedScore}</p>
                <p>Reward earned: {speedRewardPoints} points</p>
                <div className="speed-result-actions">
                  <button onClick={startSpeedQuiz}>Play Again</button>
                  <button className="logout-button" onClick={closeSpeedQuiz}>Close</button>
                </div>
              </div>
            ) : (
              <div className="game-card">
                {speedQuestion && (
                  <p>
                    <strong>Clue:</strong> {speedQuestion.clue}
                  </p>
                )}

                <div className="speed-answer-grid">
                  {speedChoices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleSpeedAnswer(choice.id)}
                      className="speed-answer-tile"
                    >
                      <img
                        src={getDinoImagePath(choice)}
                        alt={choice.name}
                        className="speed-answer-image"
                      />
                      <span>{choice.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {speedFeedback && <p className="message">{speedFeedback}</p>}
          </div>
        </div>
      )}

      {isMapOpen && (
        <div className="modal-overlay" onClick={closeMapModal}>
          <div className="modal-content map-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMapModal}>
              X
            </button>

            <div className="map-modal-header">
              <p className="eyebrow">Habitats</p>
              <h2>Dinosaur Habitat Map</h2>
              <p>Unlocked dinosaurs can be opened from the map. Locked dinosaurs stay as silhouettes.</p>
            </div>

            <div className="map-container">
              <img
                src="/images/world-map.jpg"
                alt="World map"
                className="map-background"
              />

              {dinosaurs.map((dino) => {
                const position = dinoMapPositions[dino.name];

                if (!position) {
                  return null;
                }

                const unlocked = unlockedDinos.some(
                  (unlockedDino) => unlockedDino.id === dino.id
                );
                const markerImagePath = getDinoImagePath(dino);

                return (
                  <button
                    key={dino.id}
                    className={`map-marker ${unlocked ? "unlocked-marker" : "locked-marker"}`}
                    style={{ top: position.top, left: position.left }}
                    onClick={unlocked ? () => openDinoFromMap(dino) : undefined}
                    type="button"
                    disabled={!unlocked}
                    aria-label={`${dino.name} ${unlocked ? "unlocked" : "locked"}`}
                  >
                    {markerImagePath ? (
                      <img
                        src={markerImagePath}
                        alt=""
                        className="map-marker-image"
                      />
                    ) : (
                      <span className="map-marker-initial">
                        {dino.name.charAt(0)}
                      </span>
                    )}
                    <span className="map-marker-label">
                      {unlocked ? dino.name : `${dino.name} · Locked`}
                    </span>
                  </button>
                );
              })}
            </div>
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
