import os
from uuid import uuid4

from web.models import Product


def run():
    model = Product

    items = model.objects.all()
    for item in items:
        old_path = item.image.path
        new_filename = f"{uuid4()}{os.path.splitext(old_path)[1]}"
        new_path = os.path.join(os.path.dirname(old_path), new_filename)

        os.rename(old_path, new_path)

        item.image.name = os.path.relpath(new_path, os.path.dirname(old_path))
        item.save()
        print(f"Renamed {old_path} to {new_path}")
