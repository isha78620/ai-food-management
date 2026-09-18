from fastapi import APIRouter, HTTPException
from app.db_config import db

router = APIRouter(
    prefix="/api/kitchen",
    tags=["Kitchen"]
)


# GET ALL KITCHEN ORDERS
@router.get("/orders")
def get_kitchen_orders():
    try:
        orders = list(db["kitchen_orders"].find({}))

        for order in orders:
            order["_id"] = str(order["_id"])

        return orders

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch kitchen orders: {str(e)}"
        )


# GET KITCHEN ORDER BY ID
@router.get("/orders/{order_id}")
def get_kitchen_order(order_id: str):
    try:
        from bson import ObjectId

        order = db["kitchen_orders"].find_one({
            "_id": ObjectId(order_id)
        })

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Kitchen order not found"
            )

        order["_id"] = str(order["_id"])

        return order

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch kitchen order: {str(e)}"
        )

from pydantic import BaseModel


class KitchenStatusUpdate(BaseModel):
    status: str


# UPDATE KITCHEN ORDER STATUS
@router.patch("/orders/{order_id}/status")
def update_kitchen_order_status(
    order_id: str,
    data: KitchenStatusUpdate
):
    try:
        from bson import ObjectId

        allowed_statuses = [
            "accepted",
            "preparing",
            "ready",
            "completed",
            "cancelled"
        ]

        if data.status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Allowed statuses: {allowed_statuses}"
            )

        result = db["kitchen_orders"].update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": data.status}}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Kitchen order not found"
            )

        return {
            "message": "Kitchen order status updated successfully",
            "status": data.status
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update kitchen order status: {str(e)}"
        )    