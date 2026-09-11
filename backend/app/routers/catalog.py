from pathlib import Path
from uuid import uuid4
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
    HTTPException
)

from ..auth import get_current_user
from ..vision_ai import enhance_artisan_photo, ImageProcessingError


router = APIRouter(
    prefix="/api/catalog",
    tags=["Catalog"]
)


BASE_DIR = Path(__file__).resolve().parents[2]

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    exist_ok=True
)


@router.post("/generate")
async def generate_catalog(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    description: str = Form(""),
    language: str = Form("English"),
    image: UploadFile | None = File(None),
    current_user=Depends(get_current_user)
):

    image_url = None

    # ==========================================
    # IMAGE PROCESSING
    # ==========================================

    if image:

        # Check content type
        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
            "image/heic",
            "image/heif"
        ]

        if image.content_type not in allowed_types:

            raise HTTPException(
                status_code=400,
                detail="Unsupported image format."
            )


        try:

            # Read uploaded image
            image_bytes = await image.read()

            if not image_bytes:

                raise HTTPException(
                    status_code=400,
                    detail="Uploaded image is empty."
                )


            # ======================================
            # AI IMAGE ENHANCEMENT
            # ======================================

            processed_bytes = enhance_artisan_photo(
                image_bytes
            )


        except ImageProcessingError as e:

            raise HTTPException(
                status_code=422,
                detail=str(e)
            )


        except HTTPException:

            raise


        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Image processing failed: {str(e)}"
            )


        # ======================================
        # SAVE ENHANCED IMAGE
        # ======================================

        filename = f"{uuid4().hex}_enhanced.jpg"

        file_path = UPLOAD_DIR / filename


        try:

            with open(
                file_path,
                "wb"
            ) as file:

                file.write(processed_bytes)

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Failed to save enhanced image: {str(e)}"
            )


        image_url = f"/uploads/{filename}"


    # ==========================================
    # DESCRIPTION
    # ==========================================

    if not description.strip():

        description = (
            f"A beautiful {category} handcrafted "
            f"by an artisan using traditional techniques."
        )


    # ==========================================
    # PRICE
    # ==========================================

    recommended = round(
        (price * 1.10) / 10
    ) * 10

    market_min = round(
        (recommended * 0.85) / 10
    ) * 10

    market_max = round(
        (recommended * 1.20) / 10
    ) * 10


    # ==========================================
    # RESPONSE
    # ==========================================

    return {

        "name": name,

        "category": category,

        "description": description,

        "price": price,

        "recommended_price": recommended,

        "market_min": market_min,

        "market_max": market_max,

        "image_url": image_url,

        "language": language,

        "image_enhanced": bool(image_url),

        "created_at": datetime.now(
            timezone.utc
        ).isoformat()
    }