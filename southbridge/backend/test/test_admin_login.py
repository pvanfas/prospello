#!/usr/bin/env python3
"""
Test script to verify admin login endpoint
"""

import requests
import json

def test_admin_login():
    """Test the admin login endpoint"""
    
    # Test data
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        # Test admin login endpoint
        response = requests.post(
            "http://localhost:8000/api/v1/admin/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin login successful!")
            print(f"Token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"User: {data.get('user', {})}")
            print(f"Token Type: {data.get('token_type', 'N/A')}")
            print(f"Expires In: {data.get('expires_in', 'N/A')} seconds")
        else:
            print(f"❌ Admin login failed!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Testing admin login endpoint...")
    test_admin_login()
