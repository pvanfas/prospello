"""
Utility functions for working with Google Maps polylines
"""
import json
from typing import List, Dict, Tuple, Optional


def decode_polyline(polyline: str) -> List[Tuple[float, float]]:
    """
    Decode a Google Maps polyline string into a list of (lat, lng) coordinates.
    
    Args:
        polyline: Encoded polyline string from Google Maps
        
    Returns:
        List of (latitude, longitude) tuples
    """
    if not polyline:
        return []
    
    def decode_coordinate(coord: int) -> float:
        """Decode a single coordinate from polyline encoding"""
        return coord / 1e5
    
    coordinates = []
    index = 0
    lat = 0
    lng = 0
    
    while index < len(polyline):
        # Decode latitude
        shift = 0
        result = 0
        while True:
            byte = ord(polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if byte < 0x20:
                break
        lat += ~(result >> 1) if result & 1 else result >> 1
        
        # Decode longitude
        shift = 0
        result = 0
        while True:
            byte = ord(polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if byte < 0x20:
                break
        lng += ~(result >> 1) if result & 1 else result >> 1
        
        coordinates.append((decode_coordinate(lat), decode_coordinate(lng)))
    
    return coordinates


def encode_polyline(coordinates: List[Tuple[float, float]]) -> str:
    """
    Encode a list of (lat, lng) coordinates into a Google Maps polyline string.
    
    Args:
        coordinates: List of (latitude, longitude) tuples
        
    Returns:
        Encoded polyline string
    """
    if not coordinates:
        return ""
    
    def encode_coordinate(coord: float, prev_coord: int) -> str:
        """Encode a single coordinate for polyline"""
        coord = int(coord * 1e5)
        diff = coord - prev_coord
        
        # Handle negative values
        if diff < 0:
            diff = ~(diff << 1)
        else:
            diff = diff << 1
        
        encoded = ""
        while diff >= 0x20:
            encoded += chr((0x20 | (diff & 0x1f)) + 63)
            diff >>= 5
        encoded += chr(diff + 63)
        
        return encoded
    
    polyline = ""
    prev_lat = 0
    prev_lng = 0
    
    for lat, lng in coordinates:
        polyline += encode_coordinate(lat, prev_lat)
        polyline += encode_coordinate(lng, prev_lng)
        prev_lat = int(lat * 1e5)
        prev_lng = int(lng * 1e5)
    
    return polyline


def get_polyline_bounds(polyline: str) -> Dict[str, float]:
    """
    Get the bounding box (bounds) of a polyline.
    
    Args:
        polyline: Encoded polyline string
        
    Returns:
        Dictionary with north, south, east, west bounds
    """
    coordinates = decode_polyline(polyline)
    if not coordinates:
        return {}
    
    lats = [coord[0] for coord in coordinates]
    lngs = [coord[1] for coord in coordinates]
    
    return {
        "north": max(lats),
        "south": min(lats),
        "east": max(lngs),
        "west": min(lngs)
    }


def calculate_polyline_distance(polyline: str) -> float:
    """
    Calculate the approximate distance of a polyline in kilometers.
    
    Args:
        polyline: Encoded polyline string
        
    Returns:
        Distance in kilometers
    """
    coordinates = decode_polyline(polyline)
    if len(coordinates) < 2:
        return 0.0
    
    total_distance = 0.0
    
    for i in range(1, len(coordinates)):
        lat1, lng1 = coordinates[i-1]
        lat2, lng2 = coordinates[i]
        total_distance += haversine_distance(lat1, lng1, lat2, lng2)
    
    return total_distance


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the distance between two points using the Haversine formula.
    
    Args:
        lat1, lng1: First point coordinates
        lat2, lng2: Second point coordinates
        
    Returns:
        Distance in kilometers
    """
    import math
    
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlng / 2) ** 2)
    
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c
    
    return distance


def format_polyline_for_frontend(polyline: str) -> Dict:
    """
    Format polyline data for frontend consumption.
    
    Args:
        polyline: Encoded polyline string
        
    Returns:
        Dictionary with formatted polyline data
    """
    if not polyline:
        return {
            "encoded": "",
            "decoded": [],
            "bounds": {},
            "distance_km": 0,
            "point_count": 0
        }
    
    decoded = decode_polyline(polyline)
    bounds = get_polyline_bounds(polyline)
    distance = calculate_polyline_distance(polyline)
    
    return {
        "encoded": polyline,
        "decoded": decoded,
        "bounds": bounds,
        "distance_km": round(distance, 2),
        "point_count": len(decoded)
    }
