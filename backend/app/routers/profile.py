from fastapi import APIRouter, Depends

from ..auth import get_current_user
from ..database import (
    users_collection,
    products_collection,
    orders_collection
)

from ..schemas import ProfileUpdate


router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"]
)


@router.get("/")
def get_profile(
    current_user=Depends(get_current_user)
):

    product_count = products_collection.count_documents(
        {
            "user_id": current_user["_id"]
        }
    )

    order_count = orders_collection.count_documents(
        {
            "user_id": current_user["_id"]
        }
    )

    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "mobile": current_user["mobile"],
        "email": current_user["email"],
        "age": current_user["age"],
        "category": current_user["category"],
        "location": current_user["location"],
        "language": current_user["language"],
        "verified": current_user["verified"],
        "product_count": product_count,
        "order_count": order_count
    }


@router.put("/")
def update_profile(
    data: ProfileUpdate,
    current_user=Depends(get_current_user)
):

    users_collection.update_one(
        {
            "_id": current_user["_id"]
        },
        {
            "$set": {
                "name": data.name,
                "mobile": data.mobile,
                "age": data.age,
                "category": data.category,
                "location": data.location,
                "language": data.language
            }
        }
    )

    return {
        "message": "Profile updated successfully"
    }