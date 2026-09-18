from fastapi import APIRouter, HTTPException
from app.db_config import db
from bson import ObjectId
from datetime import datetime

router = APIRouter(
    prefix="/api/deliveries",
    tags=["Delivery"]
)

orders_collection = db["orders"]
deliveries_collection = db["deliveries"]


# =========================================================
# ASSIGN DELIVERY
# =========================================================

@router.post("/assign/{order_id}")
def assign_delivery(order_id: str, delivery: dict):

    try:
        # Find order
        order = orders_collection.find_one(
            {"_id": ObjectId(order_id)}
        )

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        # Only delivery orders are allowed
        if order.get("orderType") != "delivery":
            raise HTTPException(
                status_code=400,
                detail="This is not a delivery order"
            )

        # Create delivery data
        delivery_data = {
            "orderId": order_id,
            "deliveryPerson": delivery.get("deliveryPerson"),
            "phone": delivery.get("phone"),
            "status": "assigned",
            "assignedAt": datetime.now()
        }

        result = deliveries_collection.insert_one(
            delivery_data
        )

        return {
            "message": "Delivery person assigned successfully",
            "deliveryId": str(result.inserted_id)
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to assign delivery: {str(e)}"
        )


# =========================================================
# UPDATE DELIVERY STATUS
# =========================================================

@router.patch("/{delivery_id}/status")
def update_delivery_status(
    delivery_id: str,
    status: str
):

    valid_statuses = [
        "assigned",
        "picked_up",
        "out_for_delivery",
        "delivered"
    ]

    # Validate status
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid delivery status",
                "validStatuses": valid_statuses
            }
        )

    # Validate ObjectId
    try:
        delivery_object_id = ObjectId(delivery_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid delivery ID"
        )

    try:
        # Check delivery exists
        delivery = deliveries_collection.find_one(
            {"_id": delivery_object_id}
        )

        if not delivery:
            raise HTTPException(
                status_code=404,
                detail="Delivery not found"
            )

        # Update status
        result = deliveries_collection.update_one(
            {"_id": delivery_object_id},
            {
                "$set": {
                    "status": status,
                    "updatedAt": datetime.now()
                }
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Delivery not found"
            )

        return {
            "message": "Delivery status updated successfully",
            "deliveryId": delivery_id,
            "status": status
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update delivery status: {str(e)}"
        )


# =========================================================
# GET SINGLE DELIVERY
# =========================================================

@router.get("/{delivery_id}")
def get_delivery(delivery_id: str):

    try:
        delivery_object_id = ObjectId(delivery_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid delivery ID"
        )

    try:
        delivery = deliveries_collection.find_one(
            {"_id": delivery_object_id}
        )

        if not delivery:
            raise HTTPException(
                status_code=404,
                detail="Delivery not found"
            )

        delivery["_id"] = str(delivery["_id"])

        return delivery

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch delivery: {str(e)}"
        )