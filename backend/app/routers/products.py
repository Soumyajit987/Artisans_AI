from datetime import datetime, timezone
import math

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..database import products_collection
from ..schemas import ProductCreate


router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


# =====================================================
# SAFE NUMBER
# =====================================================

def safe_number(value, default=0):

    """
    MongoDB may contain NaN / infinity values.

    JSON does not support:
        NaN
        Infinity
        -Infinity

    So convert invalid numbers to a safe value.
    """

    try:

        number = float(value)

        if not math.isfinite(number):

            return default

        return number

    except (
        TypeError,
        ValueError
    ):

        return default


# =====================================================
# PRODUCT RESPONSE
# =====================================================

def product_response(product):

    return {

        "id":
            str(
                product["_id"]
            ),

        "name":
            product.get(
                "name",
                ""
            ),

        "category":
            product.get(
                "category",
                ""
            ),

        "description":
            product.get(
                "description",
                ""
            ),

        # ---------------------------------------------
        # PRICES
        # ---------------------------------------------

        "price":
            safe_number(
                product.get(
                    "price",
                    0
                )
            ),

        "recommended_price":
            safe_number(
                product.get(
                    "recommended_price",
                    0
                )
            ),

        "market_min":
            safe_number(
                product.get(
                    "market_min",
                    0
                )
            ),

        "market_max":
            safe_number(
                product.get(
                    "market_max",
                    0
                )
            ),

        # ---------------------------------------------
        # IMAGE / LANGUAGE
        # ---------------------------------------------

        "image_url":
            product.get(
                "image_url"
            ),

        "language":
            product.get(
                "language",
                "English"
            ),

        "status":
            product.get(
                "status",
                "Published"
            ),

        # ---------------------------------------------
        # PRICING INPUTS
        # ---------------------------------------------

        "labor_hours":
            safe_number(
                product.get(
                    "labor_hours"
                ),
                None
            ),

        "quantity":
            safe_number(
                product.get(
                    "quantity"
                ),
                None
            ),

        "length":
            safe_number(
                product.get(
                    "length"
                ),
                None
            ),

        "width":
            safe_number(
                product.get(
                    "width"
                ),
                None
            ),

        "height":
            safe_number(
                product.get(
                    "height"
                ),
                None
            ),

        "item_type":
            product.get(
                "item_type"
            ),

        "material_type":
            product.get(
                "material_type"
            ),

        "finish_type":
            product.get(
                "finish_type"
            ),

        "urgency_level":
            product.get(
                "urgency_level"
            ),

        "pricing_source":
            product.get(
                "pricing_source"
            ),

        # ---------------------------------------------
        # DATE
        # ---------------------------------------------

        "created_at":
            product.get(
                "created_at"
            )

    }


# =====================================================
# GET ALL PRODUCTS
# =====================================================

@router.get("/")
def get_products(
    current_user=Depends(
        get_current_user
    )
):

    products = (
        products_collection
        .find(
            {
                "user_id":
                    current_user["_id"]
            }
        )
        .sort(
            "created_at",
            -1
        )
    )

    return [
        product_response(product)
        for product in products
    ]


# =====================================================
# GET SINGLE PRODUCT
# =====================================================

@router.get("/{product_id}")
def get_product(
    product_id: str,
    current_user=Depends(
        get_current_user
    )
):

    if not ObjectId.is_valid(
        product_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid product ID."
        )


    product = products_collection.find_one(
            {
                "_id":
                    ObjectId(
                        product_id
                    ),

                "user_id":
                    current_user["_id"]
            }
        )


    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )


    return product_response(
        product
    )


# =====================================================
# CREATE PRODUCT
# =====================================================

@router.post("/")
def create_product(
    product: ProductCreate,
    current_user=Depends(
        get_current_user
    )
):

    # ---------------------------------------------
    # BASIC VALIDATION
    # ---------------------------------------------

    if product.price <= 0:

        raise HTTPException(
            status_code=400,
            detail="Product price must be greater than zero."
        )


    if product.labor_hours <= 0:

        raise HTTPException(
            status_code=400,
            detail="Labor hours must be greater than zero."
        )


    if product.quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero."
        )


    if (
        product.length <= 0
        or product.width <= 0
        or product.height <= 0
    ):

        raise HTTPException(
            status_code=400,
            detail="Product dimensions must be greater than zero."
        )


    # ---------------------------------------------
    # CHECK ALL NUMERIC VALUES
    # ---------------------------------------------

    numeric_values = [

        product.price,

        product.recommended_price,

        product.market_min,

        product.market_max,

        product.labor_hours,

        product.quantity,

        product.length,

        product.width,

        product.height

    ]


    for value in numeric_values:

        if not math.isfinite(
            float(value)
        ):

            raise HTTPException(
                status_code=400,
                detail="Product contains an invalid numeric value."
            )


    # ---------------------------------------------
    # PRODUCT DOCUMENT
    # ---------------------------------------------

    document = {

        "user_id":
            current_user["_id"],

        "name":
            product.name,

        "category":
            product.category,

        "description":
            product.description,

        "language":
            product.language,

        "image_url":
            product.image_url,

        # -----------------------------------------
        # PRICES
        # -----------------------------------------

        "price":
            float(
                product.price
            ),

        "recommended_price":
            float(
                product.recommended_price
            ),

        "market_min":
            float(
                product.market_min
            ),

        "market_max":
            float(
                product.market_max
            ),

        "pricing_source":
            "XGBoost Dynamic Pricing Model",

        # -----------------------------------------
        # PRICING INPUTS
        # -----------------------------------------

        "labor_hours":
            float(
                product.labor_hours
            ),

        "quantity":
            int(
                product.quantity
            ),

        "length":
            float(
                product.length
            ),

        "width":
            float(
                product.width
            ),

        "height":
            float(
                product.height
            ),

        "item_type":
            product.item_type,

        "material_type":
            product.material_type,

        "finish_type":
            product.finish_type,

        "urgency_level":
            product.urgency_level,

        # -----------------------------------------
        # STATUS
        # -----------------------------------------

        "status":
            "Published",

        "created_at":
            datetime.now(
                timezone.utc
            )

    }


    # ---------------------------------------------
    # SAVE TO MONGODB
    # ---------------------------------------------

    result = products_collection.insert_one(
            document
        )


    # ---------------------------------------------
    # RETURN PRODUCT
    # ---------------------------------------------

    created_product = products_collection.find_one(
            {
                "_id":
                    result.inserted_id
            }
        )


    return product_response(
        created_product
    )


# =====================================================
# DELETE PRODUCT
# =====================================================

@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    current_user=Depends(
        get_current_user
    )
):

    if not ObjectId.is_valid(
        product_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid product ID."
        )


    result = products_collection.delete_one(
            {
                "_id":
                    ObjectId(
                        product_id
                    ),

                "user_id":
                    current_user["_id"]
            }
        )


    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )


    return {

        "message":
            "Product deleted successfully."

    }