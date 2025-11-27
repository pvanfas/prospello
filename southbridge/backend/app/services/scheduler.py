# app/services/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from zoneinfo import ZoneInfo

# Simple in-memory scheduler (fast to start with)
scheduler = BackgroundScheduler(timezone=ZoneInfo("Asia/Kolkata"))
