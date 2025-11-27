from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Regular Vegetarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"day": "MON", "model_no": "RV 01 BF001", "menu": "APPAM + VEG STEW"},
                {"day": "TUE", "model_no": "RV 01 BF002", "menu": "POROTTA + SUBZI"},
                {"day": "WED", "model_no": "RV 01 BF003", "menu": "UTTAPPAM + SAMBAR + CHUTNEY"},
                {"day": "THU", "model_no": "RV 01 BF004", "menu": "UPMA + SOYA CHUNK CURRY"},
                {"day": "FRI", "model_no": "RV 01 BF005", "menu": "PUTTU + BLACK CHANA"},
                {"day": "SAT", "model_no": "RV 01 BF006", "menu": "WHEAT DOSA + ALOO GOBI"},
                {"day": "SUN", "model_no": "RV 01 BF007", "menu": "RAVA IDLI + SAMBAR + CHUTNEY"},
            ],
            "tiffin_lunch": [
                {"day": "MON", "model_no": "RV 01 TL001", "menu": "GARLIC RICE + SOYA CHUNKS ROAST + DRY MOONG DAL CURRY"},
                {"day": "TUE", "model_no": "RV 01 TL002", "menu": "VEG FRIED RICE + CHILLI GOBI + CHILLI VINEGAR"},
                {"day": "WED", "model_no": "RV 01 TL003", "menu": "WHITE RICE + RAJMA MASALA + DRY SUBZI"},
                {"day": "THU", "model_no": "RV 01 TL004", "menu": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA"},
                {"day": "FRI", "model_no": "RV 01 TL005", "menu": "VEG BIRIRANI + PICKLE + CRUNCH PACK"},
                {"day": "SAT", "model_no": "RV 01 TL006", "menu": "TOMATO RICE + MASHROOM MASALA + CHUTNEY POWDER"},
                {"day": "SUN", "model_no": "RV 01 TL007", "menu": "VEG SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE"},
            ],
            "lunch": [
                {"day": "MON", "model_no": "RV 01 L001", "menu": "GHEE RICE + ALOO KARELA SUBZI + MOONG DAL+ CUMIN YOGURT + PICKLE"},
                {"day": "MON", "model_no": None, "menu": None},
                {"day": "TUE", "model_no": "RV 01 L002", "menu": "1 CHAPATI + BARIK RICE (680CC)+ ALOO BAINGAN + DAL + UPPERI+ PICKLE + VEG FRY + CRUNCH PACK"},
                {"day": "TUE", "model_no": "RV 01 L003", "menu": "MOTTA RICE + ALOO BAINGAN + DAL + UPPERI + CRUNCH PACK + PICKLE + VEG FRY"},
                {"day": "WED", "model_no": "RV 01 L004", "menu": "1 CHAPATI + BARIK RICE (680CC) + VEG CURRY + SIDE CURRY + DAL + UPPERI + PICKLE + CRUNCH PACK + VEG FRY"},
                {"day": "WED", "model_no": "RV 01 L005", "menu": "MOTTA RICE + VEG CURRY + SIDE CURRY + DAL + UPPERI + PICKLE + CRUNCH PACK + VEG FRY"},
                {"day": "THU", "model_no": "RV 01 L006", "menu": "1 CHAPATI + BARIK RICE (680CC) + BHINDI MASALA + GOBI 65 + DAL + PICKLE + CRUNCH PACK"},
                {"day": "THU", "model_no": "RV 01 L007", "menu": "MOTTA RICE + BHINDI MASALA + GOBI 65 + DAL + PICKLE + CRUNCH PACK"},
                {"day": "FRI", "model_no": "RV 01 L008", "menu": "GOBI 65 BIRYANI + VINEGAR SALAD + PICKLE"},
                {"day": "SAT", "model_no": "RV 01 L009", "menu": "1 CHAPATI + BARIK RICE (680CC) + BHINDI MASALA CURRY + SIDE CURRY + PICKLE + UPPERI + CRUNCH PACK + VEG FRY"},
                {"day": "SAT", "model_no": "RV 01 L010", "menu": "MOTTA RICE + BHINDI MASALA CURRY + SIDE CURRY + PICKLE + UPPERI + CRUNCH PACK + VEG FRY"},
                {"day": "SUN", "model_no": "RV 01 L011", "menu": "MUSHROOM BIRYANI + RAITHA +PICKLE"},
            ],
            "dinner": [
                {"day": "MON", "model_no": "RV 01 D001", "menu": "CHAPATI + ALOO MATAR + SALAD"},
                {"day": "TUE", "model_no": "RV 01 D002", "menu": "VEG KABSA + SALSA"},
                {"day": "WED", "model_no": "RV 01 D003", "menu": "POROTTA + VEG CURRY + SALAD"},
                {"day": "THU", "model_no": "RV 01 D004", "menu": "CHAPATI + SUBZI + SALAD"},
                {"day": "FRI", "model_no": "RV 01 D005", "menu": "POROTTA + VEG JALFREZI + GOBI FRY + SALAD"},
                {"day": "SAT", "model_no": "RV 01 D006", "menu": "GHEE RICE + MUSHROOM TIKKA MASALA + DAL FRY + PICKLE"},
                {"day": "SUN", "model_no": "RV 01 D007", "menu": "POROTTA + SUBZI + SALAD"},
            ],
        }

        # Get the Regular Vegetarian meal category
        try:
            meal_category = MealCategory.objects.get(id="77227fce-6f40-4592-a679-16b7510c52c3")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID 77227fce-6f40-4592-a679-16b7510c52c3 not found"))
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

                # Skip items with null model_no or menu
                if not model_no or not dish_name:
                    self.stdout.write(f"  Skipping {day} - No model number or menu: {dish_name}")
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
