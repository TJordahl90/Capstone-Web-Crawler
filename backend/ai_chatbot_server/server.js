const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const multer = require('multer');      // ✅ for file upload
const pdfParse = require('pdf-parse'); // ✅ for PDF text extraction

console.log("🚀 Starting chatbot server...");

const app = express();
const PORT = 5002;

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// ✅ Chat route (same as before)
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    console.log("📩 Received message from frontend:", userMessage);

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3:8b",
            prompt: userMessage,
            stream: false
        });

        console.log("💡 AI response:", response.data.response);

        res.json({ reply: response.data.response.trim() });
    } catch (err) {
        console.error("❌ Ollama error:", err.message);
        res.status(500).json({ error: "Failed to connect to local AI" });
    }
});

// ✅ File upload setup
const upload = multer({ storage: multer.memoryStorage() });

// ✅ New route for PDF upload
// ✅ New route for PDF upload
app.post('/upload-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            console.error("❌ No file received!");
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log("📥 Received file:", req.file.originalname, req.file.mimetype, req.file.size);

        // Extract text from PDF
        const data = await pdfParse(req.file.buffer);
        const extractedText = data.text;
        console.log("📄 Extracted PDF text (first 200 chars):", extractedText.substring(0, 200));

        // ✅ Tell LLaMA to rewrite resume
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3:8b",
            prompt: `Rewrite the following resume clearly and neatly, keeping all details but formatting nicely:\n\n${extractedText}`,
            stream: false
        });

        res.json({ reply: response.data.response.trim() });
    } catch (err) {
        console.error("❌ PDF Upload error:", err);
        res.status(500).json({ error: "Failed to process PDF", details: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`🧠 AI Chatbot Server running at http://localhost:${PORT}`);
});

// ✅ Catch silent crashes
process.on('uncaughtException', (err) => {
    console.error('🛑 Uncaught Exception:', err);
});
