import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "karukriti")

if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL is missing from .env")

client = MongoClient("mongodb://localhost:27017/")

db = client["karukriti"]

users_collection = db["users"]
products_collection = db["products"]
orders_collection = db["orders"]

# Indexes
users_collection.create_index("email", unique=True)
users_collection.create_index("mobile", unique=True)

products_collection.create_index("user_id")
orders_collection.create_index("user_id")