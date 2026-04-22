# 🦖 DinoQuest

An interactive full-stack dinosaur learning game where users can explore, play, and unlock dinosaurs through engaging minigames and immersive visuals.

---

## 🚀 Overview

DinoQuest is a full-stack web application that combines education and gameplay. Users can create an account, earn points through minigames, and unlock dinosaurs to build their collection. Each dinosaur includes detailed information and an interactive 3D model, creating a more engaging and exploratory experience.

This project was **originally developed as part of a university web development course**, and was later expanded and refined as a personal portfolio project to showcase full-stack development, interactive UI design, and creative features.

---

## ✨ Features

### 🔐 Authentication

- User signup, login, and logout
- Passwords securely hashed using bcrypt
- Persistent user data stored in PostgreSQL

### 🎮 Minigames

- **Guess the Dinosaur** – Identify dinosaurs based on clues
- **Dino Speed Quiz** – Timed challenge to answer as many questions as possible

### 🏆 Progression System

- Earn points for correct answers
- Unlock dinosaurs based on point thresholds
- Locked vs unlocked visual states

### 🦖 Dinosaur Collection

- View all dinosaurs in a structured grid
- Locked dinosaurs appear as silhouettes
- Unlocked dinosaurs are fully visible and clickable

### 🌍 Habitat Map (Creative Feature)

- Interactive world map showing where dinosaurs lived
- Clean layout using arrows pointing to geographic locations
- Locked dinosaurs appear as silhouettes
- Unlocked dinosaurs can be clicked to view details

### 🧊 3D Dinosaur Viewer (Creative Feature)

- Built with React Three Fiber (Three.js)
- Interactive `.glb` models for each dinosaur
- Users can rotate, zoom, and explore models
- Custom scaling and positioning per model

---

## 🧠 Tech Stack

### Frontend

- React
- CSS (custom styling, responsive layout)
- React Three Fiber / Drei (3D rendering)

### Backend

- Node.js
- Express.js (API routes, server logic)

### Database

- PostgreSQL (persistent storage)

### Other

- bcrypt (password hashing)
- REST API architecture

---

## 🔄 How It Works

1. Users interact with the **React frontend**
2. React sends requests to the **Express backend**
3. Express processes logic and queries the **PostgreSQL database**
4. Data is returned to React and the UI updates dynamically

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/dinoquest.git
cd dinoquest
```
