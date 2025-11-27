from django.core.management.base import BaseCommand

from main.models import ItemMaster, MealCategory, MealPlan


class Command(BaseCommand):
    help = "Create meal plans for Standard Non-Vegetarian category"

    def handle(self, *args, **options):
        # Menu data provided by user
        menu_data = {
            "breakfast": [
                {"day": "MON", "model_no": "SNV 01 BF001", "menu": "APPAM + EGG STEW + GREEN TEA"},
                {"day": "TUE", "model_no": "SNV 01 BF002", "menu": "PARATHA + SAUSAGE CURRY + FRUIT"},
                {"day": "WED", "model_no": "SNV 01 BF003", "menu": "UTTAPPAM + CHICKEN KURMA + TEA BAG"},
                {"day": "THU", "model_no": "SNV 01 BF004", "menu": "SEMIYA UPMA + EGG ROAST+ TEA BAG"},
                {"day": "FRI", "model_no": "SNV 01 BF005", "menu": "PUTTU + CHICKEN CURRY + TEA BAG"},
                {"day": "SAT", "model_no": "SNV 01 BF006", "menu": "WHEAT DOSA + ALOO GOBI+ FRUIT"},
                {"day": "SUN", "model_no": "SNV 01 BF007", "menu": "RAVA IDLI + CHICKEN CURRY + FRUIT"},
            ],
            "tiffin_lunch": [
                {"day": "MON", "model_no": "SNV 01 TL001", "menu": "GARLIC RICE + SOYA CHUNKS ROAST + DRY MOONG DAL CURRY + FRUIT + WATER"},
                {"day": "TUE", "model_no": "SNV 01 TL002", "menu": "CHICKEN FRIED RICE + CHILLI GOBI + CHILLI VINEGAR + FRUIT + WATER"},
                {"day": "WED", "model_no": "SNV 01 TL003", "menu": "WHITE RICE + RAJMA MASALA + DRY SUBZI + FRUIT + WATER"},
                {"day": "THU", "model_no": "SNV 01 TL004", "menu": "LEMON HERB RICE + ALOO METHI FRY + TOMATO SALSA + FRUIT + WATER"},
                {"day": "FRI", "model_no": "SNV 01 TL005", "menu": "CHICKEN BIRIANI + PICKLE + CRUNCH PACK + FRUIT + WATER"},
                {"day": "SAT", "model_no": "SNV 01 TL006", "menu": "TOMATO RICE + MASHROOM MASALA + CHUTNEY POWDER + FRUIT + WATER"},
                {"day": "SUN", "model_no": "SNV 01 TL007", "menu": "CHICKEN SCHEZWAN RICE + CHILLI POTATO + SOY SAUCE + FRUIT + WATER"},
            ],
            "lunch": [
                {"day": "MON", "model_no": "SNV 01 L001", "menu": "GHEE RICE + CHICKEN CURRY + CUMIN YOGURT + PICKLE + DAL + PAPAD + JUICE"},
                {"day": "MON", "model_no": "SNV 01 L001", "menu": "BARIK RICE + 1 CHAPATI + FISH CURRY + VEG CURRY + CHUTNEY POWDER + PICKLE + PAPAD + MASALA SCRAMBLED"},
                {"day": "TUE", "model_no": "SNV 01 L002", "menu": "MOTTA RICE + 1 CHAPATI + FISH CURRY + VEG CURRY + CHUTNEY POWDER + PICKLE + PAPAD + MASALA SCRAMBLED"},
                {"day": "WED", "model_no": "SNV 01 L003", "menu": "MOTTA RICE + 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + PAPAD + MASALA SCRAMBLED"},
                {"day": "WED", "model_no": "SNV 01 L004", "menu": "MOTTA RICE + 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + PAPAD + MASALA SCRAMBLED"},
                {"day": "THU", "model_no": "SNV 01 L005", "menu": "BARIK RICE + 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + PAPAD + MASALA SCRAMBLED"},
                {"day": "THU", "model_no": "SNV 01 L006", "menu": "MOTTA RICE + 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + PAPAD + MASALA SCRAMBLED"},
                {"day": "FRI", "model_no": "SNV 01 L007", "menu": "MOTTA RICE + 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + PAPAD + MASALA SCRAMBLED"},
                {"day": "FRI", "model_no": "SNV 01 L008", "menu": "CHICKEN BIRYANI + RAITHA+ PICKLE+ PAPAD+ SWEET+ THICK CHUTNEY+ CHICKEN FRY + JUICE"},
                {"day": "SAT", "model_no": "SNV 01 L009", "menu": "BARIK RICE + 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + PAPAD + MASALA SCRAMBLED"},
                {"day": "SAT", "model_no": "SNV 01 L010", "menu": "MOTTA RICE + 1 CHAPATI + RED CHICKEN CURRY + CHICKEN 65 + CHUTNEY POWDER + PICKLE + PAPAD + MASALA SCRAMBLED"},
                {"day": "SUN", "model_no": "SV 01 L011", "menu": "CHICKEN MANDI + SALSA + YOUGURT + PICKLE + SALAD + JUICE"},
            ],
            "dinner": [
                {"day": "MON", "model_no": "SNV 01 D001", "menu": "CHAPATI + CHICKEN KADAI + FRUIT"},
                {"day": "TUE", "model_no": "SNV 01 D002", "menu": "CHICKEN KABSA + SALSA + SALAD + FRUIT"},
                {"day": "WED", "model_no": "SNV 01 D003", "menu": "WHEAT PARATHA + CHICKEN MASALA + SKILLET POTATO + FRUIT"},
                {"day": "THU", "model_no": "SNV 01 D004", "menu": "PARATHA + CHICKEN KADAI+ BHINDI FRY + FRUIT"},
                {"day": "FRI", "model_no": "SNV 01 D005", "menu": "CHAPATI + SUBZI + CHICKEN FRY + FRUIT"},
                {"day": "SAT", "model_no": "SNV 01 D006", "menu": "GHEE RICE + BEEF CURRY + DAL FRY + PICKLE + FRUIT"},
                {"day": "SUN", "model_no": "SNV 01 D007", "menu": "PARATHA + CHICKEN ROGAN JOSH + SALAD"},
            ],
        }

        # Get the Standard Non-Vegetarian meal category
        try:
            meal_category = MealCategory.objects.get(id="f1812e31-8e9b-42b0-8231-ef33b0bfaf78")
            self.stdout.write(f"Found meal category: {meal_category.name}")
        except MealCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Error: Meal category with ID f1812e31-8e9b-42b0-8231-ef33b0bfaf78 not found"))
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
