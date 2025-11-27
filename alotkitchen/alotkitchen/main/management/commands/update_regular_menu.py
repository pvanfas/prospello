from django.core.management.base import BaseCommand
from django.db import connection, transaction

from main.models import ItemCategory, ItemMaster, MealCategory, MealPlan, SubscriptionSubPlan


class Command(BaseCommand):
    help = "Update REGULAR menu with new structure and pricing"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Run in dry-run mode without making changes",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        # Close any existing connections to avoid transaction issues
        connection.close()

        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No changes will be made"))
            self.stdout.write("=" * 50)

        # New REGULAR menu structure
        new_menu = {
            "Flexitarian": {
                "breakfast": {
                    "Mon": "Appam + Veg Stew",
                    "Tue": "Porotta + Subzi",
                    "Wed": "Uttapam + Sambar + Chutney",
                    "Thu": "Upma + Soya Chunks Curry",
                    "Fri": "Puttu + Black Chana",
                    "Sat": "Wheat Dosa + Aloo Gobi",
                    "Sun": "Rava Idli + Sambar + Chutney",
                },
                "tiffin_lunch": {
                    "Mon": "Garlic Rice + Soya Chunks Roast + Dry Moong Dal Curry",
                    "Tue": "Chicken Fried Rice + Chilli Gobi + Chilli Vinegar",
                    "Wed": "White Rice + Rajma Masala + Dry Subzi",
                    "Thu": "Lemon Herb Rice + Aloo Methi Fry + Tomato Salsa",
                    "Fri": "Chicken Biryani + Pickle + Crunch Pack",
                    "Sat": "Tomato Rice + Mushroom Masala + Chutney Powder",
                    "Sun": "Chicken Schezwan Rice + Chilli Potato + Soy Sauce",
                },
                "lunch": {
                    "Mon": "Ghee Rice + Chicken Curry + Cumin Yogurt + Pickle",
                    "Tue": "Barik Rice/Motta Rice + Fish Curry + Fish Fry + Side Curry + Pickle + Chutney Powder + Upperi + Crunch Pack",
                    "Wed": "Barik Rice/Motta Rice + Chicken Curry + Chicken Fry + Pickle + Crunch Pack",
                    "Thu": "Barik Rice/Motta Rice + Fish Curry + Side Curry + Pickle + Crunch Pack + Upperi + Masala Scrambled Egg + Fis Fry",
                    "Fri": "Chicken Biryani + Vinegar Salad + Pickle",
                    "Sat": "Barik Rice/Motta Rice + Side Curry + Pickle + Chutney Powder + Upperi + Crunch Pack",
                    "Sun": "Chicken Mandi + Salsa",
                },
                "dinner": {
                    "Mon": "Chapati + Chicken Kadai",
                    "Tue": "Chicken Kabsa + Salsa",
                    "Wed": "Porotta + Chicken Masala",
                    "Thu": "Chapati + Sausage Roast",
                    "Fri": "Porotta + Chicken Chilli",
                    "Sat": "Ghee Rice + Beef Curry + Pickle",
                    "Sun": "Porotta + Chicken Rogan Josh",
                },
            },
            "Non-Vegetarian": {
                "breakfast": {
                    "Mon": "Appam + Egg Stew",
                    "Tue": "Porotta + Sausage Curry",
                    "Wed": "Uttapam + Chicken Kurma",
                    "Thu": "Upma + Egg Roast",
                    "Fri": "Puttu + Chicken Curry",
                    "Sat": "Wheat Dosa + Aloo Gobi",
                    "Sun": "Rava Idli + Chicken Curry",
                },
                "tiffin_lunch": {
                    "Mon": "Garlic Rice + Soya Chunks Roast + Dry Moong Dal Curry",
                    "Tue": "Chicken Fried Rice + Chilli Gobi + Chilli Vinegar",
                    "Wed": "White Rice + Rajma Masala + Dry Subzi",
                    "Thu": "Lemon Herb Rice + Aloo Methi Fry + Tomato Salsa",
                    "Fri": "Chicken Biryani + Pickle + Crunch Pack",
                    "Sat": "Tomato Rice + Mushroom Masala + Chutney Powder",
                    "Sun": "Chicken Schezwan Rice + Chilli Potato + Soy Sauce",
                },
                "lunch": {
                    "Mon": "Ghee Rice + Chicken Curry + Cumin Yogurt + Pickle",
                    "Tue": "Barik Rice/Motta Rice + Fish Curry + Side Curry + Pickle + Chutney Powder + Upperi + Fish Fry",
                    "Wed": "Barik Rice/Motta Rice + Chicken Curry + Chicken Fry + Pickle + Crunch Pack",
                    "Thu": "Barik Rice/Motta Rice + Fish Curry + Side Curry + Pickle + Crunch Pack + Upperi + Masala Scrambled Egg + Fis Fry",
                    "Fri": "Chicken Biryani + Vinegar Salad",
                    "Sat": "Barik Rice/Motta Rice + Side Curry + Pickle + Chutney Powder + Upperi + Crunch Pack",
                    "Sun": "Chicken Mandi + Salsa",
                },
                "dinner": {
                    "Mon": "Chapati + Chicken Kadai + Salad",
                    "Tue": "Chicken Kabsa + Salsa + Salad",
                    "Wed": "Porotta + Chicken Masala + Salad",
                    "Thu": "Chapati + Sausage Roast + Salad",
                    "Fri": "Porotta + Chicken Chilli + Salad",
                    "Sat": "Ghee Rice + Beef Curry + Pickle + Salad",
                    "Sun": "Porotta + Chicken Rogan Josh + Salad",
                },
            },
            "Vegetarian": {
                "breakfast": {
                    "Mon": "Appam + Veg Stew",
                    "Tue": "Porotta + Subzi",
                    "Wed": "Uttapam + Sambar + Chutney",
                    "Thu": "Upma + Soya Chunks Curry",
                    "Fri": "Puttu + Black Chana",
                    "Sat": "Wheat Dosa + Aloo Gobi",
                    "Sun": "Rava Idli + Sambar + Chutney",
                },
                "tiffin_lunch": {
                    "Mon": "Garlic Rice + Soya Chunks Roast + Dry Moong Dal Curry",
                    "Tue": "Veg Fried Rice + Chilli Gobi + Chilli Vinegar",
                    "Wed": "White Rice + Rajma Masala + Dry Subzi",
                    "Thu": "Lemon Herb Rice + Aloo Methi Fry + Tomato Salsa",
                    "Fri": "Veg Biryani + Pickle + Crunch Pack",
                    "Sat": "Tomato Rice + Mushroom Masala + Chutney Powder",
                    "Sun": "Veg Schezwan Rice + Chilli Potato + Soy Sauce",
                },
                "lunch": {
                    "Mon": "Ghee Rice + Aloo Karela Subzi + Moong Dal + Cumin Yogurt + Pickle",
                    "Tue": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Aloo Baingan + Dal + Upperi + Pickle + Veg Fry + Crunch Pack",
                    "Wed": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Veg Curry + Veg Fry + Side Curry + Dal + Upperi + Pickle + Crunch Pack",
                    "Thu": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Bhindi Masala + Gobi 65 + Dal + Pickle + Crunch Pack",
                    "Fri": "Gobi 65 Biryani + Vinegar Salad + Pickle",
                    "Sat": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Bhindi Masala + Side Curry + Pickle + Upperi + Crunch Pack",
                    "Sun": "Mushroom Biryani + Raitha + Pickle",
                },
                "dinner": {
                    "Mon": "Chapati + Aloo Matar + Salad",
                    "Tue": "Veg Kabsa + Salsa",
                    "Wed": "Porotta + Veg Curry + Salad",
                    "Thu": "Chapati + Subzi + Salad",
                    "Fri": "Porotta + Veg Jalfrezi + Gobi Fry + Salad",
                    "Sat": "Ghee Rice + Mushroom Tikka Masala + Dal Fry + Pickle",
                    "Sun": "Porotta + Subzi + Salad",
                },
            },
        }

        # REGULAR category mappings
        regular_categories = {
            "Vegetarian": "77227fce-6f40-4592-a679-16b7510c52c3",  # Regular Vegetarian
            "Flexitarian": "14bbf17e-4650-486f-8888-33abdcc47548",  # Regular Flexitarian
            "Non-Vegetarian": "034f2beb-8948-4366-b73d-d8d88d6227d8",  # Regular Non Vegetarian
        }

        self.stdout.write(f"Using REGULAR categories: {regular_categories}")

        # Pricing structure for REGULAR menu
        new_pricing = {
            "Flexitarian": {
                "Breakfast": 240,
                "Tiffin Lunch": 270,
                "Lunch": 360,
                "Dinner": 360,
                "Breakfast & Tiffin Lunch": 540,
                "Breakfast & Lunch": 600,
                "Breakfast & Dinner": 600,
                "Lunch & Dinner": 660,
                "Tiffin Lunch & Dinner": 600,
                "Breakfast & Tiffin Lunch & Dinner": 810,
                "Breakfast & Lunch & Dinner": 900,
            },
            "Non-Vegetarian/Vegetarian": {
                "Breakfast": 270,
                "Tiffin Lunch": 270,
                "Lunch": 420,
                "Dinner": 390,
                "Breakfast & Tiffin Lunch": 540,
                "Breakfast & Lunch": 660,
                "Breakfast & Dinner": 660,
                "Lunch & Dinner": 780,
                "Tiffin Lunch & Dinner": 720,
                "Breakfast & Tiffin Lunch & Dinner": 900,
                "Breakfast & Lunch & Dinner": 990,
            },
        }

        # Pricing category mappings
        pricing_mappings = {"Vegetarian": "Non-Vegetarian/Vegetarian", "Flexitarian": "Flexitarian", "Non-Vegetarian": "Non-Vegetarian/Vegetarian"}

        self.stdout.write(f"Pricing mappings: {pricing_mappings}")
        self.stdout.write("=" * 50)

        try:
            if not dry_run:
                with transaction.atomic():
                    self.update_subscription_prices(new_pricing, regular_categories, pricing_mappings, dry_run)
                    self.create_update_items(new_menu, regular_categories, dry_run)
                    self.update_meal_plans(new_menu, regular_categories, dry_run)
            else:
                self.update_subscription_prices(new_pricing, regular_categories, pricing_mappings, dry_run)
                self.create_update_items(new_menu, regular_categories, dry_run)
                self.update_meal_plans(new_menu, regular_categories, dry_run)

            self.stdout.write(self.style.SUCCESS("REGULAR menu updated successfully!"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error updating REGULAR menu: {str(e)}"))
            if not dry_run:
                raise

    def update_subscription_prices(self, new_pricing, regular_categories, pricing_mappings, dry_run):
        """Update SubscriptionSubPlan prices"""
        self.stdout.write("Updating SubscriptionSubPlan prices...")

        for category_name, category_uuid in regular_categories.items():
            self.stdout.write(f"  Processing Regular {category_name}...")

            try:
                meal_category = MealCategory.objects.get(pk=category_uuid)
                pricing_key = pricing_mappings.get(category_name)

                if not pricing_key or pricing_key not in new_pricing:
                    self.stdout.write(f"    No pricing found for {category_name} (pricing_key: {pricing_key})")
                    continue

                category_pricing = new_pricing[pricing_key]

                # Get all subscription sub plans for this category
                sub_plans = SubscriptionSubPlan.objects.filter(plan__meal_category=meal_category)

                for sub_plan in sub_plans:
                    try:
                        # Generate price key based on meal types
                        price_key = self.get_price_key(sub_plan)

                        if price_key and price_key in category_pricing:
                            new_price = category_pricing[price_key]
                            old_price = sub_plan.plan_price

                            if not dry_run:
                                sub_plan.plan_price = new_price
                                sub_plan.save()

                            if old_price != new_price:
                                self.stdout.write(f"    {sub_plan.plan.meal_category.name} - {sub_plan.plan.validity} Days - {self.get_readable_meal_types(sub_plan)}: {old_price:.2f} → {new_price} AED")
                            else:
                                self.stdout.write(f"    {sub_plan.plan.meal_category.name} - {sub_plan.plan.validity} Days - {self.get_readable_meal_types(sub_plan)}: {old_price:.2f} AED (no change)")
                        else:
                            self.stdout.write(f"    No price found for {sub_plan.plan.meal_category.name} - {sub_plan.plan.validity} Days - {self.get_readable_meal_types(sub_plan)} (price_key: {price_key})")
                    except Exception as e:
                        self.stdout.write(f"    Error updating sub plan {sub_plan.id}: {str(e)}")
                        continue

            except Exception as e:
                self.stdout.write(f"    Error processing category {category_name}: {str(e)}")
                continue

    def create_update_items(self, new_menu, regular_categories, dry_run):
        """Create or update ItemMaster entries"""
        self.stdout.write("Creating/Updating ItemMaster entries...")

        for category_name, category_uuid in regular_categories.items():
            self.stdout.write(f"  Processing items for Regular {category_name}...")

            try:
                meal_category = MealCategory.objects.get(pk=category_uuid)

                # Get or create ItemCategory
                item_category, created = ItemCategory.objects.get_or_create(name=f"Regular {category_name}")

                for meal_slot, days in new_menu[category_name].items():
                    meal_type = self.extract_meal_type(meal_slot)

                    for day, item_name in days.items():
                        # Split menu items that contain '/'
                        split_items = self.split_menu_items(item_name)

                        for index, individual_item in enumerate(split_items):
                            item_code = self.generate_item_code(category_name, meal_type, day, index, len(split_items))

                            try:
                                # Check if item already exists
                                existing_item = ItemMaster.objects.filter(item_code=item_code).first()

                                if existing_item:
                                    if existing_item.name != individual_item:
                                        if not dry_run:
                                            existing_item.name = individual_item
                                            existing_item.save()
                                        self.stdout.write(f"    Updating {item_code}: {existing_item.name} → {individual_item}")
                                    else:
                                        self.stdout.write(f"    {item_code}: {individual_item} (no change)")
                                else:
                                    if not dry_run:
                                        ItemMaster.objects.create(item_code=item_code, name=individual_item, mealtype=meal_type, category=item_category, is_veg=self.is_vegetarian(individual_item, category_name))
                                    self.stdout.write(f"    Creating {item_code}: {individual_item}")

                            except Exception as e:
                                self.stdout.write(f"    Error creating/updating {item_code}: {str(e)}")
                                continue

            except Exception as e:
                self.stdout.write(f"    Error processing category {category_name}: {str(e)}")
                continue

    def update_meal_plans(self, new_menu, regular_categories, dry_run):
        """Update MealPlan entries"""
        self.stdout.write("Updating MealPlan entries...")

        for category_name, category_uuid in regular_categories.items():
            self.stdout.write(f"  Processing meal plans for Regular {category_name}...")

            try:
                meal_category = MealCategory.objects.get(pk=category_uuid)

                for meal_slot, days in new_menu[category_name].items():
                    meal_type = self.extract_meal_type(meal_slot)

                    for day, item_name in days.items():
                        # Clear existing meal plans for this day/meal type
                        if not dry_run:
                            MealPlan.objects.filter(meal_category=meal_category, day=day, menu_item__mealtype=meal_type).delete()

                        # Split menu items that contain '/'
                        split_items = self.split_menu_items(item_name)

                        for index, individual_item in enumerate(split_items):
                            item_code = self.generate_item_code(category_name, meal_type, day, index, len(split_items))

                            try:
                                # Find the ItemMaster
                                item_master = ItemMaster.objects.filter(item_code=item_code).first()

                                if item_master:
                                    if not dry_run:
                                        MealPlan.objects.create(meal_category=meal_category, day=day, menu_item=item_master)
                                    self.stdout.write(f"    Created meal plan: {day} {meal_type} → {individual_item}")
                                else:
                                    self.stdout.write(f"    ItemMaster {item_code} not found for {day} {meal_type}")

                            except Exception as e:
                                self.stdout.write(f"    Error creating meal plan for {item_code}: {str(e)}")
                                continue

            except Exception as e:
                self.stdout.write(f"    Error processing category {category_name}: {str(e)}")
                continue

    def extract_meal_type(self, meal_slot):
        """Extract meal type from meal slot description"""
        if "breakfast" in meal_slot:
            return "BREAKFAST"
        elif "tiffin_lunch" in meal_slot:
            return "TIFFIN_LUNCH"
        elif "lunch" in meal_slot:
            return "LUNCH"
        elif "dinner" in meal_slot:
            return "DINNER"
        return "BREAKFAST"  # Default

    def split_menu_items(self, item_name):
        """Split menu items that contain '/' into separate items"""
        if "/" in item_name:
            # Special handling for "Barik Rice / Motta Rice" pattern
            if "Barik Rice" in item_name and "Motta Rice" in item_name:
                # The format is: "Barik Rice (680cc)/ Motta Rice + [other items]" or "Barik Rice/Motta Rice + [other items]"
                # We need to extract the common suffix after the rice options

                # Find the position of the rice options - handle both patterns
                rice_patterns = ["Barik Rice (680cc)/ Motta Rice", "Barik Rice/Motta Rice"]
                rice_index = -1
                rice_pattern = ""

                for pattern in rice_patterns:
                    rice_index = item_name.find(pattern)
                    if rice_index >= 0:
                        rice_pattern = pattern
                        break

                if rice_index >= 0:
                    # Extract everything before the rice pattern
                    before_rice = item_name[:rice_index].strip()

                    # Extract everything after the rice pattern
                    after_rice = item_name[rice_index + len(rice_pattern) :].strip()

                    # Remove the leading "+" if present
                    if after_rice.startswith("+"):
                        after_rice = after_rice[1:].strip()

                    # Create the two options and clean up extra spaces and plus signs
                    if "(680cc)" in rice_pattern:
                        option1 = f"{before_rice} + Barik Rice (680cc) + {after_rice}".strip(" +")
                        option2 = f"{before_rice} + Motta Rice + {after_rice}".strip(" +")
                    else:
                        option1 = f"{before_rice} + Barik Rice + {after_rice}".strip(" +")
                        option2 = f"{before_rice} + Motta Rice + {after_rice}".strip(" +")

                    # Clean up any double plus signs or extra spaces
                    option1 = " + ".join([part.strip() for part in option1.split("+") if part.strip()])
                    option2 = " + ".join([part.strip() for part in option2.split("+") if part.strip()])

                    return [option1, option2]

            # Default split behavior for other cases
            items = [item.strip() for item in item_name.split("/")]
            return items
        else:
            return [item_name]

    def generate_item_code(self, category_name, meal_type, day, index=0, total_items=1):
        """Generate item code based on category, meal type, day, and item index"""
        category_prefix = {"Vegetarian": "RV29", "Flexitarian": "RF29", "Non-Vegetarian": "RNV29"}.get(category_name, "RX29")  # Regular Vegetarian

        meal_prefix = {"BREAKFAST": "BF", "TIFFIN_LUNCH": "TL", "LUNCH": "L", "DINNER": "D"}.get(meal_type, "BF")

        day_num = {"Mon": "001", "Tue": "002", "Wed": "003", "Thu": "004", "Fri": "005", "Sat": "006", "Sun": "007"}.get(day, "001")

        # Add suffix if multiple items for the same day/meal
        if total_items > 1:
            suffix = chr(65 + index)  # A, B, C, etc.
            return f"{category_prefix} {meal_prefix}{day_num}{suffix}"
        else:
            return f"{category_prefix} {meal_prefix}{day_num}"

    def get_price_key(self, sub_plan):
        """Generate price key based on meal types"""
        meal_types_str = sub_plan.meals()
        if not meal_types_str:
            return None

        # Split the meal types string and convert to pricing format
        meal_types = [meal.strip() for meal in meal_types_str.split(",")]
        meal_type_names = []

        for meal_type in meal_types:
            if meal_type == "Break Fast":
                meal_type_names.append("Breakfast")
            elif meal_type == "Tiffin Lunch":
                meal_type_names.append("Tiffin Lunch")
            elif meal_type == "Lunch":
                meal_type_names.append("Lunch")
            elif meal_type == "Dinner":
                meal_type_names.append("Dinner")

        if len(meal_type_names) == 1:
            return meal_type_names[0]
        elif len(meal_type_names) == 2:
            return f"{meal_type_names[0]} & {meal_type_names[1]}"
        elif len(meal_type_names) == 3:
            return f"{meal_type_names[0]} & {meal_type_names[1]} & {meal_type_names[2]}"

        return None

    def get_readable_meal_types(self, sub_plan):
        """Get readable meal types for display"""
        meal_types = sub_plan.meals()
        if not meal_types:
            return "No Meals"
        return meal_types  # meals() already returns a formatted string

    def is_vegetarian(self, item_name, category_name):
        """Determine if an item is vegetarian based on its name and category"""
        if category_name == "Vegetarian":
            return True
        elif category_name == "Non-Vegetarian":
            return False
        else:  # Flexitarian
            # Check for non-vegetarian ingredients
            non_veg_keywords = ["chicken", "fish", "beef", "egg", "meat", "sausage"]
            return not any(keyword in item_name.lower() for keyword in non_veg_keywords)
