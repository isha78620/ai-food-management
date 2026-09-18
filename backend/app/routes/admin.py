from fastapi import APIRouter
from app.db_config import db
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)

orders_collection = db["orders"]
deliveries_collection = db["deliveries"]
inventory_collection = db["inventory"]
ingredients_collection = db["ingredients"]


@router.get("/dashboard")
def admin_dashboard():

    return {
        "totalOrders": orders_collection.count_documents({}),
        "placedOrders": orders_collection.count_documents({
            "status": "placed"
        }),
        "completedOrders": orders_collection.count_documents({
            "status": "completed"
        }),
        "cancelledOrders": orders_collection.count_documents({
            "status": "cancelled"
        }),
        "totalDeliveries": deliveries_collection.count_documents({}),
        "deliveredOrders": deliveries_collection.count_documents({
            "status": "delivered"
        }),
        "totalInventoryItems": inventory_collection.count_documents({}),
        "totalIngredients": ingredients_collection.count_documents({})
    }


# ==============================
# ADMIN - GET ALL ORDERS
# ==============================

@router.get("/orders")
def admin_get_all_orders(status: str = None):

    query = {}

    # Filter orders by status if provided
    if status:
        query["status"] = status

    orders = list(orders_collection.find(query))

    # Convert MongoDB ObjectId to string
    for order in orders:
        order["_id"] = str(order["_id"])

    return orders


# ==============================
# ADMIN - GET ALL DELIVERIES
# ==============================

@router.get("/deliveries")
def admin_get_all_deliveries(status: str = None):
    try:
        query = {}

        if status:
            query["status"] = status

        deliveries = list(db["deliveries"].find(query))

        for delivery in deliveries:
            delivery["_id"] = str(delivery["_id"])

        return deliveries

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch deliveries: {str(e)}"
        )

# ==============================
# ADMIN - INVENTORY OVERVIEW
# ==============================

@router.get("/inventory-overview")
def inventory_overview():

    total_inventory_items = inventory_collection.count_documents({})

    total_ingredients = ingredients_collection.count_documents({})

    low_stock_items = list(
        inventory_collection.find({
            "$expr": {
                "$lte": ["$quantity", "$minimumStock"]
            }
        })
    )

    for item in low_stock_items:
        item["_id"] = str(item["_id"])

    return {
        "totalInventoryItems": total_inventory_items,
        "totalIngredients": total_ingredients,
        "lowStockCount": len(low_stock_items),
        "lowStockItems": low_stock_items
    }

# ==============================
# ANALYTICS - ORDER & REVENUE
# ==============================

@router.get("/analytics/summary")
def analytics_summary():

    # Total orders
    total_orders = orders_collection.count_documents({})

    # Completed orders
    completed_orders = orders_collection.count_documents({
        "status": "completed"
    })

    # Cancelled orders
    cancelled_orders = orders_collection.count_documents({
        "status": "cancelled"
    })

    # Calculate total revenue from completed orders
    completed_order_data = list(
        orders_collection.find({
            "status": "completed"
        })
    )

    total_revenue = sum(
        order.get("totalAmount", 0)
        for order in completed_order_data
    )

    # Today's date
    today = datetime.now().date()

    # Get today's orders
    today_orders = list(
        orders_collection.find({
            "createdAt": {
                "$gte": datetime.combine(today, datetime.min.time()),
                "$lt": datetime.combine(
                    today + timedelta(days=1),
                    datetime.min.time()
                )
            }
        })
    )

    today_order_count = len(today_orders)

    # Today's revenue from completed orders
    today_revenue = sum(
        order.get("totalAmount", 0)
        for order in today_orders
        if order.get("status") == "completed"
    )

    return {
        "totalOrders": total_orders,
        "completedOrders": completed_orders,
        "cancelledOrders": cancelled_orders,
        "totalRevenue": total_revenue,
        "todayOrders": today_order_count,
        "todayRevenue": today_revenue
    }

# ==============================
# ANALYTICS - DAILY SALES
# ==============================

@router.get("/analytics/daily-sales")
def daily_sales():

    pipeline = [
        {
            "$match": {
                "status": "completed"
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$createdAt"
                    }
                },
                "totalOrders": {
                    "$sum": 1
                },
                "totalRevenue": {
                    "$sum": "$totalAmount"
                }
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ]

    results = list(
        orders_collection.aggregate(pipeline)
    )

    daily_data = []

    for item in results:
        daily_data.append({
            "date": item["_id"],
            "totalOrders": item["totalOrders"],
            "totalRevenue": item["totalRevenue"]
        })

    return daily_data

# ==============================
# ANALYTICS - POPULAR FOODS
# ==============================

@router.get("/analytics/popular-foods")
def popular_foods():

    pipeline = [
        {
            "$match": {
                "status": "completed"
            }
        },
        {
            "$unwind": "$items"
        },
        {
            "$group": {
                "_id": "$items.foodName",
                "totalQuantity": {
                    "$sum": "$items.quantity"
                },
                "totalRevenue": {
                    "$sum": {
                        "$multiply": [
                            "$items.quantity",
                            "$items.price"
                        ]
                    }
                }
            }
        },
        {
            "$sort": {
                "totalQuantity": -1
            }
        }
    ]

    results = list(
        orders_collection.aggregate(pipeline)
    )

    popular_food_data = []

    for item in results:
        popular_food_data.append({
            "foodName": item["_id"],
            "totalQuantity": item["totalQuantity"],
            "totalRevenue": item["totalRevenue"]
        })

    return popular_food_data

# ==============================
# ANALYTICS - DELIVERY SUMMARY
# ==============================

@router.get("/analytics/delivery-summary")
def delivery_summary():

    total_deliveries = deliveries_collection.count_documents({})

    assigned = deliveries_collection.count_documents({
        "status": "assigned"
    })

    picked_up = deliveries_collection.count_documents({
        "status": "picked_up"
    })

    out_for_delivery = deliveries_collection.count_documents({
        "status": "out_for_delivery"
    })

    delivered = deliveries_collection.count_documents({
        "status": "delivered"
    })

    return {
        "totalDeliveries": total_deliveries,
        "assigned": assigned,
        "pickedUp": picked_up,
        "outForDelivery": out_for_delivery,
        "delivered": delivered
    }

# ==============================
# ANALYTICS - PEAK ORDER TIME
# ==============================

@router.get("/analytics/peak-order-time")
def peak_order_time():

    pipeline = [
        {
            "$project": {
                "hour": {
                    "$hour": "$createdAt"
                }
            }
        },
        {
            "$group": {
                "_id": "$hour",
                "totalOrders": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "totalOrders": -1
            }
        }
    ]

    results = list(
        orders_collection.aggregate(pipeline)
    )

    peak_data = []

    for item in results:
        peak_data.append({
            "hour": item["_id"],
            "totalOrders": item["totalOrders"]
        })

    return peak_data

# ==============================
# ANALYTICS - MONTHLY SALES
# ==============================

@router.get("/analytics/monthly-sales")
def monthly_sales():

    pipeline = [
        {
            "$match": {
                "status": "completed"
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {
                        "$year": "$createdAt"
                    },
                    "month": {
                        "$month": "$createdAt"
                    }
                },
                "totalOrders": {
                    "$sum": 1
                },
                "totalRevenue": {
                    "$sum": "$totalAmount"
                }
            }
        },
        {
            "$sort": {
                "_id.year": 1,
                "_id.month": 1
            }
        }
    ]

    results = list(
        orders_collection.aggregate(pipeline)
    )

    monthly_data = []

    for item in results:
        monthly_data.append({
            "year": item["_id"]["year"],
            "month": item["_id"]["month"],
            "totalOrders": item["totalOrders"],
            "totalRevenue": item["totalRevenue"]
        })

    return monthly_data