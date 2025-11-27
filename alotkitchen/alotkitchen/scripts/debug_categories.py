#!/usr/bin/env python3
"""
Debug script to find items without meal categories
"""

import json


def main():
    # Load the merged data
    with open("fixtures/2025_07_20_05_20_PM.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # Get all categories
    categories = [entry for entry in data if entry["model"] == "main.mealcategory"]
    category_map = {cat["fields"]["name"]: cat["pk"] for cat in categories}

    print("Available categories:")
    for name, pk in category_map.items():
        print(f"  {name}: {pk}")

    # Get items without categories
    items = [entry for entry in data if entry["model"] == "main.itemmaster"]
    items_without_categories = [item for item in items if not item["fields"]["meal_category"]]

    print(f"\nItems without categories ({len(items_without_categories)}):")
    for item in items_without_categories[:10]:  # Show first 10
        print(f"  {item['fields']['name']} - {item['fields']['item_code']}")

    # Check items with categories
    items_with_categories = [item for item in items if item["fields"]["meal_category"]]
    print(f"\nItems with categories ({len(items_with_categories)}):")
    for item in items_with_categories[:5]:  # Show first 5
        category_pk = item["fields"]["meal_category"]
        category_name = None
        for cat in categories:
            if cat["pk"] == category_pk:
                category_name = cat["fields"]["name"]
                break
        print(f"  {item['fields']['name']} -> {category_name}")


if __name__ == "__main__":
    main()
