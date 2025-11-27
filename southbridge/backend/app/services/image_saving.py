

def save_image_to_media(image_base64: str, folder: str = "loads") -> str:
    """Save base64 image to local media folder and return the relative path"""
    import base64
    import os
    import uuid

    MEDIA_ROOT = "uploads"  # Ensure this folder exists
    folder_path = os.path.join(MEDIA_ROOT, folder)
    os.makedirs(folder_path, exist_ok=True)

    file_extension = "jpg"
    if image_base64.startswith("data:image/"):
        header = image_base64.split(",")[0]
        if "jpeg" in header or "jpg" in header:
            file_extension = "jpg"
        elif "png" in header:
            file_extension = "png"
        elif "webp" in header:
            file_extension = "webp"
        image_data = image_base64.split(",")[1]
    else:
        image_data = image_base64

    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(folder_path, filename)
    image_binary = base64.b64decode(image_data)

    with open(file_path, "wb") as f:
        f.write(image_binary)

    return os.path.join(folder, filename)  # Return relative path