const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow all origins for development
app.use(express.json());

// In-memory conversation history (for demo, not per-user)
const conversationHistory = [];

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        // Add user message to history
        conversationHistory.push({ role: 'user', content: userMessage });
        // const messages = ...
        const messages = [
            { role: 'system', content: 'You are a helpful and funny assistant.' },
            ...conversationHistory
        ];
        // const openaiRes = ...
        const openaiRes = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4.1-mini',
                messages
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const reply = openaiRes.data.choices[0].message.content.trim();
        // Add bot reply to history
        conversationHistory.push({ role: 'assistant', content: reply });
        res.json({ reply, history: conversationHistory });
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        res.status(500).json({ reply: 'Sorry, I could not process your request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
}); 