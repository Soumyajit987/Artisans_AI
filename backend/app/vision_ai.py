import io
import os
import logging
from typing import List
from PIL import Image, ImageEnhance, ImageOps
import pillow_avif  
from pillow_heif import register_heif_opener  
from rembg import remove, new_session

register_heif_opener()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KARIGARAI_CV")

# Global session cache keeps ONNX model warm in server RAM
SESSION = new_session("bria-rmbg")

class ImageProcessingError(Exception):
    """Custom exception for corrupt or unreadable image uploads."""
    pass

def enhance_artisan_photo(
    image_bytes: bytes, 
    max_dimension: int = 1920,
    target_padding: int = 40
) -> bytes:
    """
    Production-grade CV pipeline optimized for artisan e-commerce.
    Handles corrupt files, arbitrary aspect ratios, camera EXIF rotation,
    and clean precision alpha matting without harsh edge artifacts.
    """
    try:
        raw_img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        logger.error(f"Failed to decode image stream: {str(e)}")
        raise ImageProcessingError("Uploaded file is corrupted or not a valid image format.")

    # 1. Normalize color spaces & apply EXIF sensor orientation
    if raw_img.mode != "RGBA":
        raw_img = raw_img.convert("RGBA")
    raw_img = ImageOps.exif_transpose(raw_img)
    
    # 2. Memory-safe downscaling for oversized images
    orig_w, orig_h = raw_img.size
    if max(orig_w, orig_h) > max_dimension:
        raw_img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
    
    # 3. Precision AI Background Removal (Balanced matting without aggressive erosion)
    nobg_img = remove(
        raw_img, 
        session=SESSION,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=3  # Reduced from 10 to prevent eating into fine details
    )
    
    # 4. Auto-crop empty transparent padding around subject bounds
    bbox = nobg_img.getbbox()
    if bbox:
        nobg_img = nobg_img.crop(bbox)
    
    # 5. Clean studio white canvas composition with uniform padding
    width, height = nobg_img.size
    padded_size = (width + 2 * target_padding, height + 2 * target_padding)
    studio_canvas = Image.new("RGBA", padded_size, (255, 255, 255, 255))
    studio_canvas.paste(nobg_img, (target_padding, target_padding), mask=nobg_img)
    composite_img = studio_canvas.convert("RGB")
    
    # 6. Subtle color grading & crisp visual pop
    enhanced = ImageEnhance.Contrast(composite_img).enhance(1.05)
    final_img = ImageEnhance.Sharpness(enhanced).enhance(1.10)
    
    # 7. Optimized JPEG stream compression
    output_buffer = io.BytesIO()
    final_img.save(
        output_buffer, 
        format="JPEG", 
        quality=95, 
        optimize=True
    )
    return output_buffer.getvalue()

def enhance_artisan_photo_batch(image_bytes_list: List[bytes]) -> List[bytes]:
    """Processes multiple image streams safely in sequence."""
    return [enhance_artisan_photo(img_bytes) for img_bytes in image_bytes_list]

