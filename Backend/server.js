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

if (!mongoURI) {
    console.error('CRITICAL ERROR: MONGO_URI is not defined in .env file.');
    process.exit(1);
}

// Function to connect to the database and start the server
const startServer = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('FATAL ERROR: Could not connect to MongoDB.');
        console.error('Details:', err.message);
        console.log('\nTroubleshooting Tips:');
        console.log('1. Ensure MongoDB is installed and running (run "mongod").');
        console.log('2. Check if your connection string in .env is correct.');
        console.log('3. If using MongoDB Atlas, ensure your IP is whitelisted.');
        process.exit(1);
    }
};

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

// Initialize the startup sequence
startServer();
