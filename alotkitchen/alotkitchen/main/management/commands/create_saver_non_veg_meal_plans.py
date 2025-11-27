from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Saver Non-Vegetarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"days": "MON", "model_no": "SANV 01 BF001", "description": "CHAPATI + EGG STEW"},
                {"days": "TUE", "model_no": "SANV 01 BF002", "description": "POROTTA + SAUSAGE CURRY"},
                {"days": "WED", "model_no": "SANV 01 BF003", "description": "POROTTA + CHICKEN KURMA"},
                {"days": "THU", "model_no": "SANV 01 BF004", "description": "UPMA + EGG ROAST"},
                {"days": "FRI", "model_no": "SANV 01 BF005", "description": "POROTTA + CHICKEN CURRY"},
                {"days": "SAT", "model_no": "SANV 01 BF006", "description": "CHAPATI + ALOO GOBI"},
                {"days": "SUN", "model_no": "SANV 01 BF007", "description": "RAVA IDLI + CHICKEN CURRY"},
            ],
            "tiffin_lunch": [
                {"days": "MON", "model_no": "SANV TL001", "description": "GARLIC RICE + SOYA CHUNKS ROAST +DRY MOONG DAL CURRY"},
                {"days": "TUE", "model_no": "SANV TL002", "description": "CHICKEN FRIED RICE + CHILLI GOBI + CHILLI VINEGAR"},
                {"days": "WED", "model_no": "SANV TL003", "description": "WHITE RICE + RAJMA MASALA + DRY SUBZI"},
                {"days": "THU", "model_no": "SANV TL004", "description": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA"},
                {"days": "FRI", "model_no": "SANV TL005", "description": "CHICKEN BIRIRANI + PICKLE + CRUNCH PACK"},
                {"days": "SAT", "model_no": "SANV TL006", "description": "TOMATO RICE + MASHROOM MASALA + CHUTNEY POWDER"},
                {"days": "SUN", "model_no": "SANV TL007", "description": "CHICKEN SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE"},
            ],
            "lunch": [
                {"days": "MON", "model_no": "SANV 01 L001", "description": "GHEE RICE + CHICKEN CURRY + CUMIN YOGURT + PICKLE"},
                {"days": "TUE", "model_no": "SANV 01 L002", "description": "1 CHAPATI + BARIK RICE (680cc) + KOLHAPURI CHICKEN + SIDE CURRY + CHICKEN FRY + UPPERI+ PICKLE + CRUNCH PACK"},
                {"days": "WED", "model_no": "SANV 01 L003", "description": "1 CHAPATI + BARIK RICE (680cc) + CHICKEN CURRY + CHICKEN FRY + PICKLE + CRUNCH PACK +UPPERI"},
                {"days": "THU", "model_no": "SANV 01 L004", "description": "1 CHAPATI +BARIK RICE (680cc) + CHICKEN CURRY + BHINDI MASALA + CHICKEN FRY + SIDE CURRY + PICKLE + MASALA SC"},
                {"days": "FRI", "model_no": "SANV 01 L005", "description": "CHICKEN BIRYANI + VINEGAR SALAD + PICKLE"},
                {"days": "SAT", "model_no": "SANV 01 L006", "description": "1 CHAPATI + BARIK RICE (680cc) + RED CHICKEN CURRY + SIDE CURRY + CHICKEN FRY + PICKLE + UPPERI + MASALA SC"},
                {"days": "SUN", "model_no": "SANV 01 L007", "description": "CHICKEN MANDI + SALSA"},
            ],
            "dinner": [
                {"days": "MON", "model_no": "SANV 01 D001", "description": "CHAPATI + CHICKEN KADAI+ SALAD"},
                {"days": "TUE", "model_no": "SANV 01 D002", "description": "CHICKEN KABSA + SALSA"},
                {"days": "WED", "model_no": "SANV 01 D003", "description": "CHAPATI+ CHICKEN MASALA CURRY+ SALAD"},
                {"days": "THU", "model_no": "SANV 01 D004", "description": "CHAPATI + SUBZI+ SALAD"},
                {"days": "FRI", "model_no": "SANV 01 D005", "description": "POROTTA + CHICKEN CHILLI+ SALAD"},
                {"days": "SAT", "model_no": "SANV 01 D006", "description": "GHEE RICE + MUSHROOM TIKKA MASALA + DAL FRY + CUMIN YOGURT"},
                {"days": "SUN", "model_no": "SANV 01 D007", "description": "POROTTA + CHICKEN ROGAN JOSH+ SALAD"},
            ],
        }

        # Get the Saver Non-Vegetarian meal category
        try:
            meal_category = MealCategory.objects.get(id="0ec19dc6-f35c-496b-a6b0-c4dc6cf6d57a")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID 0ec19dc6-f35c-496b-a6b0-c4dc6cf6d57a not found"))
            return

        created_count = 0
        skipped_count = 0
        error_count = 0

        # Process each meal type
        for meal_type, menu_items in menu_data.items():
            self.stdout.write(f"\nProcessing {meal_type.upper()}...")

            for menu_item in menu_items:
                day = self.map_day_abbreviation(menu_item["days"])
                model_no = menu_item["model_no"]
                dish_name = menu_item["description"]

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
