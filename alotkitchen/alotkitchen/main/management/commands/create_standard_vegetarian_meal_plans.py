from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Standard Vegetarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"day": "MON", "model_no": "SV 01 BF001", "items": "APPAM + VEG STEW + GREEN TEA"},
                {"day": "TUE", "model_no": "SV 01 BF002", "items": "PARATHA + SUBZI+ FRUIT"},
                {"day": "WED", "model_no": "SV 01 BF003", "items": "UTTAPPAM+ POTATO BHAJI + CHUTNEY"},
                {"day": "THU", "model_no": "SV 01 BF004", "items": "SEMIYA UPMA + SOYA CHUNK CURRY + TEA BAG"},
                {"day": "FRI", "model_no": "SV 01 BF005", "items": "ALOO PARATHA + CURD + PICKLE + TEA BAG"},
                {"day": "SAT", "model_no": "SV 01 BF006", "items": "WHEAT DOSA + ALOO GOBI + FRUIT"},
                {"day": "SUN", "model_no": "SV 01 BF007", "items": "RAVA IDLI + SAMBAR + CHUTNEY + FRUIT"},
            ],
            "tiffin_lunch": [
                {"day": "MON", "model_no": "SV 01 TL001", "items": "GARLIC RICE + SOYA CHUNKS ROAST +DRY MOONG DAL CURRY + FRUIT + WATER"},
                {"day": "TUE", "model_no": "SV 01 TL002", "items": "VEG FRIED RICE + CHILLI GOBI + CHILLI VINEGAR + FRUIT + WATER"},
                {"day": "WED", "model_no": "SV 01 TL003", "items": "WHITE RICE + RAJMA MASALA + DRY SUBZI + FRUIT + WATER"},
                {"day": "THU", "model_no": "SV 01 TL004", "items": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA + FRUIT + WATER"},
                {"day": "FRI", "model_no": "SV 01 TL005", "items": "VEG BIRIRANI + PICKLE + CRUNCH PACK + FRUIT + WATER"},
                {"day": "SAT", "model_no": "SV 01 TL006", "items": "TOMATO RICE + MASHROOM MASALA + CHUTNEY POWDER + FRUIT + WATER"},
                {"day": "SUN", "model_no": "SV 01 TL007", "items": "VEG SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE + FRUIT + WATER"},
            ],
            "lunch": [
                {"day": "MON", "model_no": "SV 01 L001", "items": "GHEE RICE + ALOO KARELA SUBZI + MOONG DAL+ CUMIN YOGURT + PICKLE + PAPAD+ JUICE"},
                {"day": "MON", "model_no": "SV 01 L002", "items": "BARIK RICE + 1 CHAPATI + VEG CURRY+ SIDE CURRY + VEG FRY + CHUTNEY POWDER + PICKLE + CRUNCH PACK + UPPERI"},
                {"day": "TUE", "model_no": "SV 01 L003", "items": "MOTTA RICE + 1 CHAPATI + VEG CURRY + VEG FRY + CHUTNEY POWDER + PICKLE + CRUNCH PACK +UPPERI+ YOUGURT"},
                {"day": "WED", "model_no": "SV 01 L004", "items": "BARIK RICE + 1 CHAPATI + SIDE CURRY + VEG CURRY+ VEG FRY + CHUTNEY POWDER + PICKLE + CRUNCH PACK + UPPERI"},
                {"day": "WED", "model_no": "SV 01 L005", "items": "MOTTA RICE + 1 CHAPATI + VEG CURRY + SIDE CURRY+ VEG FRY + CHUTNEY POWDER + PICKLE + CRUNCH PACK + UPPERI"},
                {"day": "THU", "model_no": "SV 01 L006", "items": "BARIK RICE + 1 CHAPATI + SIDE CURRY + VEG CURRY+ VEG FRY + CHUTNEY POWDER + PICKLE + CRUNCH PACK + UPPERI"},
                {"day": "THU", "model_no": "SV 01 L007", "items": "MOTTA RICE + 1 CHAPATI + VEG CURRY+SIDE CURRY+ VEG FRY + CHUTNEY POWDER + PICKLE + CRUNCH PACK + UPPERI"},
                {"day": "FRI", "model_no": "SV 01 L008", "items": "GOBI 65 BIRYANI + VINEGAR SALAD + PICKLE + CRUNCH PACK + SWEET + THICK CHUTNEY + PANEER FRY + JUICE"},
                {"day": "SAT", "model_no": "SV 01 L009", "items": "BARIK RICE + 1 CHAPATI + VEG CURRY+ SIDE CURRY +VEG FRY + CHUTNEY POWDER + PICKLE + CRUNCH PACK + UPPERI"},
                {"day": "SAT", "model_no": "SV 01 L010", "items": "MOTTA RICE + 1 CHAPATI + VEG CURRY+ SIDE CURRY+VEG FRY +CHUTNEY POWDER + PICKLE + CRUNCH PACK + UPPERI"},
                {"day": "SUN", "model_no": "SV 01 L011", "items": "VEG MAQLUBA + SALSA + YOUGURT + PICKLE + SALAD + JUICE"},
            ],
            "dinner": [
                {"day": "MON", "model_no": "SV 01 D001", "items": "CHAPATI + PANEER BUTTER MASALA + FRUIT"},
                {"day": "TUE", "model_no": "SV 01 D002", "items": "VEG KABSA + SALSA + FRUIT"},
                {"day": "WED", "model_no": "SV 01 D003", "items": "CHAPATI + VEG CURRY + SKILLET POTATO + FRUIT"},
                {"day": "THU", "model_no": "SV 01 D004", "items": "PARATHA+ VEG KADAI+ BHINDI FRY+ FRUIT"},
                {"day": "FRI", "model_no": "SV 01 D005", "items": "CHAPATI + SUBZI + DAL + FRUIT"},
                {"day": "SAT", "model_no": "SV 01 D006", "items": "GHEE RICE + MUSHROOM TIKKA MASALA + DAL FRY + VEG FRUIT"},
                {"day": "SUN", "model_no": "SV 01 D007", "items": "PARATHA + SUBZI + SALAD + FRUIT"},
            ],
        }

        # Get the Standard Vegetarian meal category
        try:
            meal_category = MealCategory.objects.get(id="2084fac6-d7d6-427c-9c9f-f779e7e4ffc9")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID 2084fac6-d7d6-427c-9c9f-f779e7e4ffc9 not found"))
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
                dish_name = menu_item["items"]

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
