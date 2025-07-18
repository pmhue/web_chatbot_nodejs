const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

// In-memory conversation history (for demo, not per-user)
const conversationHistory = [];

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        // Add user message to history
        conversationHistory.push({ role: 'user', content: userMessage });
        // Print the conversation history to the console
        // console.log('Conversation history:', JSON.stringify(conversationHistory, null, 2));
        const messages = [
            { role: 'system', content: 'You are a helpful and funny assistant.' },
            ...conversationHistory
        ];
        // Print the full prompt to the console
        // console.log('Prompt sent to OpenAI:', JSON.stringify(messages, null, 2));
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
    console.log(`Server running on http://localhost:${PORT}`);
}); 