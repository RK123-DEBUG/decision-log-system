module.exports = (mongoose) => {
    // Function to connect to the database
    const connectDB = async (mongoURI) => {
        try {
            console.log('Attempting to connect to MongoDB...');
            await mongoose.connect(mongoURI);
            console.log('Connected to MongoDB successfully.');
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

    // ─── Mongoose Schemas & Models ────────────────────────────────────────────────

    const userSchema = new mongoose.Schema({
        name:    { type: String, unique: true, required: true },
        contact: { type: String, required: true }
    });

    const revisionSchema = new mongoose.Schema({
        revisedBy:  { type: String, required: true },
        suggestion: { type: String, required: true },
        timestamp:  { type: String, default: () => new Date().toISOString() }
    });

    const decisionSchema = new mongoose.Schema({
        username:      { type: String, required: true },
        problem:       { type: String, required: true },
        alternatives:  { type: String, required: true },
        finalDecision: { type: String, required: true },
        timestamp:     { type: String, default: () => new Date().toISOString() },
        revisions:     [revisionSchema]   // array of revision suggestions
    });

    const commentSchema = new mongoose.Schema({
        decisionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Decision', required: true },
        username:   { type: String, required: true },
        comment:    { type: String, required: true },
        timestamp:  { type: String, default: () => new Date().toISOString() }
    });

    const User     = mongoose.model('User',     userSchema);
    const Decision = mongoose.model('Decision', decisionSchema);
    const Comment  = mongoose.model('Comment',  commentSchema);

    return {
        connectDB,
        User,
        Decision,
        Comment
    };
};
