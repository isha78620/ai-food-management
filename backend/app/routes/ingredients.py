from fastapi import APIRouter, HTTPException
from app.db_config import db
from bson import ObjectId

router = APIRouter(
    prefix="/api/ingredients",
    tags=["Ingredients"]
)


# GET ALL INGREDIENTS
@router.get("/")
def get_ingredients():
    try:
        ingredients = list(db["ingredients"].find({}))

        for ingredient in ingredients:
            ingredient["_id"] = str(ingredient["_id"])

        return ingredients

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ingredients: {str(e)}"
        )


# GET INGREDIENT BY ID
@router.get("/{ingredient_id}")
def get_ingredient(ingredient_id: str):
    try:
        ingredient = db["ingredients"].find_one({
            "_id": ObjectId(ingredient_id)
        })

        if not ingredient:
            raise HTTPException(
                status_code=404,
                detail="Ingredient not found"
            )

        ingredient["_id"] = str(ingredient["_id"])

        return ingredient

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ingredient: {str(e)}"
        )


# CREATE INGREDIENT
@router.post("/")
def create_ingredient(ingredient: dict):
    try:
        result = db["ingredients"].insert_one(ingredient)

        ingredient["_id"] = str(result.inserted_id)

        return ingredient

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create ingredient: {str(e)}"
        )


# UPDATE INGREDIENT
@router.put("/{ingredient_id}")
def update_ingredient(
    ingredient_id: str,
    ingredient: dict
):
    try:
        result = db["ingredients"].update_one(
            {"_id": ObjectId(ingredient_id)},
            {"$set": ingredient}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Ingredient not found"
            )

        updated_ingredient = db["ingredients"].find_one({
            "_id": ObjectId(ingredient_id)
        })

        updated_ingredient["_id"] = str(updated_ingredient["_id"])

        return updated_ingredient

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update ingredient: {str(e)}"
        )


# DELETE INGREDIENT
@router.delete("/{ingredient_id}")
def delete_ingredient(ingredient_id: str):
    try:
        result = db["ingredients"].delete_one({
            "_id": ObjectId(ingredient_id)
        })

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Ingredient not found"
            )

        return {
            "message": "Ingredient deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete ingredient: {str(e)}"
        )