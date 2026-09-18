from fastapi import APIRouter
from app.db_config import db
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
import random

def generate_token():
    return random.randint(1000, 9999)


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)
VALID_ORDER_TYPES = [
    "dine_in",
    "takeaway",
    "delivery"
]

orders_collection = db["orders"]


@router.post("/")
def create_order(order: dict):

    order_type = order.get("orderType")

    # Validate order type
    if order_type not in VALID_ORDER_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid order type. Use: dine_in, takeaway, or delivery"
        )

    # =========================
    # DINE-IN
    # =========================
    if order_type == "dine_in":

        if not order.get("tableNumber"):
            raise HTTPException(
                status_code=400,
                detail="Table number is required for dine-in order"
            )

    # =========================
    # TAKEAWAY
    # =========================
    elif order_type == "takeaway":

        order["pickupToken"] = generate_token()

    # =========================
    # DELIVERY
    # =========================
    elif order_type == "delivery":

        if not order.get("deliveryAddress"):
            raise HTTPException(
                status_code=400,
                detail="Delivery address is required for delivery order"
            )

    # Common order fields
    order["status"] = "placed"
    order["createdAt"] = datetime.now()

    result = orders_collection.insert_one(order)

    return {
        "message": "Order created successfully",
        "orderId": str(result.inserted_id),
        "pickupToken": order.get("pickupToken")
    }

@router.get("/")
def get_orders():

    orders = list(orders_collection.find({}))

    for order in orders:
        order["_id"] = str(order["_id"])

    return orders


@router.get("/{order_id}")
def get_order(order_id: str):

    order = orders_collection.find_one(
        {"_id": ObjectId(order_id)}
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order["_id"] = str(order["_id"])

    return order


@router.patch("/{order_id}/status")
def update_order_status(
    order_id: str,
    status: str
):

    result = orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": status
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {
        "message": "Order status updated successfully",
        "status": status
    }

@router.patch("/{order_id}/cancel")
def cancel_order(order_id: str):

    result = orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": "cancelled"
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {
        "message": "Order cancelled successfully"
    }