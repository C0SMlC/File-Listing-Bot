# Telegram File Management Bot

This is a Telegram bot that allows users to upload, list, and retrieve files in a group chat.

## Features

- **File Upload**: Users can upload files to the group chat, and the bot will store file details in a PostgreSQL database.
- **File Listing**: Users can retrieve a list of all available files in the group chat.
- **File Retrieval**: Users can request a download link for any previously uploaded file.
  
## Prerequisites

To run this bot, ensure you have the following set up:

- **Python**: Python 3.7+ is required.
- **PostgreSQL**: A PostgreSQL database instance for storing files.
- **Telegram Bot Token**: Create a bot using [BotFather](https://t.me/BotFather) to get a token.
- **Dependencies**: Install the required Python libraries.

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/telegram-file-management-bot.git
    cd telegram-file-management-bot
    ```

2. **Install dependencies:**

    Use `pip` to install required libraries:

    ```bash
    pip install python-telegram-bot psycopg2
    ```

3. **Configure the environment:**

    - Add your bot token to the `.env` file or as an environment variable `BOT_TOKEN`.
    - Set up your PostgreSQL connection string as an environment variable (optional).

4. **Set up PostgreSQL:**

    Create the necessary table in your PostgreSQL database:

    ```sql
    CREATE TABLE IF NOT EXISTS files (
        file_id TEXT PRIMARY KEY, 
        file_name TEXT, 
        user_id INTEGER, 
        chat_id INTEGER, 
        file_url TEXT
    );
    ```

## Running the Bot

1. **Run the bot:**

    ```bash
    python bot.py
    ```

2. **Commands:**
    - `/start`: Welcome message.
    - `/help`: List available commands.
    - `/list`: List all uploaded files in the group.
    - `/get <file_name>`: Retrieve a file download link.

## License

This project is licensed under the MIT License.
