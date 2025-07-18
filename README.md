# Simple Chatbot with OpenAI API

## Setup

1. **Clone the repository** and navigate to the project folder.

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Create a `.env` file** in the project root with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the server:**
   ```
   node server.js
   ```

5. **Open your browser** and go to [http://localhost:3000](http://localhost:3000)

## Files
- `index.html` — Chatbot UI
- `style.css` — Chatbot styles
- `main.js` — Frontend chat logic
- `server.js` — Node.js backend
- `.env` — Your OpenAI API key (not committed)

## Notes
- Do **not** share your `.env` file or API key.
- The backend uses the OpenAI GPT-3.5-turbo model. 