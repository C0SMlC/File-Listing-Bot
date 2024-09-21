from telegram.constants import ParseMode
import signal
import os
import asyncio
import psycopg2
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from dotenv import load_dotenv

"""
Telegram Bot for File Management
--------------------------------
This bot allows users to upload, list, and retrieve files in a group chat.

Commands:
- /start: Welcome message
- /help: Display list of available commands
- /list: List all available files in the group
- /get <file_name>: Retrieve a download link for a file
"""

# Load the .env file
load_dotenv()

# Load the bot token from an environment variable
TOKEN = os.getenv("BOT_TOKEN")

# Database connection setup
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
c = conn.cursor()

# Create table if it doesn't exist
c.execute('''CREATE TABLE IF NOT EXISTS files (
                file_id TEXT PRIMARY KEY, 
                file_name TEXT, 
                user_id INTEGER, 
                chat_id INTEGER, 
                file_url TEXT
            )''')

# Function to handle the /start command


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a welcome message when /start is issued."""
    if update.effective_chat:
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="Welcome! I can help manage files in this group. Use /help for more information."
        )

# Function to handle the /help command


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Displays available commands when the command /help is issued."""
    help_text = (
        "Available commands:\n"
        "\\- /list \\- List all available files in this group\n"
        "\\- /get `<file_name>` \\- Get a download link for a specific file\n\n"
        "To add a file, simply send it to the group\\."
    )

    if update.effective_chat:
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text=help_text,
            parse_mode=ParseMode.MARKDOWN_V2  # Ensure correct usage of Markdown V2
        )

# Function to handle file uploads


async def handle_file(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles file uploads and saves them to the database."""
    if update.message and update.message.document:
        file = update.message.document

        # Extract file and chat details
        file_name = file.file_name
        file_id = file.file_id
        user_id = update.message.from_user.id
        chat_id = update.message.chat_id

        # Get the file URL
        file_obj = await context.bot.get_file(file_id)
        file_url = file_obj.file_path

        # Insert file information into the database
        c.execute(
            "INSERT INTO files (file_id, file_name, user_id, chat_id, file_url) VALUES (%s, %s, %s, %s, %s)",
            (file_id, file_name, user_id, chat_id, file_url)
        )
        conn.commit()

        # Notify the user that the file has been added
        await context.bot.send_message(
            chat_id=chat_id,
            text=f"File '{file_name}' has been added to the database."
        )

# Function to list all files in the group


async def list_files(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Lists all files available in the group."""
    if update.message:
        chat_id = update.message.chat_id
        c.execute("SELECT file_name FROM files WHERE chat_id = %s", (chat_id,))
        files = c.fetchall()

        if files:
            file_list = "\n".join([f"- {file[0]}" for file in files])
            await context.bot.send_message(
                chat_id=chat_id,
                text=f"Available files in this group:\n{file_list}"
            )
        else:
            await context.bot.send_message(
                chat_id=chat_id,
                text="No files available in this group."
            )

# Function to retrieve a file download link


async def get_file(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Retrieves a download link for a specific file."""
    if update.message and context.args:
        chat_id = update.message.chat_id
        file_name = " ".join(context.args)

        # Fetch file URL from the database
        c.execute(
            "SELECT file_url FROM files WHERE file_name=%s AND chat_id=%s", (file_name, chat_id))
        result = c.fetchone()

        if result:
            file_url = result[0]
            await context.bot.send_message(
                chat_id=chat_id,
                text=f"Download link for {file_name}: {file_url}"
            )
        else:
            await context.bot.send_message(
                chat_id=chat_id,
                text="File not found in this group."
            )
    else:
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="Please provide a file name."
        )

# Start the bot and initialize its lifecycle


async def start_bot(application: Application) -> None:
    """Starts the bot."""
    await application.initialize()
    await application.start()
    await application.updater.start_polling()
    print("Bot started successfully.")

# Graceful shutdown function for the bot


async def stop_bot(application: Application) -> None:
    """Stops the bot."""
    await application.stop()
    await application.shutdown()

# Main function to run the bot


def main() -> None:
    """Main entry point to run the bot."""
    application = Application.builder().token(TOKEN).build()

    # Add command and message handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("list", list_files))
    application.add_handler(CommandHandler("get", get_file))
    application.add_handler(MessageHandler(filters.Document.ALL, handle_file))

    # Run the bot
    loop = asyncio.get_event_loop()

    try:
        loop.run_until_complete(start_bot(application))
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        loop.run_until_complete(stop_bot(application))
        loop.close()


if __name__ == '__main__':
    main()
