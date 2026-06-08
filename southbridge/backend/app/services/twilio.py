from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from app.core.config import settings
import re

account_sid = settings.TWILIO_ACCOUNT_SID
auth_token = settings.TWILIO_AUTH_TOKEN

client = Client(account_sid, auth_token)

def validate_phone_number(phone_number: str) -> bool:
    """Validate if phone number is not a short code"""
    # Remove any non-digit characters
    clean_number = re.sub(r'\D', '', phone_number)
    
    # Check if it's a short code (typically 5-6 digits or starts with certain patterns)
    if len(clean_number) <= 6:
        return False
    
    # Indian short codes often start with 8 or 9 and are 5-6 digits
    if len(clean_number) == 5 or len(clean_number) == 6:
        return False
    
    # Additional check for Indian mobile numbers (should be 10 digits after country code)
    if clean_number.startswith('91') and len(clean_number) == 12:
        # Check if it's a valid Indian mobile number (starts with 6,7,8,9)
        mobile_part = clean_number[2:]
        if mobile_part[0] in ['6', '7', '8', '9']:
            return True
    
    return True

def format_phone_number(phone_number: str) -> str:
    """Format phone number for Twilio"""
    # Remove any non-digit characters
    clean_number = re.sub(r'\D', '', phone_number)
    
    # If it doesn't start with country code, add +91 for India
    if not clean_number.startswith('91'):
        clean_number = '91' + clean_number
    
    return '+' + clean_number

def send_otp(to: str, otp: str):
    """Send OTP via SMS with proper validation"""
    try:
        # Format the phone number
        formatted_number = format_phone_number(to)
        
        # Validate the phone number
        if not validate_phone_number(formatted_number):
            raise ValueError(f"Invalid phone number: {to}. Short codes are not allowed.")
        print(otp,"sended ")
        message = client.messages.create(
            from_=settings.TWILIO_PHONE_NUMBER,  # Use from config instead of hardcoded
            body=f"Your OTP is: {otp}",
            to=formatted_number
        )
        return message.sid
    except TwilioRestException as e:
        raise ValueError(f"Failed to send SMS: {e.msg}")
    except Exception as e:
        raise ValueError(f"Error sending OTP: {str(e)}")

