from fastapi import APIRouter
from app.db_config import db

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("/")
def get_users():

    users = list(db["users"].find({}))

    for user in users:
        user["_id"] = str(user["_id"])

    return users