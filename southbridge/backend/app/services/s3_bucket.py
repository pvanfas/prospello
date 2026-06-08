import base64
import uuid

import boto3
import os
from botocore.client import Config
from app.core.config import settings

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,  # change region if needed
    config=Config(signature_version="s3v4")
)

BUCKET_NAME = settings.BUCKET_NAME


def upload_image_to_s3(image_base64: str, folder: str = "loads") -> str:
    # Generate unique filename
    try:
        print("uploading image to s3")
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

        filename = f"{folder}/{uuid.uuid4()}.{file_extension}"
        image_binary = base64.b64decode(image_data)

        # Upload to S3
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=filename,
            Body=image_binary,
            ContentType=f"image/{file_extension}"
        )

        # Return public URL (or just the key if you prefer)
        image_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{filename}"
        return image_url
    except Exception as e:
        print(e)
        return None


def get_signed_url(filename: str, expiration: int = 3600) -> str:
    """Generate a signed URL for private S3 objects"""
    try:
        # Generate a signed URL that expires in 1 hour (3600 seconds)
        signed_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': filename},
            ExpiresIn=expiration
        )
        return signed_url
    except Exception as e:
        print(f"Error generating signed URL: {e}")
        return None