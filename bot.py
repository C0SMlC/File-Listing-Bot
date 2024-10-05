import os
import logging
import asyncio
import psycopg2
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
TOKEN = os.getenv("BOT_TOKEN")
DATABASE_URL = os.getenv("DATABASE_URL")
TARGET_GROUP_ID = os.getenv("TARGET_GROUP_ID")

# Database setup
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

# Create table if it doesn't exist
cursor.execute('''
    CREATE TABLE IF NOT EXISTS files (
        file_id TEXT PRIMARY KEY, 
        file_name TEXT, 
        user_id BIGINT, 
        chat_id BIGINT, 
        file_url TEXT
    )
''')
conn.commit()

# Custom filter for group restriction (if TARGET_GROUP_ID is set)


def filter_group(update: Update) -> bool:
    if TARGET_GROUP_ID:
        return update.effective_chat and str(update.effective_chat.id) == TARGET_GROUP_ID
    return True  # If TARGET_GROUP_ID is not set, allow all chats

# Command handlers


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a welcome message when the command /start is issued."""
    logger.info(f"Received /start command in chat {update.effective_chat.id}")
    await update.message.reply_text('Welcome! I can help manage files in this chat. Use /help for more information.')


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    logger.info(f"Received /help command in chat {update.effective_chat.id}")
    help_text = (
        "Available commands:\n"
        "/list - List all available files in this chat\n"
        "/get <file_name> - Get a download link for a specific file\n"
        "To add a file, simply send it to the chat."
    )
    await update.message.reply_text(help_text)


async def list_files(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """List all files available in the chat."""
    logger.info(f"Received /list command in chat {update.effective_chat.id}")
    chat_id = update.effective_chat.id
    cursor.execute(
        "SELECT file_name FROM files WHERE chat_id = %s", (chat_id,))
    files = cursor.fetchall()
    if files:
        file_list = "\n".join([f"- {file[0]}" for file in files])
        await update.message.reply_text(f"Available files in this chat:\n{file_list}")
    else:
        await update.message.reply_text("No files available in this chat.")


async def get_file(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Retrieve a download link for a specific file."""
    logger.info(f"Received /get command in chat {update.effective_chat.id}")
    if context.args:
        chat_id = update.effective_chat.id
        file_name = " ".join(context.args)
        cursor.execute(
            "SELECT file_url FROM files WHERE file_name=%s AND chat_id=%s", (file_name, chat_id))
        result = cursor.fetchone()
        if result:
            file_url = result[0]
            await update.message.reply_text(f"Download link for {file_name}: {file_url}")
        else:
            await update.message.reply_text("File not found in this chat.")
    else:
        await update.message.reply_text("Please provide a file name.")


async def handle_file(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle file uploads and save them to the database."""
    logger.info(f"Received file in chat {update.effective_chat.id}")
    if update.message.document:
        file = update.message.document
        file_name = file.file_name
        file_id = file.file_id
        user_id = update.message.from_user.id
        chat_id = update.effective_chat.id

        file_obj = await context.bot.get_file(file_id)
        file_url = file_obj.file_path

        cursor.execute(
            "INSERT INTO files (file_id, file_name, user_id, chat_id, file_url) VALUES (%s, %s, %s, %s, %s)",
            (file_id, file_name, user_id, chat_id, file_url)
        )
        conn.commit()

        await update.message.reply_text(f"File '{file_name}' has been added to the database.")


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    logger.error(f"Exception while handling an update: {context.error}", exc_info=context.error)


def main() -> None:
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(TOKEN).build()

    # Create a custom filter
    custom_filter = filters.ChatType.GROUPS if TARGET_GROUP_ID else None

    # Add handlers
    application.add_handler(CommandHandler("start", start, custom_filter))
    application.add_handler(CommandHandler(
        "help", help_command, custom_filter))
    application.add_handler(CommandHandler("list", list_files, custom_filter))
    application.add_handler(CommandHandler("get", get_file, custom_filter))
    application.add_handler(MessageHandler(filters.Document.ALL & (
        custom_filter if custom_filter else filters.ALL), handle_file))

    # Add error handler
    application.add_error_handler(error_handler)

    # Start the Bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()
