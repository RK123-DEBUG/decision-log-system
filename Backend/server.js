const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root route to check if the API is running and prevent "Cannot GET /" error
app.get('/', (req, res) => {
    res.send('Decision Log System API is running successfully on Render!');
});


// MongoDB Connection URI - Fetching from .env file
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('CRITICAL ERROR: MONGO_URI is not defined in .env file.');
    process.exit(1);
}

const { connectDB, User, Decision, Comment } = require('../Database/Server')(mongoose);

// Function to connect to the database and start the server
const startServer = async () => {
    await connectDB(mongoURI);

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const mapId = (doc) => {
    const obj = doc.toObject();
    obj.id = obj._id;
    return obj;
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// User Signup
app.post('/api/signup', async (req, res) => {
    const { name, contact } = req.body;
    if (!name || !contact) {
        return res.status(400).json({ error: "Name and contact are required" });
    }
    try {
        const savedUser = await new User({ name, contact }).save();
        res.status(201).json({ message: "User registered successfully", id: savedUser._id });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "User already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });
    try {
        const user = await User.findOne({ name: username });
        if (!user) return res.status(404).json({ error: "User not found. Please sign up." });
        res.status(200).json({ message: "Login successful", user: mapId(user) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Decision Routes ──────────────────────────────────────────────────────────

// GET all decisions (shared team view)
app.get('/api/decisions', async (req, res) => {
    try {
        const decisions = await Decision.find().sort({ _id: -1 });
        res.status(200).json(decisions.map(mapId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET decisions for a specific user
app.get('/api/decisions/:username', async (req, res) => {
    try {
        const decisions = await Decision.find({ username: req.params.username }).sort({ _id: -1 });
        res.status(200).json(decisions.map(mapId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add a new decision
app.post('/api/decisions', async (req, res) => {
    const { username, problem, alternatives, finalDecision, timestamp } = req.body;
    if (!username || !problem || !alternatives || !finalDecision) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const saved = await new Decision({
            username, problem, alternatives, finalDecision,
            timestamp: timestamp || new Date().toISOString()
        }).save();
        res.status(201).json(mapId(saved));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Comment Routes ───────────────────────────────────────────────────────────

// GET all comments for a decision
app.get('/api/decisions/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ decisionId: req.params.id }).sort({ _id: 1 });
        res.status(200).json(comments.map(mapId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add a comment to a decision
app.post('/api/decisions/:id/comments', async (req, res) => {
    const { username, comment } = req.body;
    if (!username || !comment) {
        return res.status(400).json({ error: "Username and comment are required" });
    }
    try {
        const saved = await new Comment({
            decisionId: req.params.id,
            username,
            comment
        }).save();
        res.status(201).json(mapId(saved));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Revision Routes ──────────────────────────────────────────────────────────

// POST suggest a revision on a decision
app.post('/api/decisions/:id/revisions', async (req, res) => {
    const { revisedBy, suggestion } = req.body;
    if (!revisedBy || !suggestion) {
        return res.status(400).json({ error: "revisedBy and suggestion are required" });
    }
    try {
        const decision = await Decision.findById(req.params.id);
        if (!decision) return res.status(404).json({ error: "Decision not found" });

        decision.revisions.push({ revisedBy, suggestion });
        await decision.save();

        res.status(201).json({ message: "Revision added", revisions: decision.revisions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Start ────────────────────────────────────────────────────────────────────
startServer();
