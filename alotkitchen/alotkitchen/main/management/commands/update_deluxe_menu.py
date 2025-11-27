from django.core.management.base import BaseCommand
from django.db import connection, transaction

from main.models import ItemCategory, ItemMaster, MealCategory, MealPlan, SubscriptionSubPlan


class Command(BaseCommand):
    help = "Update DELUXE menu with new pricing and meal plans"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be updated without making changes",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        # Reset any broken transactions
        try:
            connection.close()
        except:
            pass

        # Your new DELUXE menu structure
        new_menu = {
            "menu": {
                "type": "DELUXE",
                "prices_in_AED": {
                    "Flexitarian": {
                        "Breakfast": 270,
                        "Tiffin Lunch": 300,
                        "Lunch": 360,
                        "Dinner": 360,
                        "Breakfast & Tiffin Lunch": 540,
                        "Breakfast & Lunch": 600,
                        "Breakfast & Dinner": 600,
                        "Lunch & Dinner": 720,
                        "Tiffin Lunch & Dinner": 720,
                        "Breakfast & Tiffin Lunch & Dinner": 900,
                        "Breakfast & Lunch & Dinner": 990,
                    },
                    "Non-Vegetarian/Vegetarian": {
                        "Breakfast": 360,
                        "Tiffin Lunch": 300,
                        "Lunch": 450,
                        "Dinner": 450,
                        "Breakfast & Tiffin Lunch": 600,
                        "Breakfast & Lunch": 780,
                        "Breakfast & Dinner": 750,
                        "Lunch & Dinner": 840,
                        "Tiffin Lunch & Dinner": 780,
                        "Breakfast & Tiffin Lunch & Dinner": 1050,
                        "Breakfast & Lunch & Dinner": 1170,
                    },
                },
                "schedule": {
                    "Flexitarian": {
                        "Breakfast (6:00 AM - 8:00 AM)": {
                            "Mon": "Appam + Veg Stew",
                            "Tue": "Porotta + Subzi",
                            "Wed": "Uttapam + Sambar + Chutney",
                            "Thu": "Upma + Soya Chunks Curry",
                            "Fri": "Puttu + Black Chana",
                            "Sat": "Wheat Dosa + Aloo Gobi",
                            "Sun": "Rava Idli + Sambar + Chutney",
                        },
                        "Tiffin Lunch (6:00 AM - 8:00 AM)": {
                            "Mon": "Garlic Rice + Soya Chunks Roast + Dry Moong Dal Curry",
                            "Tue": "Chicken Fried Rice + Chilli Gobi + Chilli Vinegar",
                            "Wed": "White Rice + Rajma Masala + Dry Subzi",
                            "Thu": "Lemon Herb Rice + Aloo Methi Fry + Tomato Salsa",
                            "Fri": "Chicken Biryani + Pickle + Crunch Pack",
                            "Sat": "Tomato Rice + Mushroom Masala + Chutney Powder",
                            "Sun": "Chicken Schezwan Rice + Chilli Potato + Soy Sauce",
                        },
                        "Lunch (11:00 AM - 1:00 PM)": {
                            "Mon": "Ghee Rice + Chicken Curry + Cumin Yogurt + Pickle",
                            "Tue": "Bark Rice/Motta Rice + Fish Curry + Fish Fry + Side Curry + Pickle + Crunch Pack + Masala Scrambled Egg + Upper + Chutney Powder",
                            "Wed": "Bark Rice/Motta Rice + Chicken Curry + Chicken Fry + Pickle + Crunch Pack",
                            "Thu": "Bark Rice/Motta Rice + Fish Curry + Fish Fry + Side Curry + Pickle + Crunch Pack + Upper + Masala Scrambled Egg + Chutney Powder",
                            "Fri": "Chicken Biryani + Vinegar Salad + Pickle",
                            "Sat": "Bark Rice/Motta Rice + Fish Curry + Fish Fry + Side Curry + Pickle + Crunch Pack + Upper + Chutney Powder + Masala Scrambled Egg",
                            "Sun": "Chicken Mandi + Salsa",
                        },
                        "Dinner (5:00 PM - 7:00 PM)": {
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
                        "Breakfast (6:00 AM - 8:00 AM)": {
                            "Mon": "Chapati + Egg Stew",
                            "Tue": "Porotta + Sausage Curry",
                            "Wed": "Chapati + Chicken Kurma",
                            "Thu": "Semiya Upma + Egg Roast",
                            "Fri": "Aloo Paratha + Chicken Curry",
                            "Sat": "Chapati + Aloo Gobi",
                            "Sun": "Rava Idli + Chicken Curry",
                        },
                        "Tiffin Lunch (6:00 AM - 8:00 AM)": {
                            "Mon": "Garlic Rice + Soya Chunks Roast + Dry Moong Dal Curry",
                            "Tue": "Chicken Fried Rice + Chilli Gobi + Chilli Vinegar",
                            "Wed": "White Rice + Rajma Masala + Dry Subzi",
                            "Thu": "Lemon Herb Rice + Aloo Methi Fry + Tomato Salsa",
                            "Fri": "Chicken Biryani + Pickle + Crunch Pack",
                            "Sat": "Tomato Rice + Mushroom Masala + Chutney Powder",
                            "Sun": "Chicken Schezwan Rice + Chilli Potato + Soy Sauce",
                        },
                        "Lunch (11:00 AM - 1:00 PM)": {
                            "Mon": "Ghee Rice + Chicken Curry + Cumin Yogurt + Pickle",
                            "Tue": "1 Chapati + Bark Rice/Motta Rice + Chicken Curry + Chicken 65 + Upper + Chutney Powder + Pickle + Crunch Pack + Masala Scrambled Egg",
                            "Wed": "1 Chapati + Bark Rice/Motta Rice + Chicken Curry + Chicken 65 + Upper + Chutney Powder + Pickle + Crunch Pack + Masala Scrambled Egg",
                            "Thu": "1 Chapati + Bark Rice/Motta Rice + Chicken Curry + Chicken 65 + Upper + Chutney Powder + Pickle + Crunch Pack + Masala Scrambled Egg",
                            "Fri": "Chicken Biryani + Raita + Pickle + Crunch Pack + Sweet",
                            "Sat": "1 Chapati + Bark Rice/Motta Rice + Chicken Curry + Chicken 65 + Upper + Chutney Powder + Pickle + Crunch Pack + Masala Scrambled Egg",
                            "Sun": "Chicken Mandi + Salsa + Yogurt + Pickle",
                        },
                        "Dinner (5:00 PM - 7:00 PM)": {
                            "Mon": "Chapati + Chicken Kadai + Salad",
                            "Tue": "Chicken Kabsa + Salad",
                            "Wed": "Wheat Porotta + Chicken Masala + Salad",
                            "Thu": "Chapati + Sausage Roast + Salad",
                            "Fri": "Porotta + Chicken Chilli",
                            "Sat": "Ghee Rice + Beef Curry + Pickle + Salad",
                            "Sun": "Porotta + Chicken Rogan Josh + Salad",
                        },
                    },
                    "Vegetarian": {
                        "Breakfast (6:00 AM - 8:00 AM)": {
                            "Mon": "Chapati + Veg Stew",
                            "Tue": "Porotta + Subzi",
                            "Wed": "Chapati + Potato Bhaji",
                            "Thu": "Semiya Upma + Soya Chunks Curry",
                            "Fri": "Allo Paratha + Curd + Pickle",
                            "Sat": "Chapati + Aloo Gobi",
                            "Sun": "Rava Idli + Sambar + Chutney",
                        },
                        "Tiffin Lunch (6:00 AM - 8:00 AM)": {
                            "Mon": "Garlic Rice + Soya Chunks Roast + Dry Moong Dal Curry",
                            "Tue": "Veg Fried Rice + Chilli Gobi + Chilli Vinegar",
                            "Wed": "White Rice + Rajma Masala + Dry Subzi",
                            "Thu": "Lemon Herb Rice + Aloo Methi Fry + Tomato Salsa",
                            "Fri": "Veg Biryani + Pickle + Crunch Pack",
                            "Sat": "Tomato Rice + Mushroom Masala + Chutney Powder",
                            "Sun": "Veg Schezwan Rice + Chilli Potato + Soy Sauce",
                        },
                        "Lunch (11:00 AM - 1:00 PM)": {
                            "Mon": "Ghee Rice + Aloo Karela Sabzi + Moong Dal + Cumin Yogurt + Pickle",
                            "Tue": "1 Chapati + Bark Rice/Motta Rice + Aloo Baingan + Upper + Side Curry + Pickle + Veg Fry + Crunch Pack + Chutney Powder",
                            "Wed": "1 Chapati + Bark Rice/Motta Rice + Veg Curry + Side Curry + Veg Fry + Upper + Pickle + Crunch Pack",
                            "Thu": "1 Chapati + Bark Rice/Motta Rice + Bhindi Masala + Veg Fry + Dal + Pickle + Crunch Pack + Chutney Powder + Side Curry",
                            "Fri": "Gobi 65 Biryani + Vinegar Salad + Pickle + Crunch Pack + Sweet",
                            "Sat": "1 Chapati + Bark Rice/Motta Rice + Aloo Baingan + Pickle + Veg Fry + Upper + Crunch Pack + Chutney Powder",
                            "Sun": "Mushroom Biryani + Raita + Pickle",
                        },
                        "Dinner (5:00 PM - 7:00 PM)": {
                            "Mon": "Chapati + Paneer Butter Masala + Salad",
                            "Tue": "Veg Kabsa + Salsa + Salad",
                            "Wed": "Wheat Porotta + Veg Curry + Salad",
                            "Thu": "Chapati + Subzi + Salad",
                            "Fri": "Porotta + Veg Jalfrezi + Gobi Fry + Salad",
                            "Sat": "Ghee Rice + Mushroom Tikka Masala + Dal Fry + Pickle + Salad",
                            "Sun": "Porotta + Subzi + Salad",
                        },
                    },
                },
            }
        }

        # DELUXE category mappings - Use the NEW categories that the frontend is actually using
        deluxe_categories = {
            "Vegetarian": "01f61145-0c7b-4914-bdba-24e8181408f2",  # New Deluxe Vegetarian (slug: deluxe-vegetarian-new)
            "Flexitarian": "152b6cbc-28c4-448f-8d13-abfb8aef806d",  # New Deluxe Flexitarian (slug: deluxe-flexitarian-new)
            "Non-Vegetarian": "765d5e81-23bc-4e2a-845c-71b0b6802809",  # New Deluxe Non Vegetarian (slug: deluxe-nonvegetarian-new)
        }

        self.stdout.write(f"Using NEW DELUXE categories (that frontend uses): {deluxe_categories}")

        # Pricing category mappings (maps our categories to pricing keys)
        pricing_mappings = {"Vegetarian": "Non-Vegetarian/Vegetarian", "Flexitarian": "Flexitarian", "Non-Vegetarian": "Non-Vegetarian/Vegetarian"}  # Vegetarian uses the same pricing as Non-Vegetarian/Vegetarian

        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No changes will be made"))
            self.stdout.write("=" * 50)
            self.stdout.write(f"Processing {len(deluxe_categories)} DELUXE categories: {list(deluxe_categories.keys())}")
            self.stdout.write(f"Pricing mappings: {pricing_mappings}")
            self.stdout.write("=" * 50)

            # Step 1: Update SubscriptionSubPlan prices
            self.update_subscription_prices(new_menu, deluxe_categories, pricing_mappings, dry_run)

            # Step 2: Create/Update ItemMaster entries
            self.create_update_items(new_menu, deluxe_categories, dry_run)

            # Step 3: Update MealPlan entries
            self.update_meal_plans(new_menu, deluxe_categories, dry_run)

            self.stdout.write(self.style.WARNING("Dry run completed. Use without --dry-run to apply changes."))
        else:
            try:
                with transaction.atomic():
                    # Step 1: Update SubscriptionSubPlan prices
                    self.update_subscription_prices(new_menu, deluxe_categories, pricing_mappings, dry_run)

                    # Step 2: Create/Update ItemMaster entries
                    self.create_update_items(new_menu, deluxe_categories, dry_run)

                    # Step 3: Update MealPlan entries
                    self.update_meal_plans(new_menu, deluxe_categories, dry_run)

                self.stdout.write(self.style.SUCCESS("DELUXE menu updated successfully!"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error updating DELUXE menu: {str(e)}"))
                raise

    def update_subscription_prices(self, new_menu, deluxe_categories, pricing_mappings, dry_run):
        """Update SubscriptionSubPlan prices based on new pricing structure"""
        self.stdout.write("Updating SubscriptionSubPlan prices...")

        prices = new_menu["menu"]["prices_in_AED"]

        for category_name, category_uuid in deluxe_categories.items():
            try:
                meal_category = MealCategory.objects.get(pk=category_uuid)
                self.stdout.write(f"  Processing {meal_category.name}...")

                # Get the pricing key for this category
                pricing_key = pricing_mappings.get(category_name)
                if not pricing_key or pricing_key not in prices:
                    self.stdout.write(self.style.WARNING(f"    No pricing found for {category_name} (mapped to {pricing_key})"))
                    continue

                # Get all subscription subplans for this category
                subplans = SubscriptionSubPlan.objects.filter(plan__meal_category=meal_category)

                for subplan in subplans:
                    # Map meal types to pricing keys
                    meal_types = subplan.available_mealtypes
                    price_key = self.get_price_key(meal_types, category_name)

                    if price_key and price_key in prices[pricing_key]:
                        new_price = prices[pricing_key][price_key]
                        old_price = subplan.plan_price

                        if old_price != new_price:
                            self.stdout.write(f"    {subplan}: {old_price} → {new_price} AED")
                            if not dry_run:
                                try:
                                    subplan.plan_price = new_price
                                    subplan.save()
                                except Exception as e:
                                    self.stdout.write(self.style.ERROR(f"    Error updating {subplan}: {str(e)}"))
                        else:
                            self.stdout.write(f"    {subplan}: {old_price} AED (no change)")
                    else:
                        self.stdout.write(self.style.WARNING(f"    No price found for {subplan} (price_key: {price_key})"))

            except MealCategory.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"  MealCategory {category_uuid} not found"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  Error processing {category_name}: {str(e)}"))

    def get_price_key(self, meal_types, category_name):
        """Map meal types to pricing key"""
        if not meal_types:
            return None

        # Convert to list if it's not already
        if isinstance(meal_types, str):
            meal_types = [meal_types]

        # Map meal type choices to pricing keys
        meal_type_mapping = {"BREAKFAST": "Breakfast", "TIFFIN_LUNCH": "Tiffin Lunch", "LUNCH": "Lunch", "DINNER": "Dinner"}

        # Convert meal types to readable names
        readable_types = []
        for meal_type in meal_types:
            if meal_type in meal_type_mapping:
                readable_types.append(meal_type_mapping[meal_type])

        if not readable_types:
            return None

        # Create price key based on combination
        if len(readable_types) == 1:
            return readable_types[0]
        elif len(readable_types) == 2:
            return f"{readable_types[0]} & {readable_types[1]}"
        elif len(readable_types) == 3:
            return f"{readable_types[0]} & {readable_types[1]} & {readable_types[2]}"

        return None

    def create_update_items(self, new_menu, deluxe_categories, dry_run):
        """Create or update ItemMaster entries for new menu items"""
        self.stdout.write("Creating/Updating ItemMaster entries...")

        # Get or create default item category
        try:
            default_category = ItemCategory.objects.first()
            if not default_category:
                if not dry_run:
                    default_category = ItemCategory.objects.create(name="DELUXE Menu Items")
                else:
                    self.stdout.write("    Would create default ItemCategory")
        except:
            default_category = None

        schedule = new_menu["menu"]["schedule"]

        for category_name, category_uuid in deluxe_categories.items():
            try:
                meal_category = MealCategory.objects.get(pk=category_uuid)
                self.stdout.write(f"  Processing items for {meal_category.name}...")

                if category_name in schedule:
                    category_schedule = schedule[category_name]

                    for meal_slot, days in category_schedule.items():
                        # Extract meal type from meal slot name
                        meal_type = self.extract_meal_type(meal_slot)

                        for day, item_name in days.items():
                            # Split items if they contain "/"
                            items_to_create = self.split_menu_items(item_name)

                            for index, individual_item in enumerate(items_to_create):
                                # Create item code with index if multiple items
                                item_code = self.generate_item_code(category_name, meal_type, day, index, len(items_to_create))

                                # Check if item already exists
                                existing_item = ItemMaster.objects.filter(item_code=item_code, meal_category=meal_category).first()

                                if existing_item:
                                    if existing_item.name != individual_item:
                                        self.stdout.write(f"    Updating {item_code}: {existing_item.name} → {individual_item}")
                                        if not dry_run:
                                            try:
                                                existing_item.name = individual_item
                                                existing_item.save()
                                            except Exception as e:
                                                self.stdout.write(self.style.ERROR(f"    Error updating {item_code}: {str(e)}"))
                                    else:
                                        self.stdout.write(f"    {item_code}: {individual_item} (no change)")
                                else:
                                    self.stdout.write(f"    Creating {item_code}: {individual_item}")
                                    if not dry_run:
                                        try:
                                            ItemMaster.objects.create(
                                                name=individual_item,
                                                category=default_category,
                                                item_code=item_code,
                                                mealtype=meal_type,
                                                meal_category=meal_category,
                                                price=0.00,  # Price is set in SubscriptionSubPlan
                                                is_veg=self.is_vegetarian(individual_item, category_name),
                                            )
                                        except Exception as e:
                                            self.stdout.write(self.style.ERROR(f"    Error creating {item_code}: {str(e)}"))
                                    else:
                                        self.stdout.write(f"    Would create {item_code}: {individual_item}")

            except MealCategory.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"  MealCategory {category_uuid} not found"))

    def extract_meal_type(self, meal_slot):
        """Extract meal type from meal slot name"""
        if "Breakfast" in meal_slot and "Early" not in meal_slot:
            return "BREAKFAST"
        elif "Early" in meal_slot and "Breakfast" in meal_slot:
            return "BREAKFAST"
        elif "Tiffin" in meal_slot:
            return "TIFFIN_LUNCH"
        elif "Lunch" in meal_slot and "Tiffin" not in meal_slot:
            return "LUNCH"
        elif "Dinner" in meal_slot:
            return "DINNER"
        return "BREAKFAST"  # Default

    def split_menu_items(self, item_name):
        """Split menu items that contain '/' into separate items"""
        if "/" in item_name:
            # Special handling for "Bark Rice / Motta Rice" pattern
            if "Bark Rice" in item_name and "Motta Rice" in item_name:
                # The format is: "Bark Rice/Motta Rice + [other items]"
                # We need to extract the common suffix after the rice options

                # Find the position of the rice options
                rice_pattern = "Bark Rice/Motta Rice"
                rice_index = item_name.find(rice_pattern)

                if rice_index >= 0:
                    # Extract everything before the rice pattern
                    before_rice = item_name[:rice_index].strip()

                    # Extract everything after the rice pattern
                    after_rice = item_name[rice_index + len(rice_pattern) :].strip()

                    # Remove the leading "+" if present
                    if after_rice.startswith("+"):
                        after_rice = after_rice[1:].strip()

                    # Create the two options and clean up extra spaces and plus signs
                    option1 = f"{before_rice} + Bark Rice + {after_rice}".strip(" +")
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
        category_prefix = {"Vegetarian": "DV27", "Flexitarian": "DF27", "Non-Vegetarian": "DNV27"}.get(category_name, "DX27")  # Updated year suffix for new categories

        meal_prefix = {"BREAKFAST": "BF", "TIFFIN_LUNCH": "TL", "LUNCH": "L", "DINNER": "D"}.get(meal_type, "BF")

        day_num = {"Mon": "001", "Tue": "002", "Wed": "003", "Thu": "004", "Fri": "005", "Sat": "006", "Sun": "007"}.get(day, "001")

        # Add suffix if multiple items for the same day/meal
        if total_items > 1:
            suffix = chr(65 + index)  # A, B, C, etc.
            return f"{category_prefix} {meal_prefix}{day_num}{suffix}"
        else:
            return f"{category_prefix} {meal_prefix}{day_num}"

    def is_vegetarian(self, item_name, category_name):
        """Determine if item is vegetarian based on name and category"""
        if category_name == "Vegetarian":
            return True
        elif category_name == "Non-Vegetarian":
            return False
        else:  # Flexitarian
            # Check for non-veg ingredients in name
            non_veg_keywords = ["chicken", "beef", "fish", "egg", "sausage", "meat"]
            return not any(keyword in item_name.lower() for keyword in non_veg_keywords)

    def update_meal_plans(self, new_menu, deluxe_categories, dry_run):
        """Update MealPlan entries with new menu items"""
        self.stdout.write("Updating MealPlan entries...")

        schedule = new_menu["menu"]["schedule"]

        for category_name, category_uuid in deluxe_categories.items():
            try:
                meal_category = MealCategory.objects.get(pk=category_uuid)
                self.stdout.write(f"  Processing meal plans for {meal_category.name}...")

                if category_name in schedule:
                    category_schedule = schedule[category_name]

                    for meal_slot, days in category_schedule.items():
                        meal_type = self.extract_meal_type(meal_slot)

                        for day, item_name in days.items():
                            # Split items if they contain "/"
                            items_to_create = self.split_menu_items(item_name)

                            # Clear existing meal plans for this day/meal type first
                            if not dry_run:
                                try:
                                    deleted_count = MealPlan.objects.filter(meal_category=meal_category, day=day, menu_item__mealtype=meal_type).delete()[0]
                                    if deleted_count > 0:
                                        self.stdout.write(f"    Deleted {deleted_count} existing meal plans for {day} {meal_type}")
                                except Exception as e:
                                    self.stdout.write(self.style.ERROR(f"    Error deleting existing meal plans: {str(e)}"))
                                    continue

                            # Create meal plans for each item
                            for index, individual_item in enumerate(items_to_create):
                                item_code = self.generate_item_code(category_name, meal_type, day, index, len(items_to_create))

                                try:
                                    item = ItemMaster.objects.get(item_code=item_code, meal_category=meal_category)

                                    # Create new MealPlan
                                    if not dry_run:
                                        try:
                                            MealPlan.objects.create(meal_category=meal_category, day=day, menu_item=item, is_fallback=False)
                                            self.stdout.write(f"    Created meal plan: {day} {meal_type} → {individual_item}")
                                        except Exception as e:
                                            self.stdout.write(self.style.ERROR(f"    Error creating meal plan for {individual_item}: {str(e)}"))
                                    else:
                                        self.stdout.write(f"    Would create meal plan: {day} {meal_type} → {individual_item}")

                                except ItemMaster.DoesNotExist:
                                    self.stdout.write(self.style.ERROR(f"    ItemMaster {item_code} not found for {day} {meal_type}"))
                                except Exception as e:
                                    self.stdout.write(self.style.ERROR(f"    Error processing {individual_item}: {str(e)}"))

            except MealCategory.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"  MealCategory {category_uuid} not found"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  Error processing category {category_name}: {str(e)}"))
