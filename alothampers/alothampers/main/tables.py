from products.models import CustomOrder, Order
from web.models import Category, Collection, Emotion, Material, Occasion, Offer, Product, Recipient, Section, Slider, Testimonial

from .base import BaseTable


class SliderTable(BaseTable):
    class Meta:
        model = Slider
        fields = ("title", "topline", "order")
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class CategoryTable(BaseTable):
    class Meta:
        model = Category
        fields = ("name", "slug", "show_in_nav")
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class RecipientTable(BaseTable):
    class Meta:
        model = Recipient
        fields = ("name", "slug", "image")
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class OccasionTable(BaseTable):
    class Meta:
        model = Occasion
        fields = ("name", "slug", "image")
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class EmotionTable(BaseTable):
    class Meta:
        model = Emotion
        fields = ("name", "slug", "image")
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class ProductTable(BaseTable):
    class Meta:
        model = Product
        fields = (
            "name",
            "sku",
            "category",
            "is_trending",
            "created",
            "sale_price",
        )
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class OfferTable(BaseTable):
    class Meta:
        model = Offer
        fields = (
            "product",
            "discount",
            "offer_start",
            "offer_end",
            "max_sales",
            "sold_count",
        )
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class TestimonialTable(BaseTable):
    class Meta:
        model = Testimonial
        fields = ("name", "position", "created")
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class CollectionTable(BaseTable):
    class Meta:
        model = Collection
        fields = ("name", "slug", "image")
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class SectionTable(BaseTable):
    class Meta:
        model = Section
        fields = ("title", "button_text", "button_link")
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class OrderTable(BaseTable):
    class Meta:
        model = Order
        fields = ("order_id", "user", "payable", "completed_at", "first_name", "status")
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class MaterialTable(BaseTable):
    class Meta:
        model = Material
        fields = ("name",)
        attrs = {"class": "table key-buttons border-bottom table-hover"}


class CustomOrderTable(BaseTable):
    class Meta:
        model = CustomOrder
        fields = ("first_name", "last_name", "city", "mobile")
        attrs = {"class": "table key-buttons border-bottom table-hover"}
