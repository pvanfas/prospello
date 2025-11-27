#!/usr/bin/env python
import os
import sys

import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "alotkitchen.settings")
django.setup()

from main.models import Group, ItemCategory, MealCategory


def get_uuids():
    print("=== ItemCategory UUIDs ===")
    categories = ItemCategory.objects.all()
    for cat in categories:
        print(f"Name: {cat.name} | UUID: {cat.id}")

    print("\n=== MealCategory UUIDs ===")
    meal_categories = MealCategory.objects.all()
    for cat in meal_categories:
        print(f"Name: {cat.name} | Group: {cat.group.name} | UUID: {cat.id}")

    print("\n=== Looking for 'Mess for Less' related categories ===")
    mess_categories = MealCategory.objects.filter(name__icontains="mess")
    for cat in mess_categories:
        print(f"Name: {cat.name} | Group: {cat.group.name} | UUID: {cat.id}")

    # Also check by group
    try:
        mess_group = Group.objects.get(name="Mess for Less")
        mess_group_categories = MealCategory.objects.filter(group=mess_group)
        for cat in mess_group_categories:
            print(f"Name: {cat.name} | Group: {cat.group.name} | UUID: {cat.id}")
    except Group.DoesNotExist:
        print("No 'Mess for Less' group found")


if __name__ == "__main__":
    get_uuids()
