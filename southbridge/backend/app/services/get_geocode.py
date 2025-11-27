import googlemaps
import requests
from app.core.config import settings

def get_geocode(address: str):
    api_key = settings.GOOGLE_MAPS_API_KEY
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': api_key
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'OK':
            location = data['results'][0]['geometry']['location']
            return (location['lat'], location['lng'])
    return None

gmaps = googlemaps.Client(key=settings.GOOGLE_API_KEY)

def geocode_address(address: str):
    result = gmaps.geocode(address)
    if result:
        loc = result[0]["geometry"]["location"]
        return {
            "lat": loc["lat"],
            "lng": loc["lng"],
            "place_id": result[0].get("place_id")
        }
    return None