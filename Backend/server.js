const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection URI - Fetching from .env file
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB successfully.'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    contact: { type: String, required: true }
});

const decisionSchema = new mongoose.Schema({
    username: { type: String, required: true },
    problem: { type: String, required: true },
    alternatives: { type: String, required: true },
    finalDecision: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() }
});

const User = mongoose.model('User', userSchema);
const Decision = mongoose.model('Decision', decisionSchema);

// User Signup
app.post('/api/signup', async (req, res) => {
    const { name, contact } = req.body;
    if (!name || !contact) {
        return res.status(400).json({ error: "Name and contact are required" });
    }

    try {
        const newUser = new User({ name, contact });
        const savedUser = await newUser.save();
        
        // Map _id to id so frontend script.js continues to work
        res.status(201).json({ 
            message: "User registered successfully", 
            id: savedUser._id 
        });
    } catch (err) {
        if (err.code === 11000) { // MongoDB duplicate key error code
            return res.status(400).json({ error: "User already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ error: "User not found. Please sign up." });
        }
        
        // Return object with mapped id
        const userObj = user.toObject();
        userObj.id = userObj._id;
        
        res.status(200).json({ message: "Login successful", user: userObj });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Decisions for User
app.get('/api/decisions/:username', async (req, res) => {
    const username = req.params.username;
    
    try {
        const decisions = await Decision.find({ username }).sort({ _id: -1 });
        
        // Map _id to id for the frontend
        const mappedDecisions = decisions.map(d => {
            const doc = d.toObject();
            doc.id = doc._id;
            return doc;
        });
        
        res.status(200).json(mappedDecisions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Decision
app.post('/api/decisions', async (req, res) => {
    const { username, problem, alternatives, finalDecision, timestamp } = req.body;
    
    if (!username || !problem || !alternatives || !finalDecision) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newDecision = new Decision({
            username,
            problem,
            alternatives,
            finalDecision,
            timestamp: timestamp || new Date().toISOString()
        });
        
        const savedDecision = await newDecision.save();
        
        // Map _id to id for the frontend
        const decisionObj = savedDecision.toObject();
        decisionObj.id = decisionObj._id;
        
        res.status(201).json(decisionObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
