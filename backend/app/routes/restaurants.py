from fastapi import APIRouter, HTTPException
from app.db_config import db

router = APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants"]
)


@router.get("/")
def get_restaurants():
    try:
        restaurants = list(db["restaurants"].find({}))

        for restaurant in restaurants:
            restaurant["_id"] = str(restaurant["_id"])

        return restaurants

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch restaurants: {str(e)}"
        )