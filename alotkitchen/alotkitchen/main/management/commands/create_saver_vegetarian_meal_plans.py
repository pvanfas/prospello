from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Saver Vegetarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"day": "MON", "model_no": "SAV 01 BF001", "item": "CHAPATI + VEG STEW"},
                {"day": "TUE", "model_no": "SAV 01 BF002", "item": "CHAPATI + ALOO MATAR"},
                {"day": "WED", "model_no": "SAV 01 BF003", "item": "POROTTA + BHAJI"},
                {"day": "THU", "model_no": "SAV 01 BF004", "item": "UPMA + SOYA CHUNK CURRY"},
                {"day": "FRI", "model_no": "SAV 01 BF005", "item": "POROTTA + ALOO CHANA MASALA"},
                {"day": "SAT", "model_no": "SAV 01 BF006", "item": "CHAPATI + ALOO GOBI"},
                {"day": "SUN", "model_no": "SAV 01 BF007", "item": "POROTTA + BLACK CHANA"},
            ],
            "tiffin_lunch": [
                {"day": "MON", "model_no": "SAV 01 TL001", "item": "GARLIC RICE + SOYA CHUNKS ROAST +DRY MOONG DAL CURRY"},
                {"day": "TUE", "model_no": "SAV 01 TL002", "item": "VEG FRIED RICE + CHILLI GOBI + CHILLI VINEGAR"},
                {"day": "WED", "model_no": "SAV 01 TL003", "item": "WHITE RICE + RAJMA MASALA + DRY SUBZI"},
                {"day": "THU", "model_no": "SAV 01 TL004", "item": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA"},
                {"day": "FRI", "model_no": "SAV 01 TL005", "item": "VEG BIRANI + PICKLE + CRUNCH PACK"},
                {"day": "SAT", "model_no": "SAV 01 TL006", "item": "TOMATO RICE + MUSHROOM MASALA + CHUTNEY POWDER"},
                {"day": "SUN", "model_no": "SAV 01 TL007", "item": "VEG SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE"},
            ],
            "lunch": [
                {"day": "MON", "model_no": "SAV 01 L001", "item": "GHEE RICE + ALOO KARELA SUBZI + MOONG DAL+ CUMIN YOGURT + PICKLE"},
                {"day": "TUE", "model_no": "SAV 01 L002", "item": "1 CHAPATI + BARIK RICE (680cc)+ ALOO BAINGAN + SIDE CURRY +UPPERI+ PICKLE + VEG FRY + CRUNCH PACK"},
                {"day": "WED", "model_no": "SAV 01 L003", "item": "1 CHAPATI + BARIK RICE (680cc) + VEG CURRY + SIDE CURRY + UPPERI + PICKLE + CRUNCH PACK + VEG FRY"},
                {"day": "THU", "model_no": "SAV 01 L004", "item": "1 CHAPATI + BARIK RICE (680cc) + BHINDI MASALA + GOBI 65 + SIDE CURRY + PICKLE + VEG FRY + CRUNCH PACK"},
                {"day": "FRI", "model_no": "SAV 01 L005", "item": "GOBI 65 BIRYANI + VINEGAR SALAD + PICKLE"},
                {"day": "SAT", "model_no": "SAV 01 L006", "item": "1 CHAPATI + BARIK RICE (680cc) + BHINDI MASALA CURRY + SIDE CURRY + PICKLE + UPPERI + VEG FRY + CRUNCH PAC"},
                {"day": "SUN", "model_no": "SAV 01 L007", "item": "MUSHROOM BIRYANI + RAITHA +PICKLE"},
            ],
            "dinner": [
                {"day": "MON", "model_no": "SAV 01 D001", "item": "CHAPATI + ALOO MATAR + SALAD"},
                {"day": "TUE", "model_no": "SAV 01 D002", "item": "VEG KABSA + SALSA"},
                {"day": "WED", "model_no": "SAV 01 D003", "item": "CHAPATI + VEG CURRY+ SALAD"},
                {"day": "THU", "model_no": "SAV 01 D004", "item": "CHAPATI + SUBZI+ SALAD"},
                {"day": "FRI", "model_no": "SAV 01 D005", "item": "POROTTA + VEG JALFREZI + GOBI FRY+ SALAD"},
                {"day": "SAT", "model_no": "SAV 01 D006", "item": "GHEE RICE + MUSHROOM TIKKA MASALA + DAL FRY + PICKLE"},
                {"day": "SUN", "model_no": "SAV 01 D007", "item": "POROTTA + SUBZI + SALAD"},
            ],
        }

        # Get the Saver Vegetarian meal category
        try:
            meal_category = MealCategory.objects.get(id="cda81f80-b1b8-4ce8-8f07-29e87b894323")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID cda81f80-b1b8-4ce8-8f07-29e87b894323 not found"))
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
