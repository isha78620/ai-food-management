from fastapi import APIRouter, HTTPException
from app.db_config import db

router = APIRouter(
    prefix="/api/foods",
    tags=["Foods"]
)


# GET ALL FOODS
@router.get("/")
def get_foods():
    try:
        foods = list(db["foods"].find({}))

        for food in foods:
            food["_id"] = str(food["_id"])

        return foods

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch foods: {str(e)}"
        )


# GET FOOD BY ID
@router.get("/{food_id}")
def get_food(food_id: str):
    try:
        from bson import ObjectId

        food = db["foods"].find_one({
            "_id": ObjectId(food_id)
        })

        if not food:
            raise HTTPException(
                status_code=404,
                detail="Food not found"
            )

        food["_id"] = str(food["_id"])

        return food

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch food: {str(e)}"
        )

    
from pydantic import BaseModel


class FoodCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    restaurantId: str
    available: bool = True


# CREATE FOOD
@router.post("/")
def create_food(food: FoodCreate):
    try:
        food_data = food.model_dump()

        result = db["foods"].insert_one(food_data)

        food_data["_id"] = str(result.inserted_id)

        return food_data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create food: {str(e)}"
        )

# UPDATE FOOD
@router.put("/{food_id}")
def update_food(food_id: str, food: FoodCreate):
    try:
        from bson import ObjectId

        updated_data = food.model_dump()

        result = db["foods"].update_one(
            {"_id": ObjectId(food_id)},
            {"$set": updated_data}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Food not found"
            )

        updated_food = db["foods"].find_one(
            {"_id": ObjectId(food_id)}
        )

        updated_food["_id"] = str(updated_food["_id"])

        return updated_food

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update food: {str(e)}"
        )

# DELETE FOOD
@router.delete("/{food_id}")
def delete_food(food_id: str):
    try:
        from bson import ObjectId

        result = db["foods"].delete_one(
            {"_id": ObjectId(food_id)}
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Food not found"
            )

        return {
            "message": "Food deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete food: {str(e)}"
        )
    