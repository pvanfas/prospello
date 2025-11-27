#!/usr/bin/env python3
"""
Script to assign images and brochures to meal categories based on group and menu type
"""

import json


def get_brochure_for_category(group):
    """Get the appropriate brochure path for a category based on group"""

    # Map groups to brochure files
    brochure_mapping = {
        "REGULAR": "mealcategories/brochure/regular_alot_menu.pdf",
        "STANDARD": "mealcategories/brochure/standard_alot_menu.pdf",
        "DELUXE": "mealcategories/brochure/deluxe_alot_menu.pdf",
        "ESSENTIAL": "mealcategories/brochure/essential_alot_menu.pdf",
        "SAVER": "mealcategories/brochure/regular_alot_menu.pdf",  # Use regular brochure for saver
        "CLASSIC": "mealcategories/brochure/standard_alot_menu.pdf",  # Use standard brochure for classic
        "PRIME": "mealcategories/brochure/deluxe_alot_menu.pdf",  # Use deluxe brochure for prime
        "PREMIUM": "mealcategories/brochure/standard_alot_menu.pdf",  # Use standard brochure for premium
    }

    return brochure_mapping.get(group, "mealcategories/brochure/standard_alot_menu.pdf")


def get_image_for_category(group, menu_type):
    """Get the appropriate image path for a category based on group and menu type"""

    # Map menu types to image naming patterns
    menu_type_mapping = {"flexitarian": "Flexitarian", "non_vegetarian": "Non-Vegetarian", "vegetarian": "Vegetarian", "pro_flexitarian": "pro-flexitarian"}

    # Map groups to image naming patterns
    group_mapping = {
        "REGULAR": "Regular",
        "STANDARD": "Standard",
        "DELUXE": "Deluxe",
        "ESSENTIAL": "essential",
        "SAVER": "regular",  # Use regular images for saver
        "CLASSIC": "Standard",  # Use standard images for classic
        "PRIME": "Deluxe",  # Use deluxe images for prime
        "PREMIUM": "Standard",  # Use standard images for premium
    }

    group_name = group_mapping.get(group, "Standard")
    menu_name = menu_type_mapping.get(menu_type, "Vegetarian")

    # Special cases for essential group
    if group == "ESSENTIAL":
        if menu_type == "pro_flexitarian":
            return "mealcategories/image/essential_pro-flexitarian_yqwvJxf.png"
        elif menu_type == "flexitarian":
            return "mealcategories/image/essential_flexitarian_C4BCPBL.png"
        elif menu_type == "vegetarian":
            return "mealcategories/image/essential_vegetarian_uJC1NWI.png"

    # Special cases for prime group (pro_flexitarian)
    if group == "PRIME" and menu_type == "pro_flexitarian":
        return "mealcategories/image/essential_pro-flexitarian_yqwvJxf.png"

    # Special cases for saver group (use regular images)
    if group == "SAVER":
        if menu_type == "flexitarian":
            return "mealcategories/image/regular_flexitarian.png"
        elif menu_type == "non_vegetarian":
            return "mealcategories/image/Regular-Non-Vegetarian.png"
        elif menu_type == "vegetarian":
            return "mealcategories/image/Regular-Vegetarian.png"

    # Default pattern for other groups
    if group_name == "essential":
        return f"mealcategories/image/{group_name}_{menu_type}.png"
    else:
        return f"mealcategories/image/{group_name}-{menu_name}.png"


def main():
    # Load the data
    with open("fixtures/2025_07_20_05_20_PM.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # Get all meal categories
    categories = [entry for entry in data if entry["model"] == "main.mealcategory"]

    print(f"Found {len(categories)} meal categories to update")

    # Assign images to each category
    for category in categories:
        group = category["fields"]["group"]
        name = category["fields"]["name"]

        # Extract menu type from name
        menu_type = "vegetarian"  # default
        if "flexitarian" in name.lower():
            if "pro" in name.lower():
                menu_type = "pro_flexitarian"
            else:
                menu_type = "flexitarian"
        elif "non" in name.lower() or "non-vegetarian" in name.lower():
            menu_type = "non_vegetarian"
        elif "vegetarian" in name.lower():
            menu_type = "vegetarian"

        # Get appropriate image and brochure
        image_path = get_image_for_category(group, menu_type)
        brochure_path = get_brochure_for_category(group)

        category["fields"]["image"] = image_path
        category["fields"]["brochure"] = brochure_path

        print(f"Assigned {image_path} and {brochure_path} to {group} - {name}")

    # Save the updated data
    with open("fixtures/2025_07_20_05_20_PM.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    print("Updated meal category images and brochures!")


if __name__ == "__main__":
    main()
