from fastapi import APIRouter
from app.db_config import db
from datetime import datetime
import pandas as pd
from sklearn.linear_model import LinearRegression

router = APIRouter(
    prefix="/api/ai",
    tags=["Business AI"]
)

orders_collection = db["orders"]


@router.get("/sales-prediction")
def sales_prediction():

    orders = list(
        orders_collection.find({
            "status": "completed"
        })
    )

    if len(orders) < 2:
        return {
            "message": "Not enough completed orders for prediction",
            "required": 2,
            "available": len(orders)
        }

    data = []

    for order in orders:

        created_at = order.get("createdAt")
        total_amount = order.get("totalAmount", 0)

        if created_at and total_amount:
            data.append({
                "date": created_at.date(),
                "sales": total_amount
            })

    if len(data) < 2:
        return {
            "message": "Not enough valid sales data"
        }

    df = pd.DataFrame(data)

    # Group sales by date
    daily_sales = (
        df.groupby("date")["sales"]
        .sum()
        .reset_index()
    )

    if len(daily_sales) < 2:
        return {
            "message": "At least 2 different sales days are required"
        }

    # Create numerical day index
    daily_sales["day_number"] = range(
        len(daily_sales)
    )

    X = daily_sales[["day_number"]]
    y = daily_sales["sales"]

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Predict next day
    next_day = len(daily_sales)

    prediction = model.predict(
        [[next_day]]
    )[0]

    if prediction < 0:
        prediction = 0

    return {
        "predictionFor": "next day",
        "predictedSales": round(float(prediction), 2),
        "currency": "INR",
        "historicalDays": len(daily_sales)
    }

# ==============================
# AI - FOOD DEMAND PREDICTION
# ==============================

@router.get("/food-demand")
def food_demand_prediction():

    orders = list(
        orders_collection.find({
            "status": "completed"
        })
    )

    if not orders:
        return {
            "message": "No completed orders available"
        }

    food_data = []

    for order in orders:

        for item in order.get("items", []):

            food_name = item.get("foodName")
            quantity = item.get("quantity", 0)

            if food_name and quantity:
                food_data.append({
                    "foodName": food_name,
                    "quantity": quantity
                })

    if not food_data:
        return {
            "message": "No food sales data available"
        }

    df = pd.DataFrame(food_data)

    # Calculate total quantity sold for each food
    demand = (
        df.groupby("foodName")["quantity"]
        .sum()
        .reset_index()
    )

    # Calculate average quantity per order record
    demand["averageDemand"] = (
        demand["quantity"] / len(orders)
    )

    # Simple next-day demand estimate
    demand["predictedDemand"] = (
        demand["averageDemand"]
        .round()
        .astype(int)
    )

    # Sort highest demand first
    demand = demand.sort_values(
        by="predictedDemand",
        ascending=False
    )

    result = []

    for _, row in demand.iterrows():

        result.append({
            "foodName": row["foodName"],
            "totalSold": int(row["quantity"]),
            "predictedDemand": int(
                row["predictedDemand"]
            )
        })

    return {
        "predictionFor": "next day",
        "foods": result
    }

# ==============================
# AI - PEAK TIME PREDICTION
# ==============================

@router.get("/peak-time")
def peak_time_prediction():

    orders = list(
        orders_collection.find({
            "status": "completed"
        })
    )

    if not orders:
        return {
            "message": "No completed orders available"
        }

    hourly_data = {}

    for order in orders:

        created_at = order.get("createdAt")

        if created_at:
            hour = created_at.hour

            if hour not in hourly_data:
                hourly_data[hour] = 0

            hourly_data[hour] += 1

    if not hourly_data:
        return {
            "message": "No valid order time data available"
        }

    # Sort hours by number of orders
    sorted_hours = sorted(
        hourly_data.items(),
        key=lambda x: x[1],
        reverse=True
    )

    result = []

    for hour, total_orders in sorted_hours:

        if hour == 0:
            time_range = "12 AM - 1 AM"
        elif hour < 12:
            time_range = f"{hour} AM - {hour + 1} AM"
        elif hour == 12:
            time_range = "12 PM - 1 PM"
        else:
            time_range = f"{hour - 12} PM - {hour - 11} PM"

        result.append({
            "hour": hour,
            "timeRange": time_range,
            "totalOrders": total_orders
        })

    return {
        "predictionFor": "future peak time",
        "peakTime": result[0]["timeRange"],
        "peakOrders": result[0]["totalOrders"],
        "hourlyAnalysis": result
    }

# ==============================
# AI - BUSINESS RECOMMENDATIONS
# ==============================

inventory_collection = db["inventory"]


@router.get("/business-recommendations")
def business_recommendations():

    recommendations = []

    # --------------------------------
    # 1. CHECK ORDER STATUS
    # --------------------------------

    total_orders = orders_collection.count_documents({})

    completed_orders = orders_collection.count_documents({
        "status": "completed"
    })

    cancelled_orders = orders_collection.count_documents({
        "status": "cancelled"
    })

    if total_orders > 0:

        cancellation_rate = (
            cancelled_orders / total_orders
        ) * 100

        if cancellation_rate >= 20:

            recommendations.append({
                "type": "warning",
                "category": "Orders",
                "message": "Order cancellation rate is high.",
                "suggestion": "Check order processing time and customer issues."
            })

    # --------------------------------
    # 2. CHECK POPULAR FOODS
    # --------------------------------

    orders = list(
        orders_collection.find({
            "status": "completed"
        })
    )

    food_sales = {}

    for order in orders:

        for item in order.get("items", []):

            food_name = item.get("foodName")
            quantity = item.get("quantity", 0)

            if food_name:

                food_sales[food_name] = (
                    food_sales.get(food_name, 0)
                    + quantity
                )

    if food_sales:

        popular_food = max(
            food_sales,
            key=food_sales.get
        )

        popular_quantity = food_sales[popular_food]

        recommendations.append({
            "type": "success",
            "category": "Food Demand",
            "message": f"{popular_food} is the most ordered food.",
            "suggestion": f"Keep enough ingredients ready for approximately {popular_quantity} units of historical demand."
        })

    # --------------------------------
    # 3. CHECK INVENTORY
    # --------------------------------

    inventory_items = list(
        inventory_collection.find({})
    )

    low_stock_count = 0

    for item in inventory_items:

        quantity = item.get("quantity")
        minimum_stock = item.get("minimumStock")

        if (
            quantity is not None
            and minimum_stock is not None
            and quantity <= minimum_stock
        ):

            low_stock_count += 1

            item_name = (
                item.get("name")
                or item.get("itemName")
                or "Unknown item"
            )

            recommendations.append({
                "type": "warning",
                "category": "Inventory",
                "message": f"{item_name} stock is low.",
                "suggestion": "Restock this item before the next busy period."
            })

    # --------------------------------
    # 4. CHECK PEAK TIME
    # --------------------------------

    hourly_data = {}

    for order in orders:

        created_at = order.get("createdAt")

        if created_at:

            hour = created_at.hour

            hourly_data[hour] = (
                hourly_data.get(hour, 0) + 1
            )

    if hourly_data:

        peak_hour = max(
            hourly_data,
            key=hourly_data.get
        )

        peak_orders = hourly_data[peak_hour]

        if peak_hour == 0:
            peak_time = "12 AM - 1 AM"
        elif peak_hour < 12:
            peak_time = f"{peak_hour} AM - {peak_hour + 1} AM"
        elif peak_hour == 12:
            peak_time = "12 PM - 1 PM"
        else:
            peak_time = f"{peak_hour - 12} PM - {peak_hour - 11} PM"

        recommendations.append({
            "type": "info",
            "category": "Peak Time",
            "message": f"{peak_time} is the busiest period.",
            "suggestion": f"Consider increasing kitchen and delivery staff during this period. Historical orders: {peak_orders}."
        })

    # --------------------------------
    # RESPONSE
    # --------------------------------

    return {
        "totalOrders": total_orders,
        "completedOrders": completed_orders,
        "cancelledOrders": cancelled_orders,
        "lowStockItems": low_stock_count,
        "recommendationCount": len(recommendations),
        "recommendations": recommendations
    }