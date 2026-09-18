from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db_config import db
from bson import ObjectId
from datetime import datetime


router = APIRouter(
    prefix="/api/feedback",
    tags=["Feedback"]
)


# =========================
# Feedback Model
# =========================

class FeedbackCreate(BaseModel):
    customerId: str
    restaurantId: str
    rating: int
    comment: str


# =========================
# GET ALL FEEDBACK
# =========================

@router.get("/")
def get_all_feedback():
    try:
        feedbacks = list(
            db["feedback"].find({}).sort("createdAt", -1)
        )

        for feedback in feedbacks:
            feedback["_id"] = str(feedback["_id"])

        return feedbacks

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch feedback: {str(e)}"
        )


# =========================
# GET FEEDBACK BY ID
# =========================

@router.get("/{feedback_id}")
def get_feedback(feedback_id: str):
    try:
        feedback = db["feedback"].find_one(
            {"_id": ObjectId(feedback_id)}
        )

        if not feedback:
            raise HTTPException(
                status_code=404,
                detail="Feedback not found"
            )

        feedback["_id"] = str(feedback["_id"])

        return feedback

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch feedback: {str(e)}"
        )


# =========================
# CREATE FEEDBACK
# =========================

@router.post("/")
def create_feedback(feedback: FeedbackCreate):
    try:
        # Validate rating
        if feedback.rating < 1 or feedback.rating > 5:
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 1 and 5"
            )

        feedback_data = feedback.model_dump()

        feedback_data["createdAt"] = datetime.utcnow()

        result = db["feedback"].insert_one(
            feedback_data
        )

        feedback_data["_id"] = str(result.inserted_id)

        return feedback_data

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create feedback: {str(e)}"
        )


# =========================
# UPDATE FEEDBACK
# =========================

@router.put("/{feedback_id}")
def update_feedback(
    feedback_id: str,
    feedback: FeedbackCreate
):
    try:
        # Validate rating
        if feedback.rating < 1 or feedback.rating > 5:
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 1 and 5"
            )

        updated_data = feedback.model_dump()

        result = db["feedback"].update_one(
            {"_id": ObjectId(feedback_id)},
            {"$set": updated_data}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Feedback not found"
            )

        updated_feedback = db["feedback"].find_one(
            {"_id": ObjectId(feedback_id)}
        )

        updated_feedback["_id"] = str(
            updated_feedback["_id"]
        )

        return updated_feedback

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update feedback: {str(e)}"
        )


# =========================
# DELETE FEEDBACK
# =========================

@router.delete("/{feedback_id}")
def delete_feedback(feedback_id: str):
    try:
        result = db["feedback"].delete_one(
            {"_id": ObjectId(feedback_id)}
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Feedback not found"
            )

        return {
            "message": "Feedback deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete feedback: {str(e)}"
        )