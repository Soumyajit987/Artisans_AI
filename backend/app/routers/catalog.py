from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ..auth import get_current_user
from ..database import products_collection
from ..pricing_ai import predict_price


router = APIRouter(
    prefix="/api/catalog",
    tags=["Catalog"]
)


# =====================================================
# UPLOAD DIRECTORY
# =====================================================

BASE_DIR = Path(__file__).resolve().parents[2]

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    exist_ok=True
)


# =====================================================
# GENERATE SMART CATALOG
# =====================================================

@router.post("/generate")
async def generate_catalog(

    # -------------------------------------------------
    # Existing product information
    # -------------------------------------------------

    name: str = Form(...),

    category: str = Form(...),

    description: str = Form(""),

    language: str = Form("English"),

    # Artisan's own expected price.
    # Optional because AI will calculate the recommended price.
    price: float = Form(0),

    # -------------------------------------------------
    # Pricing AI inputs
    # -------------------------------------------------

    labor_hours: float = Form(...),

    quantity: int = Form(...),

    length: float = Form(...),

    width: float = Form(...),

    height: float = Form(...),

    item_type: str = Form(...),

    material_type: str = Form(...),

    finish_type: str = Form(...),

    urgency_level: str = Form(...),

    # -------------------------------------------------
    # Product image
    # -------------------------------------------------

    image: UploadFile | None = File(None),

    # -------------------------------------------------
    # Logged-in artisan
    # -------------------------------------------------

    current_user=Depends(get_current_user)
):

    # =================================================
    # BASIC VALIDATION
    # =================================================

    if labor_hours <= 0:
        raise HTTPException(
            status_code=400,
            detail="Labor hours must be greater than 0."
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0."
        )

    if length <= 0 or width <= 0 or height <= 0:
        raise HTTPException(
            status_code=400,
            detail="Product dimensions must be greater than 0."
        )


    # =================================================
    # IMAGE UPLOAD
    # =================================================

    image_url = None

    if image:

        # Check content type
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
        }

        if image.content_type not in allowed_types:

            raise HTTPException(
                status_code=400,
                detail="Only JPG, JPEG, PNG and WEBP images are allowed."
            )


        # Read image
        image_bytes = await image.read()


        if not image_bytes:

            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )


        # Generate safe unique filename
        original_name = image.filename or "product.jpg"

        extension = Path(
            original_name
        ).suffix.lower()


        if extension not in {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        }:

            extension = ".jpg"


        filename = (
            f"{uuid4().hex}"
            f"{extension}"
        )


        file_path = UPLOAD_DIR / filename


        # Save image
        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(
                image_bytes
            )


        image_url = (
            f"/uploads/{filename}"
        )


    # =================================================
    # AI PRICE PREDICTION
    # =================================================

    try:

        pricing = predict_price(

            labor_hours=labor_hours,

            quantity=quantity,

            length=length,

            width=width,

            height=height,

            item_type=item_type,

            material_type=material_type,

            finish_type=finish_type,

            urgency_level=urgency_level

        )

    except Exception as e:

        # If pricing model fails, don't silently
        # create a product with a fake price.

        raise HTTPException(
            status_code=500,
            detail=f"Price prediction failed: {str(e)}"
        )


    # =================================================
    # GET AI PRICES
    # =================================================

    recommended_price = pricing[
        "predicted_price"
    ]

    market_min = pricing[
        "market_min"
    ]

    market_max = pricing[
        "market_max"
    ]


    # =================================================
    # CREATE PRODUCT DOCUMENT
    # =================================================

    product_document = {

        # ---------------------------------------------
        # Ownership
        # ---------------------------------------------

        "user_id": current_user["_id"],


        # ---------------------------------------------
        # Product information
        # ---------------------------------------------

        "name": name,

        "category": category,

        "description": description,

        "language": language,


        # ---------------------------------------------
        # Artisan expected price
        # ---------------------------------------------

        "price": price,


        # ---------------------------------------------
        # AI pricing
        # ---------------------------------------------

        "recommended_price": recommended_price,

        "market_min": market_min,

        "market_max": market_max,

        "pricing_source": (
            "XGBoost Dynamic Pricing Model"
        ),


        # ---------------------------------------------
        # Pricing model inputs
        # ---------------------------------------------

        "labor_hours": labor_hours,

        "quantity": quantity,

        "length": length,

        "width": width,

        "height": height,

        "item_type": item_type,

        "material_type": material_type,

        "finish_type": finish_type,

        "urgency_level": urgency_level,


        # ---------------------------------------------
        # Image
        # ---------------------------------------------

        "image_url": image_url,


        # ---------------------------------------------
        # Product status
        # ---------------------------------------------

        "status": "Draft",


        # ---------------------------------------------
        # Timestamp
        # ---------------------------------------------

        "created_at": datetime.now(
            timezone.utc
        )

    }


    # =================================================
    # SAVE TO MONGODB
    # =================================================

    try:

        result = products_collection.insert_one(
            product_document
        )

    except Exception as e:

        # If database insertion fails after image upload,
        # remove the uploaded image.

        if image_url:

            try:
                file_path.unlink(
                    missing_ok=True
                )
            except Exception:
                pass

        raise HTTPException(
            status_code=500,
            detail=f"Could not save product: {str(e)}"
        )


    # =================================================
    # RESPONSE
    # =================================================

    return {

        "message": (
            "Smart catalog generated successfully."
        ),

        "product_id": str(
            result.inserted_id
        ),

        "name": name,

        "category": category,

        "description": description,

        "language": language,

        "image_url": image_url,

        # Artisan's own expected price
        "price": price,

        # AI predicted price
        "recommended_price": recommended_price,

        "market_min": market_min,

        "market_max": market_max,

        "currency": pricing[
            "currency"
        ],

        "pricing_source": (
            "XGBoost Dynamic Pricing Model"
        ),

        "pricing_inputs": {

            "labor_hours": labor_hours,

            "quantity": quantity,

            "length": length,

            "width": width,

            "height": height,

            "item_type": item_type,

            "material_type": material_type,

            "finish_type": finish_type,

            "urgency_level": urgency_level

        },

        "status": "Draft"

    }