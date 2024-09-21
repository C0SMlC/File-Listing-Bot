import telegram
from telegram.ext import Updater

print(f"python-telegram-bot version: {telegram.__version__}")

# Try to create an Updater instance
try:
    updater = Updater("7087859707:AAFhDQskswKPoK9wAm3IBhb0NCQNYHFhxIE")
    print("Updater attributes:", dir(updater))
except Exception as e:
    print(f"Error creating Updater: {e}")

# Check Application class if available
try:
    from telegram.ext import Application
    print("Application class is available")
except ImportError:
    print("Application class is not available")
