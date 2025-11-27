from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Deluxe Non-Vegetarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"day": "MON", "model_no": "DNV 01 BF001", "item": "CHAPATI + EGG STEW"},
                {"day": "TUE", "model_no": "DNV 01 BF002", "item": "POROTTA + SAUSAGE CURRY"},
                {"day": "WED", "model_no": "DNV 01 BF003", "item": "CHAPATI+ CHICKEN KURMA"},
                {"day": "THU", "model_no": "DNV 01 BF004", "item": "SEMIYA UPMA + EGG ROAST"},
                {"day": "FRI", "model_no": "DNV 01 BF005", "item": "ALOO PARATHA + CHICKEN CURRY"},
                {"day": "SAT", "model_no": "DNV 01 BF006", "item": "CHAPATI + ALOO GOBI"},
                {"day": "SUN", "model_no": "DNV 01 BF007", "item": "RAVA IDLI + CHICKEN CURRY"},
            ],
            "tiffin_lunch": [
                {"day": "MON", "model_no": "DNV 01 TL001", "item": "GARLIC RICE + SOYA CHUNKS ROAST +DRY MOONG DAL CURRY"},
                {"day": "TUE", "model_no": "DNV 01 TL002", "item": "CHICKEN FRIED RICE + CHILLI GOBI + CHILLI VINEGAR"},
                {"day": "WED", "model_no": "DNV 01 TL003", "item": "WHITE RICE + RAJMA MASALA + DRY SUBZI"},
                {"day": "THU", "model_no": "DNV 01 TL004", "item": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA"},
                {"day": "FRI", "model_no": "DNV 01 TL005", "item": "CHICKEN BIRIYANI + PICKLE + CRUNCH PACK"},
                {"day": "SAT", "model_no": "DNV 01 TL006", "item": "TOMATO RICE + MASHROOM MASALA + CHUTNEY POWDER"},
                {"day": "SUN", "model_no": "DNV 01 TL007", "item": "CHICKEN SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE"},
            ],
            "lunch": [
                {"day": "MON", "model_no": "DNV 01 L001", "item": "GHEE RICE + CHICKEN CURRY + CUMIN YOGURT + PICKLE"},
                {"day": "MON", "model_no": "DNV 01 L002", "item": "BARIK RICE 1 CHAPATI + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SCH"},
                {"day": "TUE", "model_no": "DNV 01 L003", "item": "MOTTA RICE 1 CHAPATI + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SC"},
                {"day": "WED", "model_no": "DNV 01 L004", "item": "BARIK RICE 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA"},
                {"day": "THU", "model_no": "DNV 01 L005", "item": "MOTTA RICE 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA"},
                {"day": "THU", "model_no": "DNV 01 L006", "item": "BARIK RICE 1 CHAPATI + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SC"},
                {"day": "THU", "model_no": "DNV 01 L007", "item": "MOTTA RICE 1 CHAPATI + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SC"},
                {"day": "FRI", "model_no": "DNV 01 L008", "item": "CHICKEN BIRIYANI + PICKLE+ RAITHA + CRUNCH PACK + SWEET"},
                {"day": "SAT", "model_no": "DNV 01 L009", "item": "BARIK RICE 1 CHAPATI + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SCH"},
                {"day": "SUN", "model_no": "DNV 01 L010", "item": "MOTTA RICE 1 CHAPATI + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SC"},
                {"day": "SUN", "model_no": "DNV 01 L011", "item": "CHICKEN MANDI + SALSA + YOUGURT + PICKLE"},
            ],
            "dinner": [
                {"day": "MON", "model_no": "DNV 01 D001", "item": "CHAPATI + CHICKEN KADAI + SALAD"},
                {"day": "TUE", "model_no": "DNV 01 D002", "item": "CHICKEN KABSA + SALSA + SALAD"},
                {"day": "WED", "model_no": "DNV 01 D003", "item": "WHEAT POROTTA + CHICKEN MASALA + SALAD"},
                {"day": "THU", "model_no": "DNV 01 D004", "item": "CHAPATI + SAUSAGE ROAST+ SALAD"},
                {"day": "FRI", "model_no": "DNV 01 D005", "item": "POROTTA + CHICKEN CHILLI+ SALAD"},
                {"day": "SAT", "model_no": "DNV 01 D006", "item": "GHEE RICE + BEEF CURRY + PICKLE + SALAD"},
                {"day": "SUN", "model_no": "DNV 01 D007", "item": "POROTTA + CHICKEN ROGAN JOSH + SALAD"},
            ],
        }

        # Get the Deluxe Non-Vegetarian meal category
        try:
            meal_category = MealCategory.objects.get(id="c79ac7ee-d035-4be7-beda-f0958b36fa1c")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID c79ac7ee-d035-4be7-beda-f0958b36fa1c not found"))
            return

        created_count = 0
        skipped_count = 0
        error_count = 0

        # Process each meal type
        for meal_type, menu_items in menu_data.items():
            self.stdout.write(f"\nProcessing {meal_type.upper()}...")

            for menu_item in menu_items:
                day = self.map_day_abbreviation(menu_item["day"])
                model_no = menu_item["model_no"]
                dish_name = menu_item["item"]

                try:
                    # Find the ItemMaster by item_code
                    item_master = ItemMaster.objects.get(item_code=model_no)

                    # Check if meal plan already exists
                    existing_plan = MealPlan.objects.filter(meal_category=meal_category, day=day, menu_item=item_master).first()

                    if existing_plan:
                        self.stdout.write(f"  Meal plan already exists for {day} {meal_type.upper()}: {dish_name}")
                        skipped_count += 1
                        continue

                    # Create new meal plan
                    meal_plan = MealPlan.objects.create(meal_category=meal_category, day=day, menu_item=item_master, is_fallback=False)

                    self.stdout.write(f"  Created meal plan for {day} {meal_type.upper()}: {dish_name} ({model_no})")
                    created_count += 1

                except ItemMaster.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f"  Error: ItemMaster with code '{model_no}' not found for {day} {meal_type.upper()}: {dish_name}"))
                    error_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  Error creating meal plan for {day} {meal_type.upper()}: {str(e)}"))
                    error_count += 1

        self.stdout.write("\n=== Summary ===")
        self.stdout.write(f"Created: {created_count}")
        self.stdout.write(f"Skipped: {skipped_count}")
        self.stdout.write(f"Errors: {error_count}")
        self.stdout.write(f"Total processed: {created_count + skipped_count + error_count}")

    def map_day_abbreviation(self, day_abbr):
        """Map day abbreviation to full day name"""
        mapping = {"MON": "Monday", "TUE": "Tuesday", "WED": "Wednesday", "THU": "Thursday", "FRI": "Friday", "SAT": "Saturday", "SUN": "Sunday"}
        return mapping.get(day_abbr, day_abbr)
