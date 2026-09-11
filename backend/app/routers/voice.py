import os
import shutil
import tempfile

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile
)

from ..auth import get_current_user
from ..nlp_ai import (
    process_artisan_voice,
    ArtisanListing
)


router = APIRouter(
    prefix="/api/voice",
    tags=["Voice AI"]
)


ALLOWED_TYPES = {
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/m4a",
    "audio/mp4",
    "audio/webm",
    "audio/ogg",
    "audio/x-m4a",
    "audio/aac",
    "audio/x-aac"
}


ALLOWED_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".mp4",
    ".webm",
    ".ogg",
    ".aac"
}


@router.post(
    "/process",
    response_model=ArtisanListing
)
async def process_voice(
    file: UploadFile = File(...),
    target_language: str = "en",
    current_user=Depends(get_current_user)
):

    print("\n==============================")
    print("VOICE REQUEST RECEIVED")
    print("==============================")

    print("User:", current_user["email"])
    print("Filename:", file.filename)
    print("Content type:", file.content_type)


    # ==========================================
    # CHECK FILE
    # ==========================================

    extension = os.path.splitext(
        file.filename or ""
    )[1].lower()


    if (
        file.content_type not in ALLOWED_TYPES
        and extension not in ALLOWED_EXTENSIONS
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid audio format. "
                "Please upload MP3, WAV, M4A, "
                "MP4, WEBM, OGG or AAC."
            )
        )


    temp_audio_path = None


    try:

        # ======================================
        # SAVE TEMPORARY AUDIO
        # ======================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_audio:

            shutil.copyfileobj(
                file.file,
                temp_audio
            )

            temp_audio_path = temp_audio.name


        print(
            "Audio saved temporarily:",
            temp_audio_path
        )


        # ======================================
        # GEMINI AI
        # ======================================

        print(
            "Sending audio to Gemini..."
        )


        listing_data = process_artisan_voice(
            temp_audio_path,
            target_language
        )


        print(
            "Gemini processing completed!"
        )


        print(
            "VOICE CATALOG GENERATED"
        )


        return listing_data


    except Exception as e:

        print(
            "VOICE AI ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Voice AI processing failed: {str(e)}"
            )
        )


    finally:

        if (
            temp_audio_path
            and os.path.exists(temp_audio_path)
        ):

            os.remove(
                temp_audio_path
            )


            print(
                "Temporary audio deleted."
            )