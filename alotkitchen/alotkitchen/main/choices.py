import calendar
import datetime

import pytz

BOOL_CHOICES = ((True, "Yes"), (False, "No"))
GENDER_CHOICES = (("MALE", "Male"), ("FEMALE", "Female"))
RATING_CHOICES = ((1, "One"), (2, "Two"), (3, "Three"), (4, "Four"), (5, "Five"))
SALUTATION_CHOICES = (("Dr.", "Dr."), ("Miss", "Miss"), ("Mr", "Mr"), ("Mrs", "Mrs"), ("Prof.", "Prof."))
YEAR_CHOICES = [(y, y) for y in range(1950, datetime.date.today().year + 2)]
MONTH_CHOICES = [(i, calendar.month_name[i]) for i in range(1, 13)]
TIMEZONES = [(tz, tz) for tz in pytz.common_timezones]
SELECTION_CHOICES = (("", "Select"), ("yes", "Yes"), ("no", "No"))
PAYMENT_METHOD_CHOICES = (("CASH", "Cash"), ("CHEQUE", "Cheque"), ("BANK", "Bank Transfer"), ("CARD", "Card Payment"))

MEALTYPE_CHOICES = (("BREAKFAST", "Break Fast"), ("DESI_TIFFIN", "Desi Tiffin"), ("LUNCH", "Lunch"), ("TIFFIN_LUNCH", "Tiffin Lunch"), ("DINNER", "Dinner"))
WEEK_CHOICES = ((1, "1st & 3rd Week"), (2, "2nd & 4th Week"))
DAY_CHOICES = (
    ("Monday", "Monday"),
    ("Tuesday", "Tuesday"),
    ("Wednesday", "Wednesday"),
    ("Thursday", "Thursday"),
    ("Friday", "Friday"),
    ("Saturday", "Saturday"),
    ("Sunday", "Sunday"),
)
VALIDITY_CHOICES = ((22, "22 Days"), (26, "26 Days"), (30, "30 Days"))
ORDER_STATUS_CHOICES = (("PENDING", "Pending"), ("IN_PREPERATION", "In Preparation"), ("IN_TRANSIT", "In Transit"), ("DELIVERED", "Delivered"), ("CANCELLED", "Cancelled"))
BREAKFAST_DELIVERY_CHOICES = (
    ("0630:0700", "6:30AM to 7AM"),
    ("0700:0730", "7AM to 7:30AM"),
    ("0730:0800", "7:30AM to 8AM"),
    ("0800:0830", "8AM to 8:30AM"),
    ("0900:0930", "9AM to 9:30AM"),
)

LUNCH_DELIVERY_CHOICES = (
    ("1230:1300", "12:30PM to 1PM"),
    ("1300:1330", "1PM to 1:30PM"),
    ("1330:1400", "1:30PM to 2PM"),
    ("1400:1430", "2PM to 2:30PM"),
    ("1430:1500", "2:30PM to 3PM"),
)

DINNER_DELIVERY_CHOICES = (
    ("1930:2000", "7:30PM to 8PM"),
    ("2000:2030", "8PM to 8:30PM"),
    ("2030:2100", "8:30PM to 9PM"),
    ("2100:2130", "9PM to 9:30PM"),
    ("2130:2200", "9:30PM to 10PM"),
)
GROUP_CHOICES = (
    ("ESSENTIAL", "Essential"),
    ("REGULAR", "Regular"),
    ("DELUXE", "Deluxe"),
    ("STANDARD", "Standard"),
    ("MESS FOR LESS", "Mess for Less"),
    ("PATHU'S KITCHEN", "Pathu's Kitchen"),
    ("CHECHI'S KITCHEN", "Chechi's Kitchen"),
    ("PRIME", "Prime"),
    ("SAVER", "Saver"),
    ("CLASSIC", "Classic"),
    ("PREMIUM", "Premium"),
)
LANGUAGE_CHOICES = (("en", "English"), ("ml", "Malayalam"), ("ar", "Arabic"), ("hi", "Hindi"), ("ta", "Tamil"), ("te", "Telugu"))

BREAKFAST_TIME_CHOICES = [
    ("08:00-08:30", "8:00 AM - 8:30 AM"),
    ("08:30-09:00", "8:30 AM - 9:00 AM"),
    ("09:00-09:30", "9:00 AM - 9:30 AM"),
    ("09:30-10:00", "9:30 AM - 10:00 AM"),
    ("10:00-10:30", "10:00 AM - 10:30 AM"),
    ("10:30-11:00", "10:30 AM - 11:00 AM"),
]

LUNCH_TIME_CHOICES = [
    ("12:00-12:30", "12:00 PM - 12:30 PM"),
    ("12:30-13:00", "12:30 PM - 1:00 PM"),
    ("13:00-13:30", "1:00 PM - 1:30 PM"),
    ("13:30-14:00", "1:30 PM - 2:00 PM"),
    ("14:00-14:30", "2:00 PM - 2:30 PM"),
    ("14:30-15:00", "2:30 PM - 3:00 PM"),
]

DINNER_TIME_CHOICES = [
    ("19:00-19:30", "7:00 PM - 7:30 PM"),
    ("19:30-20:00", "7:30 PM - 8:00 PM"),
    ("20:00-20:30", "8:00 PM - 8:30 PM"),
    ("20:30-21:00", "8:30 PM - 9:00 PM"),
    ("21:00-21:30", "9:00 PM - 9:30 PM"),
    ("21:30-22:00", "9:30 PM - 10:00 PM"),
]
