# Decision Log System

A comprehensive web application designed for teams to manage, log, and track technical decisions. The system allows users to create accounts, log the problems they face, list alternatives examined, and record final decisions. Team members can view all decisions, suggest revisions, and add comments to foster collaboration.

## 🚀 Live Demo
**Web Application:** [https://decision-log-system.vercel.app/]
**API Server:** [https://decision-log-system.onrender.com](https://decision-log-system.onrender.com)

## Features

- **User Authentication:** Secure signup and login system.
- **Decision Management:** Log new decisions with clear definitions of the problem, alternatives considered, and the final choice.
- **Team Collaboration:** 
  - View all decisions made by the team or filter by "My Decisions".
  - Add comments to any decision.
  - Suggest revisions to decisions logged by others.
- **Responsive UI:** A clean, modern interface built with HTML, CSS, and Vanilla JavaScript.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (using Mongoose ODM)

## Project Structure

```
decision-log-system/
│
├── Backend/               # Express server and API routes
│   ├── package.json       # Node.js dependencies and scripts
│   ├── server.js          # Main entry point for the backend server
│   └── .env               # Environment variables (needs to be created)
│
├── Database/              # Database models and connection logic
│   └── Server.js          # Mongoose connection setup and Schema definitions
│
├── Frontend/              # Client-side files
│   ├── index.html         # Main HTML file containing all UI views
│   ├── style.css          # Styling for the application
│   ├── script.js          # Frontend logic (API calls, DOM manipulation)
│   └── images/            # Directory for any application images
│
└── start-backend.bat      # Windows batch file to quickly start the backend
```

## Prerequisites

Before running this project, make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or a MongoDB Atlas URI)

## Installation & Setup

### 1. Clone the repository
(If you haven't already downloaded the source code)
```bash
git clone <repository-url>
cd decision-log-system
```

### 2. Set up the Backend
Navigate to the Backend directory and install dependencies:
```bash
cd Backend
npm install
```

### 3. Configure Environment Variables
In the `Backend` directory, create a `.env` file (if it doesn't exist) and add the following configuration:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/decision_log_db
```
*Note: Replace the `MONGO_URI` with your actual MongoDB connection string if you are using MongoDB Atlas or a different local port.*

### 4. Start the Backend Server
You can start the backend server by running:
```bash
npm start
```
*Alternatively, if you are on Windows, you can double-click the `start-backend.bat` file in the root directory.*

You should see a message in the console indicating the server is running on `http://localhost:3000` and connected to MongoDB.

### 5. Start the Frontend
The frontend consists of static files. You can run it in two ways:
- **Simple:** Just double-click on `Frontend/index.html` to open it directly in your web browser.
- **Better Experience:** Use a local development server like the "Live Server" extension in VS Code to serve the `Frontend` folder. This helps avoid CORS issues and automatically refreshes on changes.

## Usage Guide

1. **Sign Up:** Open the app and click on "Sign Up". Provide your Name and Contact Number.
2. **Login:** Use the name you registered with to log in.
3. **Log a Decision:** Once logged in, fill out the form under "Log a New Decision". You need to specify the Problem, Alternatives, and Final Decision.
4. **View Decisions:** Toggle between "My Decisions" (only decisions you logged) and "All Team Decisions" to see what your colleagues are working on.
5. **Interact:** In the "All Team Decisions" view, you can click on any decision to read it in detail, add comments, or suggest revisions.

## API Endpoints Overview

The backend provides several RESTful API endpoints:
- `POST /api/signup` - Register a new user
- `POST /api/login` - Authenticate a user
- `GET /api/decisions` - Fetch all decisions (Team View)
- `GET /api/decisions/:username` - Fetch decisions by a specific user
- `POST /api/decisions` - Create a new decision
- `GET /api/decisions/:id/comments` - Fetch comments for a specific decision
- `POST /api/decisions/:id/comments` - Add a comment to a decision
- `POST /api/decisions/:id/revisions` - Suggest a revision to a decision

---
*Developed as a team project for managing technical decisions.*
