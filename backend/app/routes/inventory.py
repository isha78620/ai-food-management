from fastapi import APIRouter, HTTPException
from app.db_config import db
from bson import ObjectId

router = APIRouter(
    prefix="/api/inventory",
    tags=["Inventory"]
)


# GET ALL INVENTORY
@router.get("/")
def get_inventory():
    try:
        inventory = list(db["inventory"].find({}))

        for item in inventory:
            item["_id"] = str(item["_id"])

        return inventory

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch inventory: {str(e)}"
        )


# GET INVENTORY BY ID
@router.get("/{inventory_id}")
def get_inventory_item(inventory_id: str):
    try:
        item = db["inventory"].find_one({
            "_id": ObjectId(inventory_id)
        })

        if not item:
            raise HTTPException(
                status_code=404,
                detail="Inventory item not found"
            )

        item["_id"] = str(item["_id"])

        return item

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch inventory item: {str(e)}"
        )


# CREATE INVENTORY ITEM
@router.post("/")
def create_inventory_item(item: dict):
    try:
        result = db["inventory"].insert_one(item)

        item["_id"] = str(result.inserted_id)

        return item

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create inventory item: {str(e)}"
        )


# UPDATE INVENTORY ITEM
@router.put("/{inventory_id}")
def update_inventory_item(
    inventory_id: str,
    item: dict
):
    try:
        result = db["inventory"].update_one(
            {"_id": ObjectId(inventory_id)},
            {"$set": item}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Inventory item not found"
            )

        updated_item = db["inventory"].find_one({
            "_id": ObjectId(inventory_id)
        })

        updated_item["_id"] = str(updated_item["_id"])

        return updated_item

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update inventory item: {str(e)}"
        )


# DELETE INVENTORY ITEM
@router.delete("/{inventory_id}")
def delete_inventory_item(inventory_id: str):
    try:
        result = db["inventory"].delete_one({
            "_id": ObjectId(inventory_id)
        })

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Inventory item not found"
            )

        return {
            "message": "Inventory item deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete inventory item: {str(e)}"
        )