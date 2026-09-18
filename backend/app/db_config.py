import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = None
db = None


def check_database_connection():
    global client, db

    try:
        if not MONGO_URI:
            return False, "MONGODB_URL is missing in .env"

        if not DATABASE_NAME:
            return False, "DATABASE_NAME is missing in .env"

        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=20000,
            socketTimeoutMS=20000
        )

        client.admin.command("ping")

        db = client[DATABASE_NAME]

        print("✅ MongoDB Connected Successfully!")

        return True, "MongoDB connection successful"

    except Exception as e:
        print("❌ MongoDB Connection Failed!")
        print("Error:", e)

        return False, str(e)


# Check connection when the application starts
check_database_connection()