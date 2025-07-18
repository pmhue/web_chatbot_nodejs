const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUBABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory cache for conversation history (per conversation_id)
const conversationCache = {};

// Start a new conversation and return a unique conversation_id
app.post('/start', (req, res) => {
    const conversationId = uuidv4();
    conversationCache[conversationId] = [];
    res.json({ conversation_id: conversationId });
});

async function saveConversationToSupabase(conversationId, history) {
    const { error } = await supabase
        .from('conversations')
        .upsert([
            {
                conversation_id: conversationId,
                messages: history
            }
        ], { onConflict: ['conversation_id'] });
    if (error) {
        console.error('Supabase save error:', error);
    } else {
        console.log('Conversation saved to Supabase.');
    }
}

app.post('/chat', async (req, res) => {
    const { message, conversation_id } = req.body;
    if (!conversation_id) {
        return res.status(400).json({ reply: 'Missing conversation_id.' });
    }
    if (!conversationCache[conversation_id]) {
        conversationCache[conversation_id] = [];
    }
    try {
        conversationCache[conversation_id].push({ role: 'user', content: message });
        const messages = [
            { role: 'system', content: 'You are a helpful and funny assistant.' },
            ...conversationCache[conversation_id]
        ];
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
        conversationCache[conversation_id].push({ role: 'assistant', content: reply });
        await saveConversationToSupabase(conversation_id, conversationCache[conversation_id]);
        res.json({ reply, history: conversationCache[conversation_id] });
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        res.status(500).json({ reply: 'Sorry, I could not process your request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
}); 