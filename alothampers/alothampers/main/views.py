from django.shortcuts import render
from django.urls import reverse_lazy

from products.models import CustomOrder, Order
from web.models import Category, Collection, Emotion, Material, Occasion, Offer, Product, Recipient, Section, Slider, Testimonial

from .mixins import HybridCreateView, HybridDeleteView, HybridDetailView, HybridListView, HybridUpdateView, HybridView
from .tables import (CategoryTable, CollectionTable, CustomOrderTable, EmotionTable, MaterialTable, OccasionTable, OfferTable, OrderTable, ProductTable, RecipientTable,
                     SectionTable, SliderTable, TestimonialTable)


class HomeView(HybridView):
    def get(self, request, *args, **kwargs):
        template_name = "app/main/home.html"
        context = {
            "slider_count": Slider.objects.filter(is_active=True).count(),
            "category_count": Category.objects.filter(is_active=True).count(),
            "recipient_count": Recipient.objects.filter(is_active=True).count(),
            "occasion_count": Occasion.objects.filter(is_active=True).count(),
            "emotion_count": Emotion.objects.filter(is_active=True).count(),
            "product_count": Product.objects.filter(is_active=True, product_type="MAIN").count(),
            "offer_count": Offer.objects.filter(is_active=True).count(),
            "testimonial_count": Testimonial.objects.filter(is_active=True).count(),
            "collection_count": Collection.objects.filter(is_active=True).count(),
        }
        return render(request, template_name, context)


class SliderListView(HybridListView):
    model = Slider
    filterset_fields = ("title",)
    table_class = SliderTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Sliders"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:slider_create")
        return context


class SliderCreateView(HybridCreateView):
    model = Slider
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Slider"
        return context


class SliderDetailView(HybridDetailView):
    model = Slider


class SliderUpdateView(HybridUpdateView):
    model = Slider
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Slider"
        return context


class SliderDeleteView(HybridDeleteView):
    model = Slider
    success_url = reverse_lazy("main:slider_list")


class CategoryListView(HybridListView):
    model = Category
    filterset_fields = ("name",)
    table_class = CategoryTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Categories"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:category_create")
        return context


class CategoryCreateView(HybridCreateView):
    model = Category
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Category"
        return context


class CategoryDetailView(HybridDetailView):
    model = Category


class CategoryUpdateView(HybridUpdateView):
    model = Category
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Category"
        return context


class CategoryDeleteView(HybridDeleteView):
    model = Category
    success_url = reverse_lazy("main:category_list")


class RecipientListView(HybridListView):
    model = Recipient
    filterset_fields = ("name",)
    table_class = RecipientTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Recipients"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:recipient_create")
        return context


class RecipientCreateView(HybridCreateView):
    model = Recipient
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Recipient"
        return context


class RecipientDetailView(HybridDetailView):
    model = Recipient


class RecipientUpdateView(HybridUpdateView):
    model = Recipient
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Recipient"
        return context


class RecipientDeleteView(HybridDeleteView):
    model = Recipient
    success_url = reverse_lazy("main:recipient_list")


class OccasionListView(HybridListView):
    model = Occasion
    filterset_fields = ("name",)
    table_class = OccasionTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Occasions"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:occasion_create")
        return context


class OccasionCreateView(HybridCreateView):
    model = Occasion
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Occasion"
        return context


class OccasionDetailView(HybridDetailView):
    model = Occasion


class OccasionUpdateView(HybridUpdateView):
    model = Occasion
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Occasion"
        return context


class OccasionDeleteView(HybridDeleteView):
    model = Occasion
    success_url = reverse_lazy("main:occasion_list")


class EmotionListView(HybridListView):
    model = Emotion
    filterset_fields = ("name",)
    table_class = EmotionTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Emotions"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:emotion_create")
        return context


class EmotionCreateView(HybridCreateView):
    model = Emotion
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Emotion"
        return context


class EmotionDetailView(HybridDetailView):
    model = Emotion


class EmotionUpdateView(HybridUpdateView):
    model = Emotion
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Emotion"
        return context


class EmotionDeleteView(HybridDeleteView):
    model = Emotion
    success_url = reverse_lazy("main:emotion_list")


class ProductListView(HybridListView):
    model = Product
    filterset_fields = ("name",)
    table_class = ProductTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Products"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:product_create")
        return context


class ProductCreateView(HybridCreateView):
    model = Product
    exclude = ("created",)
    template_name = "app/main/product_form.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Product"
        return context


class ProductDetailView(HybridDetailView):
    model = Product


class ProductUpdateView(HybridUpdateView):
    model = Product
    exclude = ("created",)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Product"
        return context


class ProductDeleteView(HybridDeleteView):
    model = Product
    success_url = reverse_lazy("main:product_list")


class OfferListView(HybridListView):
    model = Offer
    filterset_fields = ("name",)
    table_class = OfferTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Offers"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:offer_create")
        return context


class OfferCreateView(HybridCreateView):
    model = Offer
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Offer"
        return context


class OfferDetailView(HybridDetailView):
    model = Offer


class OfferUpdateView(HybridUpdateView):
    model = Offer
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Offer"
        return context


class OfferDeleteView(HybridDeleteView):
    model = Offer
    success_url = reverse_lazy("main:offer_list")


class TestimonialListView(HybridListView):
    model = Testimonial
    filterset_fields = ("name",)
    table_class = TestimonialTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Testimonials"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:testimonial_create")
        return context


class TestimonialCreateView(HybridCreateView):
    model = Testimonial
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Testimonial"
        return context


class TestimonialDetailView(HybridDetailView):
    model = Testimonial


class TestimonialUpdateView(HybridUpdateView):
    model = Testimonial
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Testimonial"
        return context


class TestimonialDeleteView(HybridDeleteView):
    model = Testimonial
    success_url = reverse_lazy("main:testimonial_list")


class CollectionListView(HybridListView):
    model = Collection
    filterset_fields = ("title",)
    table_class = CollectionTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Collections"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:collection_create")
        return context


class CollectionCreateView(HybridCreateView):
    model = Collection
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Collection"
        return context


class CollectionDetailView(HybridDetailView):
    model = Collection


class CollectionUpdateView(HybridUpdateView):
    model = Collection
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Collection"
        return context


class CollectionDeleteView(HybridDeleteView):
    model = Collection
    success_url = reverse_lazy("main:collection_list")


class SectionListView(HybridListView):
    model = Section
    filterset_fields = ("title",)
    table_class = SectionTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Sections"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:section_create")
        return context


class SectionCreateView(HybridCreateView):
    model = Section
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Section"
        return context


class SectionDetailView(HybridDetailView):
    model = Section


class SectionUpdateView(HybridUpdateView):
    model = Section
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Section"
        return context


class SectionDeleteView(HybridDeleteView):
    model = Section
    success_url = reverse_lazy("main:section_list")


class OrderListView(HybridListView):
    model = Order
    filterset_fields = ("order_id", "first_name", "address_line_1", "city", "mobile")
    table_class = OrderTable

    def get_queryset(self):
        return Order.objects.all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Orders"
        context["can_add"] = False
        context["new_link"] = reverse_lazy("main:order_create")
        return context


class OrderCreateView(HybridCreateView):
    model = Order
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Order"
        return context


class OrderDetailView(HybridDetailView):
    model = Order


class OrderUpdateView(HybridUpdateView):
    model = Order
    fields = (
        "first_name",
        "last_name",
        "address_line_1",
        "address_line_2",
        "city",
        "mobile",
        "alternate_mobile",
        "email",
        "notes",
        "status",
    )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Order"
        return context


class OrderDeleteView(HybridDeleteView):
    model = Order
    success_url = reverse_lazy("main:order_list")


class MaterialListView(HybridListView):
    model = Material
    filterset_fields = ("name",)
    table_class = MaterialTable

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Materials"
        context["can_add"] = True
        context["new_link"] = reverse_lazy("main:material_create")
        return context


class MaterialCreateView(HybridCreateView):
    model = Material
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Material"
        return context


class MaterialDetailView(HybridDetailView):
    model = Material


class MaterialUpdateView(HybridUpdateView):
    model = Material
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Material"
        return context


class MaterialDeleteView(HybridDeleteView):
    model = Material
    success_url = reverse_lazy("main:material_list")


class CustomOrderListView(HybridListView):
    model = CustomOrder
    filterset_fields = ("first_name", "last_name", "city", "mobile")
    table_class = CustomOrderTable

    def get_queryset(self):
        return CustomOrder.objects.all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Custom Orders"
        context["can_add"] = False
        context["new_link"] = reverse_lazy("main:custom_order_create")
        return context


class CustomOrderCreateView(HybridCreateView):
    model = CustomOrder
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Add Custom Order"
        return context


class CustomOrderDetailView(HybridDetailView):
    model = CustomOrder


class CustomOrderUpdateView(HybridUpdateView):
    model = CustomOrder
    fields = "__all__"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Update Custom Order"
        return context


class CustomOrderDeleteView(HybridDeleteView):
    model = CustomOrder
    success_url = reverse_lazy("main:custom_order_list")
