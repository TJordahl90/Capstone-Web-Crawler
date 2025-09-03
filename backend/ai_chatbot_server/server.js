const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

console.log("🚀 Starting chatbot server..."); // ✅ This should go at the TOP of the file

const app = express();
const PORT = 5002;

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,  // ✅ allow cookies, etc.
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    console.log("📩 Received message from frontend:", userMessage);  // 👈 Log incoming message

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3:8b",
            prompt: userMessage,
            stream: false
        });

        console.log("💡 AI response:", response.data.response);  // 👈 Log AI output

        res.json({ reply: response.data.response.trim() });

    } catch (err) {
        console.error("❌ Ollama error:", err.message);
        res.status(500).json({ error: "Failed to connect to local AI" });
    }
});

app.listen(PORT, () => {
    console.log(`🧠 AI Chatbot Server running at http://localhost:${PORT}`);
});

// ✅ Optional: catch silent crashes
process.on('uncaughtException', (err) => {
    console.error('🛑 Uncaught Exception:', err);
});
