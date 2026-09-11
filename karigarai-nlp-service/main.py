import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from nlp_ai import process_artisan_voice, ArtisanListing

app = FastAPI(title="KARIGARAI Gemini NLP Microservice", version="1.0.0")

@app.post("/api/v1/process-voice", response_model=ArtisanListing)
async def process_voice_endpoint(file: UploadFile = File(...), target_language: str = "en"):
    """
    Accepts an artisan voice recording (including AAC, MP3, WAV, M4A, OGG, WEBM), 
    processes it via Gemini, and extracts structured e-commerce data safely at zero cost.
    """
    allowed_types = [
        "audio/mpeg",     # mp3
        "audio/wav",      # wav
        "audio/m4a",      # m4a
        "audio/mp4",      # mp4 / iPhone voice memos
        "audio/webm",     # webm (browser recorders)
        "audio/ogg",      # ogg / opus / WhatsApp voice notes
        "audio/x-m4a", 
        "audio/aac",      # aac
        "audio/x-aac"
    ]
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = (".mp3", ".wav", ".m4a", ".mp4", ".webm", ".ogg", ".aac")

    if file.content_type not in allowed_types and file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail="Invalid audio format. Please upload an MP3, WAV, M4A, MP4, WEBM, OGG, or AAC file."
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_audio:
        shutil.copyfileobj(file.file, temp_audio)
        temp_audio_path = temp_audio.name

    try:
        listing_data = process_artisan_voice(temp_audio_path, target_language)
        return listing_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP processing error: {str(e)}")
    finally:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

@app.get("/health")
def health_check():
    return {"status": "online", "service": "KARIGARAI Gemini NLP Engine Active"}