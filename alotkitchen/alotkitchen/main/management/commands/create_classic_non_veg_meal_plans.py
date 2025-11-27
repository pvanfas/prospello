from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Classic Non-Vegetarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"day": "MON", "model_no": "CNV 01 BF001", "menu": "CHAPATI + EGG STEW"},
                {"day": "TUE", "model_no": "CNV 01 BF002", "menu": "POROTTA + SAUSAGE CURRY"},
                {"day": "WED", "model_no": "CNV 01 BF003", "menu": "CHAPATI+ CHICKEN KURMA"},
                {"day": "THU", "model_no": "CNV 01 BF004", "menu": "SEMIYA UPMA + EGG ROAST"},
                {"day": "FRI", "model_no": "CNV 01 BF005", "menu": "ALOO PARATHA + CHICKEN CURRY"},
                {"day": "SAT", "model_no": "CNV 01 BF006", "menu": "CHAPATI + ALOO GOBI"},
                {"day": "SUN", "model_no": "CNV 01 BF007", "menu": "RAVA IDLI + CHICKEN CURRY"},
            ],
            "tiffin_lunch": [
                {"day": "MON", "model_no": "CNV 01 TL001", "menu": "GARLIC RICE + SOYA CHUNKS ROAST +DRY MOONG DAL CURRY"},
                {"day": "TUE", "model_no": "CNV 01 TL002", "menu": "CHICKEN FRIED RICE + CHILLI GOBI + CHILLI VINEGAR"},
                {"day": "WED", "model_no": "CNV 01 TL003", "menu": "WHITE RICE + RAJMA MASALA + DRY SUBZI"},
                {"day": "THU", "model_no": "CNV 01 TL004", "menu": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA"},
                {"day": "FRI", "model_no": "CNV 01 TL005", "menu": "CHICKEN BIRIANI + PICKLE + CRUNCH PACK"},
                {"day": "SAT", "model_no": "CNV 01 TL006", "menu": "TOMATO RICE + MASHROOM MASALA + CHUTNEY POWDER"},
                {"day": "SUN", "model_no": "CNV 01 TL007", "menu": "CHICKEN SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE"},
            ],
            "lunch": [
                {"day": "MON", "model_no": "CNV 01 L001", "menu": "GHEE RICE + CHICKEN CURRY + CUMIN YOGURT + PICKLE"},
                {"day": "TUE", "model_no": "CNV 01 L002", "menu": "BARIK RICE + 1 CHAPATI + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SALA"},
                {"day": "WED", "model_no": "CNV 01 L003", "menu": "BARIK RICE + 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASA"},
                {"day": "THU", "model_no": "CNV 01 L004", "menu": "BARIK RICE + 1 CHAPATI + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SALA"},
                {"day": "FRI", "model_no": "CNV 01 L005", "menu": "CHICKEN BIRYANI + PICKLE+ RAITHA + CRUNCH PACK + SWEET"},
                {"day": "SAT", "model_no": "CNV 01 L006", "menu": "BARIK RICE + 1 CHAPATI + CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + CRUNCH PACK + MASALA SALA"},
                {"day": "SUN", "model_no": "CNV 01 L007", "menu": "CHICKEN MANDI + SALSA + YOUGURT + PICKLE"},
            ],
            "dinner": [
                {"day": "MON", "model_no": "CNV 01 D001", "menu": "CHAPATI + CHICKEN KADAI + SALAD"},
                {"day": "TUE", "model_no": "CNV 01 D002", "menu": "CHICKEN KABSA + SALSA + SALAD"},
                {"day": "WED", "model_no": "CNV 01 D003", "menu": "WHEAT POROTTA + CHICKEN MASALA + SALAD"},
                {"day": "THU", "model_no": "CNV 01 D004", "menu": "CHAPATI + SAUSAGE ROAST+ SALAD"},
                {"day": "FRI", "model_no": "CNV 01 D005", "menu": "POROTTA + CHICKEN CHILLI+ SALAD"},
                {"day": "SAT", "model_no": "CNV 01 D006", "menu": "GHEE RICE + CHICKEN MASALA + DAL FRY + PICKLE + SALAD"},
                {"day": "SUN", "model_no": "CNV 01 D007", "menu": "POROTTA + CHICKEN ROGAN JOSH + SALAD"},
            ],
        }

        # Get the Classic Non-Vegetarian meal category
        try:
            meal_category = MealCategory.objects.get(id="aa79bfd1-3e89-4f30-88ee-fc9eb84556b6")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID aa79bfd1-3e89-4f30-88ee-fc9eb84556b6 not found"))
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
                dish_name = menu_item["menu"]

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
