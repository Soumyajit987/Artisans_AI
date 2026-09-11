from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..database import products_collection
from ..schemas import ProductCreate


router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


def product_response(product):

    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "category": product["category"],
        "description": product["description"],
        "price": product["price"],
        "recommended_price": product["recommended_price"],
        "market_min": product["market_min"],
        "market_max": product["market_max"],
        "image_url": product.get("image_url"),
        "language": product.get("language", "English"),
        "status": product["status"],
        "created_at": product["created_at"]
    }


@router.get("/")
def get_products(
    current_user=Depends(get_current_user)
):

    products = products_collection.find(
        {
            "user_id": current_user["_id"]
        }
    ).sort(
        "created_at",
        -1
    )

    return [
        product_response(product)
        for product in products
    ]


@router.get("/{product_id}")
def get_product(
    product_id: str,
    current_user=Depends(get_current_user)
):

    if not ObjectId.is_valid(product_id):

        raise HTTPException(
            status_code=400,
            detail="Invalid product ID"
        )

    product = products_collection.find_one(
        {
            "_id": ObjectId(product_id),
            "user_id": current_user["_id"]
        }
    )

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product_response(product)


@router.post("/")
def create_product(
    product: ProductCreate,
    current_user=Depends(get_current_user)
):

    recommended = round(
        (product.price * 1.10) / 10
    ) * 10

    market_min = round(
        (recommended * 0.85) / 10
    ) * 10

    market_max = round(
        (recommended * 1.20) / 10
    ) * 10

    from datetime import datetime, timezone

    document = {
        "user_id": current_user["_id"],
        "name": product.name,
        "category": product.category,
        "description": product.description,
        "price": product.price,
        "recommended_price": recommended,
        "market_min": market_min,
        "market_max": market_max,
        "image_url": product.image_url,
        "language": product.language,
        "status": "Published",
        "created_at": datetime.now(timezone.utc)
    }

    result = products_collection.insert_one(
        document
    )

    document["_id"] = result.inserted_id

    return product_response(document)


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    current_user=Depends(get_current_user)
):

    if not ObjectId.is_valid(product_id):

        raise HTTPException(
            status_code=400,
            detail="Invalid product ID"
        )

    result = products_collection.delete_one(
        {
            "_id": ObjectId(product_id),
            "user_id": current_user["_id"]
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "message": "Product deleted successfully"
    }