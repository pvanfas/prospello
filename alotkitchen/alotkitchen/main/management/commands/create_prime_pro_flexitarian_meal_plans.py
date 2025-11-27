from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Prime Pro Flexitarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"day": "MON", "model_no": "PP 01 BF001", "dish": "CHAPATI + VEG STEW"},
                {"day": "TUE", "model_no": "PP 01 BF002", "dish": "CHAPATI + ALOO MATAR"},
                {"day": "WED", "model_no": "PP 01 BF003", "dish": "POROTTA + BHAJI"},
                {"day": "THU", "model_no": "PP 01 BF004", "dish": "UPMA + SOYA CHUNK CURRY"},
                {"day": "FRI", "model_no": "PP 01 BF005", "dish": "POROTTA + ALOO CHANA MASALA"},
                {"day": "SAT", "model_no": "PP 01 BF006", "dish": "CHAPATI + ALOO GOBI"},
                {"day": "SUN", "model_no": "PP 01 BF007", "dish": "POROTTA + BLACK CHANA"},
            ],
            "tiffin_lunch": [
                {"day": "MON", "model_no": "PP 01 TL001", "dish": "GARLIC RICE + SOYA CHUNKS ROAST +DRY MOONG DAL CURRY"},
                {"day": "TUE", "model_no": "PP 01 TL002", "dish": "CHICKEN FRIED RICE + CHILLI GOBI + CHILLI VINEGAR"},
                {"day": "WED", "model_no": "PP 01 TL003", "dish": "WHITE RICE + RAJMA MASALA + DRY SUBZI"},
                {"day": "THU", "model_no": "PP 01 TL004", "dish": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA"},
                {"day": "FRI", "model_no": "PP 01 TL005", "dish": "CHICKEN BIRIANI + PICKLE + CRUNCH PACK"},
                {"day": "SAT", "model_no": "PP 01 TL006", "dish": "TOMATO RICE + MASHROOM MASALA + CHUTNEY POWDER"},
                {"day": "SUN", "model_no": "PP 01 TL007", "dish": "CHICKEN SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE"},
            ],
            "lunch": [
                {"day": "MON", "model_no": "PP 01 L001", "dish": "GHEE RICE + CHICKEN CURRY + CUMIN YOGURT + PICKLE"},
                {"day": "MON", "model_no": None, "dish": None},
                {"day": "TUE", "model_no": "PP 01 L002", "dish": "1 CHAPATI + BARIK RICE (680cc) + KOLHAPURI CHICKEN + SIDE CURRY + UPPERI+ PICKLE + CRUNCH PACK + VEG FRY"},
                {"day": "TUE", "model_no": None, "dish": None},
                {"day": "WED", "model_no": "PP 01 L003", "dish": "1 CHAPATI + BARIK RICE (680cc) + CHICKEN CURRY + SIDE CURRY + PICKLE + CRUNCH PACK +UPPERI"},
                {"day": "WED", "model_no": None, "dish": None},
                {"day": "THU", "model_no": "PP 01 L004", "dish": "1 CHAPATI +BARIK RICE (680cc) + VEG CURRY + BHINDI MASALA + CHICKEN FRY + DAL + PICKLE + CRUNCH PACK"},
                {"day": "THU", "model_no": None, "dish": None},
                {"day": "FRI", "model_no": "PP 01 L005", "dish": "CHICKEN BIRYANI + VINEGAR SALAD + PICKLE"},
                {"day": "SAT", "model_no": "PP 01 L006", "dish": "1 CHAPATI + BARIK RICE (680cc) + RED CHICKEN CURRY + SIDE CURRY + PICKLE + UPPERI+ VEG FRY + CRUNCH PACK"},
                {"day": "SAT", "model_no": None, "dish": None},
                {"day": "SUN", "model_no": "PP 01 L007", "dish": "CHICKEN MANDI + SALSA"},
            ],
            "dinner": [
                {"day": "MON", "model_no": "PP 01 D001", "dish": "CHAPATI + CHICKEN KADAI"},
                {"day": "TUE", "model_no": "PP 01 D002", "dish": "CHICKEN KABSA + SALSA"},
                {"day": "WED", "model_no": "PP 01 D003", "dish": "BARIK RICE + CHICKEN MASALA CURRY"},
                {"day": "THU", "model_no": "PP 01 D004", "dish": "CHAPATI + SUBZI"},
                {"day": "FRI", "model_no": "PP 01 D005", "dish": "POROTTA + CHICKEN CHILLI"},
                {"day": "SAT", "model_no": "PP 01 D006", "dish": "GHEE RICE + MUSHROOM TIKKA MASALA + DAL FRY + CUMIN YOGURT"},
                {"day": "SUN", "model_no": "PP 01 D007", "dish": "POROTTA + CHICKEN ROGAN JOSH"},
            ],
        }

        # Get the Prime Pro Flexitarian meal category
        try:
            meal_category = MealCategory.objects.get(id="573e211f-9103-4d31-8ffd-adf2f7cd39e2")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID 573e211f-9103-4d31-8ffd-adf2f7cd39e2 not found"))
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
                dish_name = menu_item["dish"]

                # Skip items with null model_no or dish
                if not model_no or not dish_name:
                    self.stdout.write(f"  Skipping {day} - No model number or dish: {dish_name}")
                    skipped_count += 1
                    continue

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
