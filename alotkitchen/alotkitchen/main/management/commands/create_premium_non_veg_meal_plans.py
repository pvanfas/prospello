from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Premium Non-Vegetarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"day": "MON", "model_no": "PMNV 01 BF001", "meal": "CHAPATI + EGG STEW + GREEN TEA"},
                {"day": "TUE", "model_no": "PMNV 01 BF002", "meal": "POROTTA + SAUSAGE CURRY + FRUIT"},
                {"day": "WED", "model_no": "PMNV 01 BF003", "meal": "CHAPATI + CHICKEN KURMA + TEA BAG"},
                {"day": "THU", "model_no": "PMNV 01 BF004", "meal": "SEMIYA UPMA + EGG ROAST + TEA BAG"},
                {"day": "FRI", "model_no": "PMNV 01 BF005", "meal": "ALOO PARATHA + CHICKEN CURRY + TEA BAG"},
                {"day": "SAT", "model_no": "PMNV 01 BF006", "meal": "CHAPATI + ALOO GOBI + FRUIT"},
                {"day": "SUN", "model_no": "PMNV 01 BF007", "meal": "RAVA IDLI + CHICKEN CURRY + FRUIT"},
            ],
            "tiffin_lunch": [
                {"day": "MON", "model_no": "PMNV 01 TL001", "meal": "GARLIC RICE + SOYA CHUNKS ROAST + DRY MOONG DAL CURRY + FRUIT + WATER"},
                {"day": "TUE", "model_no": "PMNV 01 TL002", "meal": "CHICKEN FRIED RICE + CHILLI GOBI + CHILLI VINEGAR + FRUIT + WATER"},
                {"day": "WED", "model_no": "PMNV 01 TL003", "meal": "WHITE RICE + RAJMA MASALA + DRY SUBZI + FRUIT + WATER"},
                {"day": "THU", "model_no": "PMNV 01 TL004", "meal": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA + FRUIT + WATER"},
                {"day": "FRI", "model_no": "PMNV 01 TL005", "meal": "CHICKEN BIRIYANI + PICKLE + CRUNCH PACK + FRUIT + WATER"},
                {"day": "SAT", "model_no": "PMNV 01 TL006", "meal": "TOMATO RICE + MASHROOM MASALA + CHUTNEY POWDER + FRUIT + WATER"},
                {"day": "SUN", "model_no": "PMNV 01 TL007", "meal": "CHICKEN SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE + FRUIT + WATER"},
            ],
            "lunch": [
                {"day": "MON", "model_no": "PMNV 01 L001", "meal": "GHEE RICE + CHICKEN CURRY + CUMIN YOGURT + PICKLE + DAL + CRUNCH PACK + JUICE"},
                {"day": "TUE", "model_no": "PMNV 01 L002", "meal": "1 CHAPATI + BARIK RICE + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SALA"},
                {"day": "WED", "model_no": "PMNV 01 L003", "meal": "1 CHAPATI + BARIK RICE + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SA"},
                {"day": "THU", "model_no": "PMNV 01 L004", "meal": "1 CHAPATI + BARIK RICE + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SA"},
                {"day": "FRI", "model_no": "PMNV 01 L005", "meal": "CHICKEN BIRYANI + RAITHA + PICKLE + CRUNCH PACK + SWEET + THICK CHUTNEY + CHICKEN FRY + JUICE"},
                {"day": "SAT", "model_no": "PMNV 01 L006", "meal": "1 CHAPATI + BARIK RICE + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SA"},
                {"day": "SUN", "model_no": "PMNV 01 L007", "meal": "CHICKEN MANDI + SALSA + YOUGURT + PICKLE + SALAD + JUICE"},
            ],
            "dinner": [
                {"day": "MON", "model_no": "PMNV 01 D001", "meal": "CHAPATI + CHICKEN KADAI + FRUIT"},
                {"day": "TUE", "model_no": "PMNV 01 D002", "meal": "CHICKEN KABSA + SALSA + SALAD + FRUIT"},
                {"day": "WED", "model_no": "PMNV 01 D003", "meal": "WHEAT POROTTA + CHICKEN MASALA + SALAD + FRUIT"},
                {"day": "THU", "model_no": "PMNV 01 D004", "meal": "CHAPATI + CHICKEN KADAI + SALAD + FRUIT"},
                {"day": "FRI", "model_no": "PMNV 01 D005", "meal": "POROTTA + CHICKEN FRY + DAL + SALAD + FRUIT"},
                {"day": "SAT", "model_no": "PMNV 01 D006", "meal": "GHEE RICE + CHICKEN MASALA + DAL FRY + PICKLE + FRUIT"},
                {"day": "SUN", "model_no": "PMNV 01 D007", "meal": "POROTTA + CHICKEN ROGAN JOSH + SALAD + FRUIT"},
            ],
        }

        # Get the Premium Non-Vegetarian meal category
        try:
            meal_category = MealCategory.objects.get(id="f25be254-27c8-4552-b163-ab72d5b2ed0a")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID f25be254-27c8-4552-b163-ab72d5b2ed0a not found"))
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
                dish_name = menu_item["meal"]

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
