from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

uri = os.getenv("MONGO_URI")

print("MongoDB URI found:", bool(uri))

try:
    client = MongoClient(
        uri,
        serverSelectionTimeoutMS=10000
    )

    client.admin.command("ping")

    print("✅ MongoDB connection successful!")

except Exception as e:
    print("❌ MongoDB connection failed!")
    print("Error:", e)