from django.core.management.base import BaseCommand
from django.db import connection, transaction

from main.models import ItemCategory, ItemMaster, MealCategory, MealPlan, SubscriptionSubPlan


class Command(BaseCommand):
    help = "Update ESSENTIAL menu with new structure and pricing"

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

        # New ESSENTIAL menu structure
        new_menu = {
            "Pro Flexitarian": {
                "breakfast": {
                    "Mon": "Chapati + Veg Stew",
                    "Tue": "Porotta + Subzi",
                    "Wed": "Dosa + Sambar + Chutney",
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
                    "Tue": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Kolhapuri Chicken + Side Curry + Upperi + Pickle + Crunch Pack",
                    "Wed": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Chicken Curry + Side Curry + Pickle + Crunch Pack + Upperi",
                    "Thu": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Bhindi Masala + Chicken Fry + Dal + Pickle + Crunch Pack",
                    "Fri": "Chicken Biryani + Vinegar Salad + Pickle",
                    "Sat": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Red Chicken Curry + Side Curry + Pickle + Crunch Pack",
                    "Sun": "Chicken Mandi + Salsa",
                },
                "dinner": {
                    "Mon": "Chapati + Chicken Kadai",
                    "Tue": "Chicken Kabsa + Salsa",
                    "Wed": "White Rice + Chicken Masala Curry",
                    "Thu": "Chapati + Subzi",
                    "Fri": "Porotta + Chicken Chilli",
                    "Sat": "Ghee Rice + Mushroom Tikka Masala + Dal Fry + Cumin Yogurt",
                    "Sun": "Porotta + Subzi",
                },
            },
            "Flexitarian": {
                "breakfast": {
                    "Mon": "Appam + Green Peas",
                    "Tue": "Porotta + Aloo Matar",
                    "Wed": "Dosa + Sambar + Chutney",
                    "Thu": "Upma + Rajma Masala",
                    "Fri": "Puttu + Black Chana",
                    "Sat": "Appam + Aloo Gobi",
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
                    "Tue": "Barik Rice/Motta Rice + Fish Curry + Side Curry + Pickle + Upperi + Fish Fry",
                    "Wed": "Barik Rice/Motta Rice + Chicken Curry + Chicken Fry + Pickle + Crunch Pack",
                    "Thu": "Barik Rice/Motta Rice + Fish Curry + Side Curry + Pickle + Upperi + Scrambled Egg",
                    "Fri": "Chicken Biryani + Vinegar Salad + Pickle",
                    "Sat": "Barik Rice/Motta Rice + Fish Curry + Side Curry + Pickle + Chamdhi Powder + Crunch Pack",
                    "Sun": "Chicken Mandi + Salsa",
                },
                "dinner": {
                    "Mon": "Chapati + Egg Curry",
                    "Tue": "Chicken Kabsa + Salsa",
                    "Wed": "Porotta + Chicken Masala",
                    "Thu": "Chapati + Sausage Roast",
                    "Fri": "Porotta + Chicken Chilli",
                    "Sat": "Ghee Rice + Beef Curry + Pickle",
                    "Sun": "Porotta + Subzi",
                },
            },
            "Vegetarian": {
                "breakfast": {
                    "Mon": "Chapati + Veg Stew",
                    "Tue": "Porotta + Subzi",
                    "Wed": "Appam + Bhaji",
                    "Thu": "Upma + Rajma Masala",
                    "Fri": "Puttu + Black Chana",
                    "Sat": "Chapati + Aloo Gobi",
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
                    "Tue": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Aloo Baingan + Dal + Upperi + Pickle + Crunch Pack",
                    "Wed": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Veg Curry + Side Curry + Dal + Upperi + Pickle + Crunch Pack",
                    "Thu": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Bhindi Masala + Gobi 65 + Dal + Pickle + Crunch Pack",
                    "Fri": "Gobi 65 Biryani + Vinegar Salad + Pickle",
                    "Sat": "1 Chapati + Barik Rice (680cc)/ Motta Rice + Bhindi Masala Curry + Side Curry + Pickle + Upperi + Crunch Pack",
                    "Sun": "Mushroom Biryani + Raitha + Pickle",
                },
                "dinner": {
                    "Mon": "Chapati + Aloo Matar",
                    "Tue": "Veg Kabsa + Tomato Salsa",
                    "Wed": "White Rice + Veg Curry",
                    "Thu": "Chapati + Subzi",
                    "Fri": "Porotta + Veg Jalfarezi + Gobi Fry",
                    "Sat": "Ghee Rice + Mushroom Tikka Masala + Dal Fry + Pickle",
                    "Sun": "Porotta + Subzi",
                },
            },
        }

        # ESSENTIAL category mappings
        essential_categories = {
            "Vegetarian": "a23a42e4-85d3-4f31-bb74-1dfc1f80fd6b",  # Essential Vegetarian
            "Flexitarian": "cf77027a-07e9-4c64-82ac-f73a4cad7a77",  # Essential Flexitarian
            "Pro Flexitarian": "951454a5-69aa-405f-a8c7-01211ea0dbe6",  # Essential Pro Flexitarian
        }

        self.stdout.write(f"Using ESSENTIAL categories: {essential_categories}")

        # Pricing structure for ESSENTIAL menu
        new_pricing = {
            "Flexitarian": {
                "Breakfast": 150,
                "Tiffin Lunch": 240,
                "Lunch": 210,
                "Dinner": 210,
                "Breakfast & Tiffin Lunch": 300,
                "Breakfast & Lunch": 360,
                "Breakfast & Dinner": 360,
                "Lunch & Dinner": 390,
                "Tiffin Lunch & Dinner": 390,
                "Breakfast & Tiffin Lunch & Dinner": 480,
                "Breakfast & Lunch & Dinner": 480,
            },
            "Pro Flexitarian/Vegetarian": {
                "Breakfast": 210,
                "Tiffin Lunch": 240,
                "Lunch": 270,
                "Dinner": 270,
                "Breakfast & Tiffin Lunch": 480,
                "Breakfast & Lunch": 480,
                "Breakfast & Dinner": 480,
                "Lunch & Dinner": 540,
                "Tiffin Lunch & Dinner": 480,
                "Breakfast & Tiffin Lunch & Dinner": 720,
                "Breakfast & Lunch & Dinner": 720,
            },
        }

        # Pricing category mappings
        pricing_mappings = {"Vegetarian": "Pro Flexitarian/Vegetarian", "Flexitarian": "Flexitarian", "Pro Flexitarian": "Pro Flexitarian/Vegetarian"}

        self.stdout.write(f"Pricing mappings: {pricing_mappings}")
        self.stdout.write("=" * 50)

        try:
            if not dry_run:
                with transaction.atomic():
                    self.update_subscription_prices(new_pricing, essential_categories, pricing_mappings, dry_run)
                    self.create_update_items(new_menu, essential_categories, dry_run)
                    self.update_meal_plans(new_menu, essential_categories, dry_run)
            else:
                self.update_subscription_prices(new_pricing, essential_categories, pricing_mappings, dry_run)
                self.create_update_items(new_menu, essential_categories, dry_run)
                self.update_meal_plans(new_menu, essential_categories, dry_run)

            self.stdout.write(self.style.SUCCESS("ESSENTIAL menu updated successfully!"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error updating ESSENTIAL menu: {str(e)}"))
            if not dry_run:
                raise

    def update_subscription_prices(self, new_pricing, essential_categories, pricing_mappings, dry_run):
        """Update SubscriptionSubPlan prices"""
        self.stdout.write("Updating SubscriptionSubPlan prices...")

        for category_name, category_uuid in essential_categories.items():
            self.stdout.write(f"  Processing Essential {category_name}...")

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

    def create_update_items(self, new_menu, essential_categories, dry_run):
        """Create or update ItemMaster entries"""
        self.stdout.write("Creating/Updating ItemMaster entries...")

        for category_name, category_uuid in essential_categories.items():
            self.stdout.write(f"  Processing items for Essential {category_name}...")

            try:
                meal_category = MealCategory.objects.get(pk=category_uuid)

                # Get or create ItemCategory
                item_category, created = ItemCategory.objects.get_or_create(name=f"Essential {category_name}")

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

    def update_meal_plans(self, new_menu, essential_categories, dry_run):
        """Update MealPlan entries"""
        self.stdout.write("Updating MealPlan entries...")

        for category_name, category_uuid in essential_categories.items():
            self.stdout.write(f"  Processing meal plans for Essential {category_name}...")

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
        category_prefix = {"Vegetarian": "EV30", "Flexitarian": "EF30", "Pro Flexitarian": "EPF30"}.get(category_name, "EX30")  # Essential Vegetarian

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
        elif category_name == "Pro Flexitarian":
            return False  # Pro Flexitarian includes non-veg items
        else:  # Flexitarian
            # Check for non-vegetarian ingredients
            non_veg_keywords = ["chicken", "fish", "beef", "egg", "meat", "sausage"]
            return not any(keyword in item_name.lower() for keyword in non_veg_keywords)
