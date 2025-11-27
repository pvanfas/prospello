import os
import requests
from typing import List, Dict, Optional, Tuple

from app.core.config import settings
from app.services.get_geocode import geocode_address

try:
    from langchain_openai import ChatOpenAI
    from langchain.prompts import ChatPromptTemplate
except Exception:  # LangChain may not be available in some envs
    ChatOpenAI = None
    ChatPromptTemplate = None


def _format_latlng(lat: float, lng: float) -> str:
    return f"{lat},{lng}"


def _directions_request(
    origin: Tuple[float, float],
    destination: Tuple[float, float],
    waypoints: Optional[List[Tuple[float, float]]] = None,
    departure_time: str = "now",
    alternatives: bool = True,
) -> Dict:
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY not configured")

    base_url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": _format_latlng(*origin),
        "destination": _format_latlng(*destination),
        "key": api_key,
        "departure_time": departure_time,
        "traffic_model": "best_guess",
        "alternatives": str(alternatives).lower(),
        "mode": "driving",
    }

    if waypoints and len(waypoints) > 0:
        # Let Google optimize waypoint order for shortest time
        wp = [f"{lat},{lng}" for lat, lng in waypoints]
        params["waypoints"] = "optimize:true|" + "|".join(wp)

    resp = requests.get(base_url, params=params)
    resp.raise_for_status()
    return resp.json()


def _extract_route_choice(directions_json: Dict) -> Dict:
    routes = directions_json.get("routes", [])
    if not routes:
        raise RuntimeError("No routes found from Directions API")
    # Choose the first route by default; Google sorts by best
    route = routes[0]
    overview_polyline = route.get("overview_polyline", {}).get("points")
    legs = route.get("legs", [])

    # Sum up duration_in_traffic if available, otherwise duration
    total_seconds = 0
    for leg in legs:
        dur = leg.get("duration_in_traffic") or leg.get("duration")
        if dur and dur.get("value"):
            total_seconds += int(dur["value"])

    eta_minutes = round(total_seconds / 60) if total_seconds else None

    # Waypoint order mapping (after optimization)
    waypoint_order = route.get("waypoint_order", [])

    return {
        "polyline": overview_polyline,
        "eta_minutes": eta_minutes,
        "waypoint_order": waypoint_order,
        "legs": legs,
    }


def _risk_prompt() -> Optional[ChatPromptTemplate]:
    if ChatOpenAI is None or ChatPromptTemplate is None:
        return None
    return ChatPromptTemplate.from_template(
        """
        You are a logistics safety analyst. Given the context below, assess monsoon/seasonal risks
        and route resilience (flood-prone segments, landslides, congestion patterns). Return:
        - risk_score: 0.0 (no risk) to 1.0 (very high risk)
        - short_reason: one-paragraph reason

        Context JSON:
        {context}

        Respond strictly in JSON with keys risk_score and short_reason.
        """
    )


def analyze_risk_with_llm(context: Dict) -> Tuple[float, str]:
    prompt = _risk_prompt()
    if prompt is None:  # Fallback when LLM not available
        # Conservative default
        return 0.25, "Default risk assessment (LLM unavailable)."

    llm = ChatOpenAI(
        openai_api_key=getattr(settings, "OPENAI_API_KEY", None),
        model_name="gpt-4o-mini",
        temperature=0.2,
    )
    msg = prompt.format(context=context)
    out = llm.invoke(msg)
    try:
        import json
        data = json.loads(out.content)
        score = float(data.get("risk_score", 0.25))
        reason = str(data.get("short_reason", ""))
        return max(0.0, min(1.0, score)), reason
    except Exception:
        return 0.35, "Heuristic risk assessment (parse fallback)."


def predict_best_path(
    origin: Tuple[float, float],
    destinations: List[Tuple[float, float]],
    season: Optional[str] = None,
    notes: Optional[str] = None,
) -> Dict:
    """
    Uses Google Directions with waypoint optimization for shortest-time path, then runs
    LLM-based risk analysis to provide monsoon/seasonal resilience context.
    Returns a dict with polyline, eta, risk, and ordered destinations.
    """
    if not destinations:
        raise ValueError("No destinations provided")

    final_dest = destinations[-1]
    mid_waypoints = destinations[:-1]

    directions = _directions_request(
        origin=origin,
        destination=final_dest,
        waypoints=mid_waypoints,
        departure_time="now",
        alternatives=True,
    )

    choice = _extract_route_choice(directions)

    context = {
        "season": season or "unknown",
        "notes": notes or "",
        "eta_minutes": choice.get("eta_minutes"),
        "legs": choice.get("legs"),
        "waypoint_count": len(destinations),
    }
    risk_score, risk_reason = analyze_risk_with_llm(context)

    return {
        "polyline": choice.get("polyline"),
        "eta_minutes": choice.get("eta_minutes"),
        "risk_score": risk_score,
        "risk_explanation": risk_reason,
        "waypoint_order": choice.get("waypoint_order", []),
    }


def geocode_if_needed(text: str) -> Optional[Tuple[float, float]]:
    geo = geocode_address(text)
    if not geo:
        return None
    return geo.get("lat"), geo.get("lng")


