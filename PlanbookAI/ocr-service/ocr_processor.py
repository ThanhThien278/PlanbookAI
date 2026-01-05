import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import numpy as np

def preprocess_image(image: Image.Image) -> Image.Image:
    """Preprocess image for better OCR"""
    # Convert to numpy array
    img_array = np.array(image)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    
    # Apply threshold
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(thresh)
    
    # Convert back to PIL Image
    return Image.fromarray(denoised)

def process_ocr_image(image: Image.Image) -> str:
    """Process image with OCR"""
    try:
        # Preprocess
        processed = preprocess_image(image)
        
        # OCR with Vietnamese language
        text = pytesseract.image_to_string(
            processed,
            lang='vie+eng',
            config='--psm 6'
        )
        
        return text.strip()
        
    except Exception as e:
        raise Exception(f"OCR processing failed: {e}")