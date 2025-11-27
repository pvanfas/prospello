import io, base64, requests, re, os
from PIL import Image
import pytesseract

# If Tesseract is not in PATH, set it manually (esp. for Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def _fetch_image(image_url: str) -> bytes:
    resp = requests.get(image_url, timeout=15)
    resp.raise_for_status()
    return resp.content

def _decode_base64(b64: str) -> bytes:
    if "," in b64:
        b64 = b64.split(",")[-1]
    return base64.b64decode(b64)

def ocr_from_image(image_url: str = None, image_base64: str = None) -> str:
    """
    Convert image to raw text. Supports English + native Indian languages.
    """
    try:
        if image_url:
            img_bytes = _fetch_image(image_url)
        elif image_base64:
            img_bytes = _decode_base64(image_base64)
        else:
            raise ValueError("Either image_url or image_base64 must be provided")

        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Use only installed languages; start with eng+hin (extend later)
        lang_str = "eng+hin"
        text = pytesseract.image_to_string(image, lang=lang_str)

        # Clean text
        text = re.sub(r"\s+", " ", text).strip()
        return text

    except pytesseract.TesseractNotFoundError:
        raise RuntimeError("Tesseract is not installed or not in PATH. Please install it.")
    except Exception as e:
        raise RuntimeError(f"OCR failed: {str(e)}")