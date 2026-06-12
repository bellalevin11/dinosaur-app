# DinoQuest

An interactive full-stack dinosaur learning game where users can explore, play, and unlock dinosaurs through engaging minigames and immersive visuals.

## Live Demo

https://fearless-dream-production-e909.up.railway.app/

## Overview

DinoQuest is a full-stack web application that combines education and gameplay. Users can create an account, earn points through minigames, and unlock dinosaurs to build their collection. Each dinosaur includes detailed information and an interactive 3D model, creating a more engaging and exploratory experience.

This project was originally developed as part of a university web development course and was later expanded and refined as a personal portfolio project to showcase full-stack development, interactive UI design, and creative features.

## Features

### Authentication

- User signup, login, and logout
- Passwords securely hashed using bcrypt
- Persistent user data stored in PostgreSQL

### Minigames

- Guess the Dinosaur — Identify dinosaurs based on clues
- Dino Speed Quiz — Timed challenge to answer as many questions as possible

### Progression System

- Earn points for correct answers
- Unlock dinosaurs based on point thresholds
- Locked vs. unlocked visual states

### Dinosaur Collection

- View all dinosaurs in a structured grid
- Locked dinosaurs appear as silhouettes
- Unlocked dinosaurs are fully visible and clickable

### Habitat Map

- Interactive world map showing where dinosaurs lived
- Geographic locations displayed visually
- Locked dinosaurs appear as silhouettes
- Unlocked dinosaurs can be clicked to view details

### 3D Dinosaur Viewer

- Built with React Three Fiber and Three.js
- Interactive .glb models for each dinosaur
- Users can rotate, zoom, and explore models
- Custom scaling and positioning per model

## Tech Stack

### Frontend

- React
- CSS
- React Three Fiber
- Drei
- Three.js

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

### Other Tools

- bcrypt
- REST API architecture
- Railway deployment platform

## Application Architecture

1. Users interact with the React frontend.
2. React sends API requests to the Express backend.
3. Express processes requests and queries PostgreSQL.
4. Data is returned to React and the UI updates dynamically.

## Local Installation

### Clone the Repository

bash git clone https://github.com/bellalevin11/dinosaur-app.git cd dinosaur-app/dino-project

### Install Dependencies

bash npm install cd client npm install cd ../server npm install

### Configure PostgreSQL

Create a PostgreSQL database and update the server database configuration.

### Start the Backend

bash cd server npm start

### Start the Frontend

bash cd client npm start

### Open the Application

text http://localhost:3000

## Educational Background

This application was originally created for a university web development course and later migrated to a personal GitHub repository. Additional improvements were made to the user experience, deployment process, and project documentation to serve as a portfolio-quality full-stack application.

## Author

Bella Levin
