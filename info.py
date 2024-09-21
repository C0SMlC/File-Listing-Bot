import telegram
from telegram.ext import Updater
import os
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("BOT_TOKEN")


print(f"python-telegram-bot version: {telegram.__version__}")

# Try to create an Updater instance
try:
    updater = Updater(TOKEN)
    print("Updater attributes:", dir(updater))
except Exception as e:
    print(f"Error creating Updater: {e}")

# Check Application class if available
try:
    from telegram.ext import Application
    print("Application class is available")
except ImportError:
    print("Application class is not available")
