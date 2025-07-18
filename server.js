const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow all origins for development
app.use(express.json());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUBABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory conversation history (for demo, not per-user)
const conversationHistory = [];
const conversationId = 'demo-convo'; // For demo, static ID. Use UUID for real apps.

async function saveConversationToSupabase() {
    const { data, error } = await supabase
        .from('conversations')
        .upsert([
            {
                conversation_id: conversationId,
                messages: conversationHistory
            }
        ], { onConflict: ['conversation_id'] });
    if (error) {
        console.error('Supabase save error:', error);
    } else {
        console.log('Conversation saved to Supabase.');
    }
}

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        conversationHistory.push({ role: 'user', content: userMessage });
        const messages = [
            { role: 'system', content: 'You are a helpful and funny assistant.' },
            ...conversationHistory
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
        conversationHistory.push({ role: 'assistant', content: reply });
        await saveConversationToSupabase();
        res.json({ reply, history: conversationHistory });
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        res.status(500).json({ reply: 'Sorry, I could not process your request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
}); 