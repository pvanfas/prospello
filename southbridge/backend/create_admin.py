#!/usr/bin/env python3
"""
Simple script to create an admin user by direct database insertion
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import all models to avoid circular dependency issues
from app.models.user import User, UserType
from app.models.bid import Bid  # noqa: F401 - Import to resolve relationship
from app.models.load import Load  # noqa: F401 - Import to resolve relationship
from app.models.order import Order  # noqa: F401 - Import to resolve relationship
from app.models.payment import Payment  # noqa: F401 - Import to resolve relationship
from app.models.route import DriverRoute  # noqa: F401 - Import to resolve relationship
from app.models.service import ServiceProvider, ServiceCategory, ServiceProviderCategory, ServiceBooking, ServiceReview
from sqlalchemy import text, or_
from app.core.database import SessionLocal
from app.core.security import hash_password
import uuid

def create_admin_user(username, email, phone_number, password):
    """Create an admin user by direct SQL insertion"""
    global created
    db = SessionLocal()
    try:
        # Check if admin already exists (check if username, email, or phone already taken)
        existing_admin = db.query(User).filter(
            or_(
                User.username == username,
                User.email == email,
                User.phone_number == phone_number
            )
        ).first()
        
        if existing_admin:
            created = False
            print(f"⚠️  User already exists!")
            if existing_admin.username == username:
                print(f"Username '{username}' is already taken")
            if existing_admin.email == email:
                print(f"Email '{email}' is already registered")
            if existing_admin.phone_number == phone_number:
                print(f"Phone number '{phone_number}' is already in use")
            return
        
        # Create admin user
        admin_id = str(uuid.uuid4())
        password_hash = hash_password(password)
        
        db.execute(text("""
            INSERT INTO users (id, username, email, phone_number, password_hash, role, is_active, created_at, updated_at)
            VALUES (:id, :username, :email, :phone_number, :password_hash, :role, :is_active, NOW(), NOW())
        """), {
            'id': admin_id,
            'username': username,
            'email': email,
            'phone_number': phone_number,
            'password_hash': password_hash,
            'role': "ADMIN",
            'is_active': True
        })
        
        db.commit()
        
        print("✅ Admin user created successfully!")
        print(f"Username: {username}")
        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"Role: ADMIN")
        print(f"Active: True")
        print(f"Phone Number: {phone_number}")
        
    except Exception as e:
        db.rollback()
       
        created = False
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    global created
    created = True
    print("Creating admin user...")
    print("====================================")
    username = input("Enter username: ")
    email = input("Enter email: ")
    phone_number = input("Enter phone number: ")
    password = input("Enter password: ")
    confirm_password = input("Confirm password: ")
    if password != confirm_password:
        print("❌ Passwords do not match")
        exit()
    if not username or not email or not phone_number or not password:
        print("❌ All fields are required")
        exit()
        
    create_admin_user(username, email, phone_number, password)
    if created:
        print("\n🎉 Admin user setup complete!")
        print("You can now login to the admin panel with:")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print(f"Email: {email}")
        print(f"Phone Number: {phone_number}")
    else:
        print("❌ Admin user creation failed")
        exit()
