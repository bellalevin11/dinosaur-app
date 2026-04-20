[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/GCBfbKeb)

# CSE3300 Creative Project

Bella Levin 508725 bellalevin11

<br><br><br>

## Creative Portion

For the creative portion of this project, I focused on making the dinosaur experience more interactive and visually engaging. I implemented two main features: an interactive habitat map and 3D dinosaur models using React Three Fiber.

### 🌍 Dinosaur Habitat Map

I created a map feature that allows users to view where each dinosaur lived geographically. This is accessible through a “Map” button in the collection panel, which opens a modal displaying a world map.

Each of the dinosaurs are shown on the map roughly in the location where they were originally found.

The map also integrates with the game’s progression system:

- **Unlocked dinosaurs** appear with their full image and can be clicked to view more details.
- **Locked dinosaurs** appear as silhouettes with a visual “locked” state, reinforcing progression and encouraging continued gameplay.

This feature adds a spatial and exploratory element to the app, helping users connect dinosaurs to real-world locations in an intuitive way.

### 🦖 3D Dinosaur Models (React Three Fiber)

To enhance the learning experience, I integrated 3D dinosaur models using **React Three Fiber**, a React-based library for rendering 3D graphics with Three.js.

Each unlocked dinosaur can be opened in a modal that includes:

- A fully rendered `.glb` 3D model
- Interactive camera controls (zoom, rotate, inspect)
- Dynamically adjusted scale, position, and rotation per model

Because each model had different proportions, I implemented custom parameters (scale, offsets, rotation) stored in the database and applied dynamically in the viewer. This ensured each dinosaur is displayed clearly and consistently.

This feature transforms the app from a simple information viewer into an interactive experience, allowing users to explore dinosaurs in a more immersive way.

---

# AI Reflection

Answer the following questions below

## Before Coding

- **What is the goal of this assignment?**  
  The goal of this assignment is to build a creative web application using at least one new framework. For my project, I created an interactive dinosaur learning game where users can sign up, log in, play minigames, earn points, unlock dinosaurs, and explore them through 3D models.

- **When will you use AI, and when will you avoid it?**  
  I will use AI mainly for conceptual understanding, debugging, and step-by-step setup help when working with technologies that are newer to me, especially React, Express, PostgreSQL, bcrypt, and React Three Fiber. I will avoid using AI as a full code generator for the entire project because I still needed to understand how the pieces are connected.

- **What conceptual questions did you ask the AI?**  
  I asked conceptual questions about how Express and Node.js work in a client-server project, how PostgreSQL differs from MySQL, how to structure a client and server project in VS Code, how bcrypt hashing works for signup and login, what security issues I should fix, and I used it as an idea generator.

## During Development

- **Paste your three most useful AI prompts.**
  1. `what should i know about express and node.js backend for building a client server project`
  2. `whats different between postgresql and mysql`
  3. `give me instructions to hash my signup and login with bcrypt`

- **What was the AI’s response? (Summarize.)**  
  The AI explained that Express works as the backend layer between the frontend and the database, and helped me understand ideas like routes, middleware, JSON APIs, and error handling. It also explained that PostgreSQL and MySQL are both relational databases, but PostgreSQL is stricter and has more powerful for complex queries. For bcrypt, it gave me step-by-step guidance on how to hash passwords at signup and compare hashed passwords during login instead of checking plain text values.

- **What did you change in the AI’s output, and why?**  
  I changed a lot of the AI’s output so it matched my project structure and assignment better. For example, I adjusted backend routes to fit my actual dinosaur game logic and updated some suggested frontend structures so they worked with my current state variables and modals. I also simplified some of the AI’s explanations and code so I could actually understand and maintain it myself.

- **What worked and what did not? (Be specific.)**  
  The conceptual explanations worked really well, especially for understanding the relationship between React, Express, and PostgreSQL. The bcrypt instructions were also useful because they were concrete enough to implement directly with only small edits. What did not work as well was using AI for complex UI or 3D features. For example, some generated styling conflicted with my existing CSS, and some React Three Fiber suggestions needed lots of manual debugging because different `.glb` files had very different scales, positions, and rotations.

## After Completion

- **What errors did the AI make that you caught?**  
  The AI sometimes generated code that did not fit my exact files without some editing on my part. It also occasionally gave styling that conflicted with older CSS rules, which caused layout problems until I cleaned it up manually.

- **What debugging or testing did you do?**  
  I tested my server routes in the browser and through the app, checked PostgreSQL tables directly with `SELECT` and `UPDATE` queries, and verified that signup, login, points, unlocks, and dinosaur data were saving correctly. I also tested modals, map features, minigames, and the 3D viewer repeatedly in the browser, including checking image and model file paths directly through `localhost`. For styling and layout issues, I used browser inspection tools and manually adjusted CSS until the interface looked right.

- **What did you understand better because of the AI?**  
  I understand the full-stack flow much better now: the client sends requests, the Express server handles logic, PostgreSQL stores persistent data, and React updates the UI based on the returned data.

- **What would you change about how you use AI next time?**  
  Next time I would still use AI for planning, conceptual help, and debugging, but I would rely on it less for large UI rewrites or styling changes all at once. Those were usually easier to manage when I asked for smaller, more targeted changes.

### Submit your AI Interaction log

- Your CSE_3300_AI_LOG.md file should include copy-pasted prompts and responses from any AI tools you used in CSE_3300_AI_LOG.md file.

# Rubric

## Rubric Submission

| Title                                       | Possible Points |
| ------------------------------------------- | --------------- |
| Rubric committed on time and approved by TA | 5               |

---

## Languages / Frameworks Used

| Title                                           | Possible Points |
| ----------------------------------------------- | --------------- |
| Learned/Used React frontend                     | 10              |
| Learned/Used Express (Node.js) backend          | 10              |
| Used PostgreSQL database for persistent storage | 5               |

---

## Functionality

| Title                                                               | Possible Points |
| ------------------------------------------------------------------- | --------------- |
| Users can register, login, and logout with persistent account data  | 10              |
| Users can view dinosaurs and access detailed information pages      | 10              |
| Users can play at least one minigame with correct answer evaluation | 10              |
| Users earn points and unlock dinosaurs based on thresholds          | 10              |
| Users can view unlocked dinosaur collection (locked vs unlocked)    | 5               |

---

## Best Practices

| Title                               | Possible Points |
| ----------------------------------- | --------------- |
| Code is readable and well formatted | 3               |
| All pages pass the HTML validator   | 2               |

---

## Creative Portion

| Title                | Possible Points |
| -------------------- | --------------- |
| Creative Portion TBD | 20              |

---

# Total Points

100

Rubric Approved by Cheng
