from django.core.management.base import BaseCommand
from django.db import connection, transaction

from main.models import ItemCategory, ItemMaster, MealCategory, MealPlan, SubscriptionSubPlan


class Command(BaseCommand):
    help = "Update PREMIUM menu with new structure and pricing"

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

        # New PREMIUM menu structure
        new_menu = {
            "Vegetarian": {
                "breakfast": {
                    "Mon": "Chapati + Veg Stew + Green Tea",
                    "Tue": "Porotta + Subzi + Fruit",
                    "Wed": "Chapati + Potato Bhaji + Tea Bag",
                    "Thu": "Semiya Upma + Soya Chunks Curry + Tea Bag",
                    "Fri": "Aloo Paratha + Curd + Pickle",
                    "Sat": "Chapati + Aloo Gobi + Fruit",
                    "Sun": "Rava Idli + Sambar + Chutney + Fruit",
                },
                "tiffin_lunch": {
                    "Mon": "Garlic Rice + Soya Chunks Roast + Dry Moong Dal Curry + Fruit + Water",
                    "Tue": "Veg Fried Rice + Chilli Gobi + Chilli Vinegar + Fruit + Water",
                    "Wed": "White Rice + Rajma Masala + Dry Subzi + Fruit + Water",
                    "Thu": "Lemon Herb Rice + Aloo Methi Fry + Tomato Salsa + Fruit + Water",
                    "Fri": "Veg Biryani + Pickle + Crunch Pack + Fruit + Water",
                    "Sat": "Tomato Rice + Mushroom Masala + Chutney Powder + Fruit + Water",
                    "Sun": "Veg Schezwan Rice + Chilli Potato + Soy Sauce + Fruit + Water",
                },
                "lunch": {
                    "Mon": "Ghee Rice + Aloo Karela Subzi + Cumin Yogurt + Moong Dal + Pickle + Crunch Pack + Juice",
                    "Tue": "1 Chapati + Barik Rice + Veg Curry + Side Curry + Upperi + Pickle + Veg Fry + Crunch Pack + Chutney Powder + Yogurt + Juice",
                    "Wed": "1 Chapati + Barik Rice + Veg Curry + Side Curry + Upperi + Pickle + Veg Fry + Crunch Pack + Yogurt + Juice",
                    "Thu": "1 Chapati + Barik Rice + Veg Curry + Side Curry + Upperi + Pickle + Veg Fry + Crunch Pack + Chutney Powder + Yogurt + Juice",
                    "Fri": "Gobi 65 Biryani + Vinegar Salad + Pickle + Crunch Pack + Sweet + Thick Chutney + Paneer Fry + Juice",
                    "Sat": "1 Chapati + Barik Rice + Veg Curry + Side Curry + Upperi + Pickle + Veg Fry + Crunch Pack + Chutney Powder + Yogurt + Juice",
                    "Sun": "Veg Magluba + Salsa + Yogurt + Pickle + Salad + Juice",
                },
                "dinner": {
                    "Mon": "Chapati + Paneer Butter Masala + Fruit",
                    "Tue": "Veg Kabsa + Salsa + Salad + Fruit",
                    "Wed": "Wheat Porotta + Veg Curry + Salad + Fruit",
                    "Thu": "Porotta + Veg Kadai + Salad + Fruit",
                    "Fri": "Chapati + Subzi + Salad + Fruit",
                    "Sat": "Ghee Rice + Mushroom Tikka Masala + Dal Fry + Pickle + Fruit",
                    "Sun": "Porotta + Subzi + Salad + Fruit",
                },
            },
            "Flexitarian": {
                "breakfast": {
                    "Mon": "Chapati + Egg Stew + Green Tea",
                    "Tue": "Porotta + Sausage Curry + Fruit",
                    "Wed": "Chapati + Chicken Kurma + Tea Bag",
                    "Thu": "Semiya Upma + Egg Roast + Tea Bag",
                    "Fri": "Aloo Paratha + Chicken Curry + Fruit",
                    "Sat": "Chapati + Aloo Gobi + Fruit",
                    "Sun": "Rava Idli + Chicken Curry + Fruit",
                },
                "tiffin_lunch": {
                    "Mon": "Garlic Rice + Soya Chunks Roast + Dry Moong Dal Curry + Fruit + Water",
                    "Tue": "Chicken Fried Rice + Chilli Gobi + Chilli Vinegar + Fruit + Water",
                    "Wed": "White Rice + Rajma Masala + Dry Subzi + Fruit + Water",
                    "Thu": "Lemon Herb Rice + Aloo Methi Fry + Tomato Salsa + Fruit + Water",
                    "Fri": "Chicken Biryani + Pickle + Crunch Pack + Fruit + Water",
                    "Sat": "Tomato Rice + Mushroom Masala + Chutney Powder + Fruit + Water",
                    "Sun": "Chicken Schezwan Rice + Chilli Potato + Soy Sauce + Fruit + Water",
                },
                "lunch": {
                    "Mon": "Ghee Rice + Chicken Curry + Cumin Yogurt + Pickle + Dal + Crunch Pack + Juice",
                    "Tue": "1 Chapati + Barik Rice + Veg Curry + Side Curry + Upperi + Pickle + Veg Fry + Masala Scrambled Egg + Chutney Powder + Crunch Pack + Yogurt + Juice",
                    "Wed": "1 Chapati + Barik Rice + Chicken Curry + Chicken Fry + Pickle + Crunch Pack + Yogurt + Juice",
                    "Thu": "1 Chapati + Barik Rice + Chicken Curry + Side Curry + Upperi + Pickle + Veg Fry + Masala Scrambled Egg + Chutney Powder + Crunch Pack + Yogurt + Juice",
                    "Fri": "Chicken Biryani + Raitha + Pickle + Crunch Pack + Sweet + Thick Chutney + Chicken Fry + Juice",
                    "Sat": "1 Chapati + Barik Rice + Veg Curry + Side Curry + Upperi + Pickle + Veg Fry + Masala Scrambled Egg + Chutney Powder + Yogurt + Crunch Pack + Juice",
                    "Sun": "Chicken Mandi + Salsa + Yogurt + Pickle + Salad + Juice",
                },
                "dinner": {
                    "Mon": "Chapati + Chicken Kadai + Fruit",
                    "Tue": "Chicken Kabsa + Salsa + Salad + Fruit",
                    "Wed": "Porotta + Chicken Masala + Fruit",
                    "Thu": "Chapati + Sausage Roast + Fruit",
                    "Fri": "Porotta + Chicken Chilli + Fruit",
                    "Sat": "Ghee Rice + Chicken Masala + Pickle + Fruit",
                    "Sun": "Porotta + Chicken Rogan Josh + Fruit",
                },
            },
            "Non-Vegetarian": {
                "breakfast": {
                    "Mon": "Chapati + Egg Stew + Green Tea",
                    "Tue": "Porotta + Sausage Curry + Fruit",
                    "Wed": "Chapati + Chicken Kurma + Tea Bag",
                    "Thu": "Semiya Upma + Egg Roast + Tea Bag",
                    "Fri": "Aloo Paratha + Chicken Curry + Fruit",
                    "Sat": "Chapati + Aloo Gobi + Fruit",
                    "Sun": "Rava Idli + Chicken Curry + Fruit",
                },
                "tiffin_lunch": {
                    "Mon": "Garlic Rice + Soya Chunks Roast + Dry Moong Dal Curry + Fruit + Water",
                    "Tue": "Chicken Fried Rice + Chilli Gobi + Chilli Vinegar + Fruit + Water",
                    "Wed": "White Rice + Rajma Masala + Dry Subzi + Fruit + Water",
                    "Thu": "Lemon Herb Rice + Aloo Methi Fry + Tomato Salsa + Fruit + Water",
                    "Fri": "Chicken Biryani + Pickle + Crunch Pack + Fruit + Water",
                    "Sat": "Tomato Rice + Mushroom Masala + Chutney Powder + Fruit + Water",
                    "Sun": "Chicken Schezwan Rice + Chilli Potato + Soy Sauce + Fruit + Water",
                },
                "lunch": {
                    "Mon": "Ghee Rice + Chicken Curry + Cumin Yogurt + Pickle + Dal + Crunch Pack + Juice",
                    "Tue": "1 Chapati + Barik Rice + Chicken Curry + Chicken 65 + Chutney Powder + Pickle + Masala Scrambled Egg + Upperi + Crunch Pack + Yogurt + Juice",
                    "Wed": "1 Chapati + Barik Rice + Red Chicken Curry + Chicken 65 + Chutney Powder + Pickle + Masala Scrambled Egg + Upperi + Crunch Pack + Yogurt + Juice",
                    "Thu": "1 Chapati + Barik Rice + Chicken Curry + Chicken 65 + Chutney Powder + Pickle + Masala Scrambled Egg + Upperi + Crunch Pack + Yogurt + Juice",
                    "Fri": "Chicken Biryani + Raitha + Pickle + Crunch Pack + Sweet + Thick Chutney + Chicken Fry + Juice",
                    "Sat": "1 Chapati + Barik Rice + Chicken Curry + Chicken 65 + Chutney Powder + Pickle + Masala Scrambled Egg + Upperi + Crunch Pack + Yogurt + Juice",
                    "Sun": "Chicken Mandi + Salsa + Yogurt + Pickle + Salad + Juice",
                },
                "dinner": {
                    "Mon": "Chapati + Chicken Kadai + Fruit",
                    "Tue": "Chicken Kabsa + Salsa + Salad + Fruit",
                    "Wed": "Wheat Porotta + Chicken Masala + Fruit",
                    "Thu": "Chapati + Chicken Fry + Dal + Salad + Fruit",
                    "Fri": "Porotta + Chicken Chilli + Fruit",
                    "Sat": "Ghee Rice + Chicken Masala + Dal Fry + Pickle + Fruit",
                    "Sun": "Porotta + Chicken Rogan Josh + Salad + Fruit",
                },
            },
        }

        # PREMIUM category mappings
        premium_categories = {
            "Vegetarian": "2283490d-75d2-4d02-8c80-29dbe82a4a8a",  # Premium Vegetarian
            "Flexitarian": "130c1907-ffa1-4019-9ef8-8be59fbcc696",  # Premium Flexitarian
            "Non-Vegetarian": "2e5a0ae4-8208-4641-a98d-8b89a9bb8534",  # Premium Non Vegetarian
        }

        self.stdout.write(f"Using PREMIUM categories: {premium_categories}")

        # Pricing structure for PREMIUM menu (same for all categories)
        new_pricing = {
            "Premium": {
                "Breakfast": 450,
                "Tiffin Lunch": 480,
                "Lunch": 660,
                "Dinner": 540,
                "Breakfast & Tiffin Lunch": 900,
                "Breakfast & Lunch": 1020,
                "Breakfast & Dinner": 960,
                "Lunch & Dinner": 1140,
                "Tiffin Lunch & Dinner": 960,
                "Breakfast & Tiffin Lunch & Dinner": 1440,
                "Breakfast & Lunch & Dinner": 1530,
            }
        }

        # Pricing category mappings (all use same pricing)
        pricing_mappings = {"Vegetarian": "Premium", "Flexitarian": "Premium", "Non-Vegetarian": "Premium"}

        self.stdout.write(f"Pricing mappings: {pricing_mappings}")
        self.stdout.write("=" * 50)

        try:
            if not dry_run:
                with transaction.atomic():
                    self.update_subscription_prices(new_pricing, premium_categories, pricing_mappings, dry_run)
                    self.create_update_items(new_menu, premium_categories, dry_run)
                    self.update_meal_plans(new_menu, premium_categories, dry_run)
            else:
                self.update_subscription_prices(new_pricing, premium_categories, pricing_mappings, dry_run)
                self.create_update_items(new_menu, premium_categories, dry_run)
                self.update_meal_plans(new_menu, premium_categories, dry_run)

            self.stdout.write(self.style.SUCCESS("PREMIUM menu updated successfully!"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error updating PREMIUM menu: {str(e)}"))
            if not dry_run:
                raise

    def update_subscription_prices(self, new_pricing, premium_categories, pricing_mappings, dry_run):
        """Update SubscriptionSubPlan prices"""
        self.stdout.write("Updating SubscriptionSubPlan prices...")

        for category_name, category_uuid in premium_categories.items():
            self.stdout.write(f"  Processing Premium {category_name}...")

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

    def create_update_items(self, new_menu, premium_categories, dry_run):
        """Create or update ItemMaster entries"""
        self.stdout.write("Creating/Updating ItemMaster entries...")

        for category_name, category_uuid in premium_categories.items():
            self.stdout.write(f"  Processing items for Premium {category_name}...")

            try:
                meal_category = MealCategory.objects.get(pk=category_uuid)

                # Get or create ItemCategory
                item_category, created = ItemCategory.objects.get_or_create(name=f"Premium {category_name}")

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

    def update_meal_plans(self, new_menu, premium_categories, dry_run):
        """Update MealPlan entries"""
        self.stdout.write("Updating MealPlan entries...")

        for category_name, category_uuid in premium_categories.items():
            self.stdout.write(f"  Processing meal plans for Premium {category_name}...")

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
        category_prefix = {"Vegetarian": "PV31", "Flexitarian": "PF31", "Non-Vegetarian": "PNV31"}.get(category_name, "PX31")  # Premium Vegetarian

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
