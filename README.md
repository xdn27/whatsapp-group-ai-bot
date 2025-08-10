# WhatsApp AI Bot

An intelligent and contextual AI bot for WhatsApp groups, powered by LLMs (OpenAI/OpenRouter) and `whatsapp-web.js`.

## Features

* **Easy Login**: Scan the QR code once, either in the terminal or via the web.
* **Contextual**: Understands the group chat history to provide relevant answers.
* **Smart Content Moderation**: Automatically analyzes messages to detect inappropriate content (abusive, pornographic, etc.) and gives dynamic warnings using AI.
* **Flexible**: Supports various LLM models from OpenAI and OpenRouter.
* **Persona Customization**: Adjust the bot’s tone and language to your preference via the `.env` file.
* **Local Storage**: All conversations and session data are stored locally in an SQLite database.
* **Group Filter**: Control in which groups the bot will respond.

## Technology Stack

* **Runtime**: Node.js
* **Language**: TypeScript
* **WhatsApp Integration**: `whatsapp-web.js`
* **Web Server**: Express
* **Database**: SQLite
* **ORM**: Prisma
* **LLM**: OpenAI, OpenRouter

## How to Run

1. **Clone the Repository**

   ```bash
   git clone <this-repository-url>
   cd whatsapp-ai-bot
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**

   * Copy `.env.example` to `.env`.

     ```bash
     cp .env.example .env
     ```
   * Open `.env` and fill in all required variables, especially:

     * `LLM_PROVIDER`: Choose `openai` or `openrouter`.
     * `OPENAI_API_KEY`: Your OpenAI API key.
     * `OPENROUTER_API_KEY`: Your OpenRouter API key (if used).
     * `OPENROUTER_REFERER`: Your application or website URL (required for OpenRouter).
     * `ALLOWED_GROUPS`: (Optional) List of ALLOWED WhatsApp group NAMES, separated by commas (example: `My Cool Group,Another Chat`). If left empty, the bot will respond in all groups.
     * `TRIGGER_KEYWORDS`: (Optional) List of keywords separated by commas (example: `bot,ask,hi`). If a message contains any of these keywords, the bot will respond even without being mentioned. If empty, the bot only responds when mentioned.
     * `MENTION_TRIGGER_KEYWORDS`: (Optional) List of keywords separated by commas (example: `what,how`). If the bot is mentioned, it will only respond if the message also contains one of these keywords. If empty, the bot responds every time it’s mentioned.
     * `CONTENT_MODERATION_ENABLED`: (Optional) Set to `true` to enable automatic content moderation.
     * `MODERATION_PROMPT`: (Optional) Customize the prompt used to detect inappropriate content.
     * `MODERATION_WARNING_PROMPT`: (Optional) Customize the prompt used to generate dynamic warning messages.

4. **Setup Database**

   Run Prisma migrations to create the SQLite database file and the required tables.

   ```bash
   npm run prisma:migrate
   ```

5. **Run the Bot**

   ```bash
   npm run dev
   ```

6. **Login to WhatsApp**

   * **Option 1 (Terminal)**: The QR code will appear directly in your terminal. Scan it using WhatsApp on your phone.
   * **Option 2 (Web)**: Open your browser and go to `http://localhost:3000/qr`. Scan the displayed QR code.

   After logging in successfully, the session will be stored locally. You don’t need to scan again every time you run the bot.

## How to Use

1. Invite the bot to your WhatsApp group.
2. To ask a question, mention the bot in your message (example: `@BotName how are you?`).
3. The bot will read the group’s message history for context, then give a relevant answer.
