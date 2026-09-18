from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db_config import check_database_connection
from app.routes.orders import router as orders_router
from app.routes.deliveries import router as deliveries_router
from app.routes.admin import router as admin_router
from app.routes.ai import router as ai_router
from app.routes.restaurants import router as restaurants_router
from app.routes.foods import router as foods_router
from app.routes.kitchen import router as kitchen_router
from app.routes.inventory import router as inventory_router
from app.routes.ingredients import router as ingredients_router
from app.routes.feedback import router as feedback_router

app = FastAPI(
    title="AI Food Management API"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(orders_router)
app.include_router(deliveries_router)
app.include_router(admin_router)
app.include_router(ai_router)
app.include_router(restaurants_router)
app.include_router(foods_router)
app.include_router(kitchen_router)
app.include_router(inventory_router)
app.include_router(ingredients_router)
app.include_router(feedback_router)

@app.get("/")
def home():
    return {
        "message": "Backend is running successfully"
    }


@app.get("/test-db")
def test_database():

    success, message = check_database_connection()

    if success:
        return {
            "status": "success",
            "message": message
        }

    return {
        "status": "error",
        "message": message
    }
   