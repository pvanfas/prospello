from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Essential Flexitarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = [
            {
                "meal_type": "BREAKFAST",
                "menu": [
                    {"day": "MON", "model_no": "EF 01 BF001", "dish": "APPAM + GREEN PEAS"},
                    {"day": "TUE", "model_no": "EF 01 BF002", "dish": "POROTTA + ALOO MATAR"},
                    {"day": "WED", "model_no": "EF 01 BF003", "dish": "DOSA + SAMBAR + CHUTNEY"},
                    {"day": "THU", "model_no": "EF 01 BF004", "dish": "UPMA + RAJMA MASALA"},
                    {"day": "FRI", "model_no": "EF 01 BF005", "dish": "PUTTU + BLACK CHANA"},
                    {"day": "SAT", "model_no": "EF 01 BF006", "dish": "APPAM + ALOO GOBI"},
                    {"day": "SUN", "model_no": "EF 01 BF007", "dish": "RAVA IDLI + SAMBAR + CHUTNEY"},
                ],
            },
            {
                "meal_type": "TIFFIN LUNCH",
                "menu": [
                    {"day": "MON", "model_no": "EF 01 TL001", "dish": "GARLIC RICE + SOYA CHUNKS ROAST + DRY MOONG DAL CURRY"},
                    {"day": "TUE", "model_no": "EF 01 TL002", "dish": "CHICKEN FRIED RICE + CHILLI GOBI + CHILLI VINEGAR"},
                    {"day": "WED", "model_no": "EF 01 TL003", "dish": "WHITE RICE + RAJMA MASALA + DRY SUBZI"},
                    {"day": "THU", "model_no": "EF 01 TL004", "dish": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA"},
                    {"day": "FRI", "model_no": "EF 01 TL005", "dish": "CHICKEN BIRYANI + PICKLE + CRUNCH PACK"},
                    {"day": "SAT", "model_no": "EF 01 TL006", "dish": "TOMATO RICE + MUSHROOM MASALA + CHUTNEY POWDER"},
                    {"day": "SUN", "model_no": "EF 01 TL007", "dish": "CHICKEN SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE"},
                ],
            },
            {
                "meal_type": "LUNCH",
                "menu": [
                    {"day": "MON", "model_no": "EF 01 L001", "dish": "GHEE RICE + CHICKEN CURRY + CUMIN YOGURT + PICKLE"},
                    {"day": "TUE", "model_no": "EF 01 L002", "dish": "BARIK RICE + FISH CURRY + SIDE CURRY + PICKLE + CRUNCH PACK + UPPERI + FISH FRY"},
                    {"day": "TUE", "model_no": "EF 01 L003", "dish": "MOTTA RICE + FISH CURRY + SIDE CURRY + PICKLE + CRUNCH PACK + UPPERI + FISH FRY"},
                    {"day": "WED", "model_no": "EF 01 L004", "dish": "MOTTA RICE + CHICKEN CURRY + CHICKEN FRY + PICKLE + CRUNCH PACK"},
                    {"day": "THU", "model_no": "EF 01 L005", "dish": "BARIK RICE + FISH CURRY + SIDE CURRY + PICKLE + CRUNCH PACK + UPPERI + SCRAMBLED EGG"},
                    {"day": "THU", "model_no": "EF 01 L006", "dish": "MOTTA RICE + FISH CURRY + SIDE CURRY + PICKLE + CRUNCH PACK + UPPERI + SCRAMBLED EGG"},
                    {"day": "FRI", "model_no": None, "dish": "CHICKEN BIRYANI + VINEGAR SALAD + PICKLE"},
                    {"day": "SAT", "model_no": "EF 01 L008", "dish": "BARIK RICE + FISH CURRY + SIDE CURRY + PICKLE + CRUNCH PACK + UPPERI + CHUTNEY POWDER"},
                    {"day": "SAT", "model_no": "EF 01 L010", "dish": "MOTTA RICE + FISH CURRY + SIDE CURRY + PICKLE + CRUNCH PACK + UPPERI + CHUTNEY POWDER"},
                    {"day": "SUN", "model_no": "EF 01 L009", "dish": "CHICKEN MANDI + SALSA"},
                ],
            },
            {
                "meal_type": "DINNER",
                "menu": [
                    {"day": "MON", "model_no": "EF 01 D001", "dish": "CHAPATI + EGG CURRY"},
                    {"day": "TUE", "model_no": "EF 01 D002", "dish": "CHICKEN KABSA + SALSA"},
                    {"day": "WED", "model_no": "EF 01 D003", "dish": "POROTTA + CHICKEN MASALA"},
                    {"day": "THU", "model_no": "EF 01 D004", "dish": "CHAPATI + SAUSAGE ROAST"},
                    {"day": "FRI", "model_no": "EF 01 D005", "dish": "POROTTA + CHICKEN CHILLI"},
                    {"day": "SAT", "model_no": "EF 01 D006", "dish": "GHEE RICE + BEEF CURRY + PICKLE"},
                    {"day": "SUN", "model_no": "EF 01 D007", "dish": "POROTTA + SUBZI"},
                ],
            },
        ]

        # Get the Essential Flexitarian meal category
        try:
            meal_category = MealCategory.objects.get(id="cf77027a-07e9-4c64-82ac-f73a4cad7a77")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID cf77027a-07e9-4c64-82ac-f73a4cad7a77 not found"))
            return

        created_count = 0
        skipped_count = 0
        error_count = 0

        for meal_group in menu_data:
            meal_type = meal_group["meal_type"]
            self.stdout.write(f"\nProcessing {meal_type}...")

            for menu_item in meal_group["menu"]:
                day = self.map_day_abbreviation(menu_item["day"])
                model_no = menu_item["model_no"]
                dish_name = menu_item["dish"]

                # Skip items without model_no (like the Friday lunch item)
                if not model_no:
                    self.stdout.write(f"  Skipping {day} - No model number: {dish_name}")
                    skipped_count += 1
                    continue

                try:
                    # Find the ItemMaster by item_code
                    item_master = ItemMaster.objects.get(item_code=model_no)

                    # Check if meal plan already exists
                    existing_plan = MealPlan.objects.filter(meal_category=meal_category, day=day, menu_item=item_master).first()

                    if existing_plan:
                        self.stdout.write(f"  Meal plan already exists for {day} {meal_type}: {dish_name}")
                        skipped_count += 1
                        continue

                    # Create new meal plan
                    meal_plan = MealPlan.objects.create(meal_category=meal_category, day=day, menu_item=item_master, is_fallback=False)

                    self.stdout.write(f"  Created meal plan for {day} {meal_type}: {dish_name} ({model_no})")
                    created_count += 1

                except ItemMaster.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f"  Error: ItemMaster with code '{model_no}' not found for {day} {meal_type}: {dish_name}"))
                    error_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  Error creating meal plan for {day} {meal_type}: {str(e)}"))
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
