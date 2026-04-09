import { useEffect, useState } from "react";

function App() {
  // State variables to manage user and dinosaur data
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [dinosaurs, setDinosaurs] = useState([]);
  const [unlockedDinos, setUnlockedDinos] = useState([]);

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

  const addPoints = async () => {
    try {
      const res = await fetch("http://localhost:5001/add-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUser.id,
          pointsToAdd: 10
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
        setMessage("New dinosaur unlocked!");
      } else {
        setMessage("Added 10 points");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error adding points");
    }
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

        <button onClick={addPoints}>Earn 10 Points</button>
        <button onClick={logout} style={{ marginLeft: "10px" }}>
          Logout
        </button>

        <p>{message}</p>

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