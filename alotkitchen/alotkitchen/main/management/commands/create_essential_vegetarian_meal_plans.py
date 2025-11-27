from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Essential Vegetarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"day": "MON", "model_no": "EV 01 BF001", "meal": "CHAPATI + VEG STEW"},
                {"day": "TUE", "model_no": "EV 01 BF002", "meal": "POROTTA + SUBZI"},
                {"day": "WED", "model_no": "EV 01 BF003", "meal": "APPAM + BHAJI"},
                {"day": "THU", "model_no": "EV 01 BF004", "meal": "UPMA + RAJMA MASALA"},
                {"day": "FRI", "model_no": "EV 01 BF005", "meal": "PUTTU + BLACK CHANA"},
                {"day": "SAT", "model_no": "EV 01 BF006", "meal": "CHAPATI + ALOO GOBI"},
                {"day": "SUN", "model_no": "EV 01 BF007", "meal": "RAVA IDLI + SAMBAR + CHUTNEY"},
            ],
            "tiffin_lunch": [
                {"day": "MON", "model_no": "EV 01 TL001", "meal": "GARLIC RICE + SOYA CHUNKS ROAST + DRY MOONG DAL CURRY"},
                {"day": "TUE", "model_no": "EV 01 TL002", "meal": "VEG FRIED RICE + CHILLI GOBI + CHILLI VINEGAR"},
                {"day": "WED", "model_no": "EV 01 TL003", "meal": "WHITE RICE + RAJMA MASALA + DRY SUBZI"},
                {"day": "THU", "model_no": "EV 01 TL004", "meal": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA"},
                {"day": "FRI", "model_no": "EV 01 TL005", "meal": "VEG BIRIRANI + PICKLE + CRUNCH PACK"},
                {"day": "SAT", "model_no": "EV 01 TL006", "meal": "TOMATO RICE + MASHROOM MASALA + CHUTNEY POWDER"},
                {"day": "SUN", "model_no": "EV 01 TL007", "meal": "VEG SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE"},
            ],
            "lunch": [
                {"day": "MON", "model_no": "EV 01 L001", "meal": "GHEE RICE + ALOO KARELA SUBZI + MOONG DAL+ CUMIN YOGURT + PICKLE"},
                {"day": "TUE", "model_no": "EV 01 L002", "meal": "1 CHAPATI + BARIK RICE (680cc) + ALOO BAINGAN + DAL + UPPERI+ PICKLE + CRUNCH PACK"},
                {"day": "TUE", "model_no": "EV 01 L003", "meal": "1 CHAPATI + MOTTA RICE + ALOO BAINGAN + DAL + UPPERI + CRUNCH PACK + PICKLE"},
                {"day": "WED", "model_no": "EV 01 L004", "meal": "1 CHAPATI + BARIK RICE (680cc) + VEG CURRY + SIDE CURRY + DAL + UPPERI + PICKLE + CRUNCH PACK"},
                {"day": "WED", "model_no": "EV 01 L005", "meal": "1 CHAPATI + MOTTA RICE + VEG CURRY + SIDE CURRY + DAL + UPPERI + PICKLE + CRUNCH PACK"},
                {"day": "THU", "model_no": "EV 01 L006", "meal": "1 CHAPATI + BARIK RICE (680cc) + BHINDI MASALA + GOBI 65 + DAL + PICKLE + CRUNCH PACK"},
                {"day": "THU", "model_no": "EV 01 L007", "meal": "1 CHAPATI + MOTTA RICE + BHINDI MASALA + GOBI 65 + DAL + PICKLE + CRUNCH PACK"},
                {"day": "FRI", "model_no": "EV 01 L008", "meal": "GOBI 65 BIRYANI + VINEGAR SALAD + PICKLE"},
                {"day": "SAT", "model_no": "EV 01 L009", "meal": "1 CHAPATI + BARIK RICE (680cc) + BHINDI MASALA CURRY + SIDE CURRY + PICKLE + UPPERI + CRUNCH PACK"},
                {"day": "SAT", "model_no": "EV 01 L010", "meal": "1 CHAPATI + MOTTA RICE + BHINDI MASALA CURRY + SIDE CURRY + PICKLE + UPPERI + CRUNCH PACK"},
                {"day": "SUN", "model_no": "EV 01 L011", "meal": "MUSHROOM BIRYANI + RAITHA +PICKLE"},
            ],
            "dinner": [
                {"day": "MON", "model_no": "EV 01 D001", "meal": "CHAPATI + ALOO MATAR"},
                {"day": "TUE", "model_no": "EV 01 D002", "meal": "VEG KABSA + SALSA"},
                {"day": "WED", "model_no": "EV 01 D003", "meal": "BARIK RICE + VEG CURRY"},
                {"day": "THU", "model_no": "EV 01 D004", "meal": "CHAPATI + SUBZI"},
                {"day": "FRI", "model_no": "EV 01 D005", "meal": "POROTTA + VEG JALFREZI + GOBI FRY"},
                {"day": "SAT", "model_no": "EV 01 D006", "meal": "GHEE RICE + MUSHROOM TIKKA MASALA + DAL FRY + PICKLE"},
                {"day": "SUN", "model_no": "EV 01 D007", "meal": "POROTTA + SUBZI"},
            ],
        }

        # Get the Essential Vegetarian meal category
        try:
            meal_category = MealCategory.objects.get(id="a23a42e4-85d3-4f31-bb74-1dfc1f80fd6b")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID a23a42e4-85d3-4f31-bb74-1dfc1f80fd6b not found"))
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
