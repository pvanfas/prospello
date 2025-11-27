from decimal import Decimal

from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.views import View
from django.views.generic import FormView, ListView
from django.views.generic.base import TemplateView
from django.views.generic.detail import DetailView
from registration.views import RegistrationView as DRDRegistrationView
from .utils import send_mailnote
from products.forms import CustomOrderForm, OrderForm
from products.models import Cart, Order, OrderItem

from .forms import RegistrationForm
from .models import Category, Collection, Emotion, Occasion, Offer, Product, Recipient, Section, Slider, Testimonial


def test(request):
    order = Order.objects.first()
    send_mailnote(order)
    return render(request, "web/test.html")


class RegistrationView(DRDRegistrationView):
    form_class = RegistrationForm


class HomeView(View):
    def get(self, request):
        context = {
            "sliders": Slider.objects.filter(is_active=True),
            "trending_products": Product.objects.filter(is_active=True, product_type="MAIN", is_trending=True),
            "testimonials": Testimonial.objects.filter(is_active=True),
            "collections": Collection.objects.filter(is_active=True),
            "sections": Section.objects.filter(is_active=True),
            "offers": Offer.objects.filter(
                is_active=True,
                offer_start__lte=timezone.now(),
                offer_end__gte=timezone.now(),
            ),
        }
        return render(request, "web/index.html", context)


class CustomizeView(FormView):
    form_class = CustomOrderForm
    template_name = "web/customize.html"
    success_url = reverse_lazy("web:thankyou")


class RecipientListView(ListView):
    model = Product
    template_name = "web/recipient_products.html"
    context_object_name = "products"

    def get_object(self):
        return Recipient.objects.get(is_active=True, slug=self.kwargs["slug"])

    def get_queryset(self):
        recipient = self.get_object()
        qs = Product.objects.filter(is_active=True, product_type="MAIN", recipient__in=[recipient])
        sort_value = self.request.GET.get("sort")
        SORT_OPTIONS = {"price_asc": "sale_price", "price_desc": "-sale_price", "created_asc": "created", "created_desc": "-created"}
        if sort_value in SORT_OPTIONS:
            return qs.order_by(SORT_OPTIONS[sort_value])
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = self.get_object().name
        context["recipient"] = self.get_object()
        return context


class CategoryListView(ListView):
    model = Product
    template_name = "web/category_products.html"
    context_object_name = "products"

    def get_object(self):
        return Category.objects.get(is_active=True, slug=self.kwargs["slug"], is_addon=False)

    def get_queryset(self):
        category = self.get_object()
        qs = Product.objects.filter(is_active=True, product_type="MAIN", category=category)
        sort_value = self.request.GET.get("sort")
        SORT_OPTIONS = {"price_asc": "sale_price", "price_desc": "-sale_price", "created_asc": "created", "created_desc": "-created"}
        if sort_value in SORT_OPTIONS:
            return qs.order_by(SORT_OPTIONS[sort_value])
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = self.get_object().name
        context["category"] = self.get_object()
        return context


class OccasionListView(ListView):
    model = Product
    template_name = "web/occasion_products.html"
    context_object_name = "products"

    def get_object(self):
        return Occasion.objects.get(is_active=True, slug=self.kwargs["slug"])

    def get_queryset(self):
        occasion = self.get_object()
        qs = Product.objects.filter(is_active=True, product_type="MAIN", occasion__in=[occasion])
        sort_value = self.request.GET.get("sort")
        SORT_OPTIONS = {"price_asc": "sale_price", "price_desc": "-sale_price", "created_asc": "created", "created_desc": "-created"}
        if sort_value in SORT_OPTIONS:
            return qs.order_by(SORT_OPTIONS[sort_value])
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = self.get_object().name
        context["occasion"] = self.get_object()
        return context


class EmotionListView(ListView):
    model = Product
    template_name = "web/emotion_products.html"
    context_object_name = "products"

    def get_object(self):
        return Emotion.objects.get(is_active=True, slug=self.kwargs["slug"])

    def get_queryset(self):
        emotion = self.get_object()
        qs = Product.objects.filter(is_active=True, product_type="MAIN", emotion__in=[emotion])
        sort_value = self.request.GET.get("sort")
        SORT_OPTIONS = {"price_asc": "sale_price", "price_desc": "-sale_price", "created_asc": "created", "created_desc": "-created"}
        if sort_value in SORT_OPTIONS:
            return qs.order_by(SORT_OPTIONS[sort_value])
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = self.get_object().name
        context["emotion"] = self.get_object()
        return context


class CollectionListView(ListView):
    model = Collection
    template_name = "web/collection_products.html"
    context_object_name = "products"

    def get_object(self):
        return Collection.objects.get(is_active=True, slug=self.kwargs["slug"])

    def get_queryset(self):
        collection = self.get_object()
        qs = collection.products.filter(is_active=True)
        sort_value = self.request.GET.get("sort")
        SORT_OPTIONS = {"price_asc": "sale_price", "price_desc": "-sale_price", "created_asc": "created", "created_desc": "-created"}
        if sort_value in SORT_OPTIONS:
            return qs.order_by(SORT_OPTIONS[sort_value])
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = self.get_object().name
        context["collection"] = self.get_object()
        return context


class ProductListView(ListView):
    model = Product
    template_name = "web/product_list.html"
    context_object_name = "products"

    def get_queryset(self):
        query = self.request.GET.get("q")
        if query:
            qs = Product.objects.filter(product_type="MAIN", is_active=True).filter(Q(name__icontains=query) | Q(description__icontains=query))
            return qs
        return Product.objects.filter(product_type="MAIN", is_active=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = _("All Products")
        return context


class ProductDetailView(DetailView):
    model = Product
    template_name = "web/product_details.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        related_products = Product.objects.filter(product_type="MAIN", category=self.object.category).exclude(id=self.object.id)
        context["related_products"] = related_products
        context["greeting_cards"] = Product.objects.filter(product_type="CARD")
        context["wrappers"] = Product.objects.filter(product_type="WRAP")
        context["addons"] = Product.objects.filter(product_type="ADDON")
        return context


class AboutUsView(View):
    def get(self, request):
        return render(request, "web/about_us.html")


class CartView(View):
    template_name = "web/cart.html"

    def get(self, request):
        session_id = request.session.session_key
        cart_items = Cart.objects.filter(session_id=session_id)
        context = {}
        context["cart_items"] = cart_items
        return render(request, self.template_name, context)


class AddToCartView(View):
    def get(self, request):
        session_id = request.session.session_key
        quantity = request.GET.get("quantity", 1)
        product_id = request.GET.get("product_id")

        if not product_id:
            return JsonResponse({"message": "Product not found"}, status=404)

        product = get_object_or_404(Product, pk=product_id)
        cart_item, created = Cart.objects.get_or_create(session_id=session_id, product=product, defaults=({"quantity": quantity}))

        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()

        cart_items = Cart.objects.filter(session_id=session_id)
        return JsonResponse(
            {
                "message": "Product Quantity Added from cart successfully",
                "quantity": cart_item.quantity,
                "total_price": cart_item.subtotal(),
                "cart_total": sum(item.subtotal() for item in cart_items),
                "cart_count": cart_items.count(),
                "cart_items": [
                    {
                        "id": item.id,
                        "name": item.product.name,
                        "product_link": item.product.get_absolute_url(),
                        "price": item.product.sale_price,
                        "quantity": item.quantity,
                        "image": item.product.image.url,
                        "subtotal": item.subtotal(),
                    }
                    for item in cart_items
                ],
            }
        )


class MinusCartView(View):
    def get(self, request):
        session_id = request.session.session_key
        try:
            cart_id = request.GET.get("cart_id")
            cart_item = Cart.objects.get(id=cart_id)
            if cart_item.quantity > 1:
                cart_item.quantity -= 1
                cart_item.save()
            else:
                cart_item.delete()
            cart_items = Cart.objects.filter(session_id=session_id)
            return JsonResponse(
                {
                    "message": "Product Quantity decreased from cart successfully",
                    "quantity": cart_item.quantity,
                    "total_price": cart_item.subtotal(),
                    "cart_total": sum(item.subtotal() for item in cart_items),
                }
            )
        except Cart.DoesNotExist:
            return JsonResponse({"message": "Product not found in cart"}, status=404)


class RemoveCartItemView(View):
    def get(self, request, cart_item_id, *args, **kwargs):
        session_id = request.session.session_key
        cart_item = get_object_or_404(Cart, id=cart_item_id, session_id=session_id)
        cart_item.delete()
        return redirect("web:cart")


class CheckoutView(FormView):
    form_class = OrderForm
    template_name = "web/checkout.html"

    def form_valid(self, form):
        session_id = self.request.session.session_key
        cart_items = Cart.objects.filter(session_id=session_id)
        cart_total = sum(item.subtotal() for item in cart_items)
        data = form.save(commit=False)
        data.session_id = session_id
        data.payable = cart_total
        data.completed_at = timezone.now()
        data.save()

        with transaction.atomic():
            for item in cart_items:
                order_item = OrderItem.objects.create(
                    order=data,
                    product_option=item.product,
                    quantity=item.quantity,
                    price=Decimal(item.subtotal()),
                )
                order_item.save()
                print("order saved")
            cart_items.delete()
        send_mailnote(data)
        return redirect("web:order_detail", order_id=data.order_id)

    def form_invalid(self, form):
        print(form.errors)
        response_data = {
            "status": "false",
            "title": "Form validation error",
            "message": "There was an error in the form submission. Please correct the errors.",
        }
        return JsonResponse(response_data, status=400)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        session_id = self.request.session.session_key
        cart_items = Cart.objects.filter(session_id=session_id)
        cart_total = sum(item.subtotal() for item in cart_items)
        context["cart_items"] = cart_items
        context["cart_total"] = round(cart_total, 2)
        return context


class MyAccountView(TemplateView):
    template_name = "web/my_account.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        session_id = self.request.session.session_key
        context["orders"] = Order.objects.filter(session_id=session_id)
        return context


class OrderDetailView(DetailView):
    model = Order
    template_name = "web/order_detail.html"

    def get_object(self):
        order_id = self.kwargs["order_id"]
        return Order.objects.get(order_id=order_id)


class DeliveryInformationView(View):
    def get(self, request):
        return render(request, "web/delivery_information.html")


class PrivacyPolicyView(View):
    def get(self, request):
        return render(request, "web/privacy_policy.html")


class TermsConditionsView(View):
    def get(self, request):
        return render(request, "web/terms_conditions.html")


class SupportView(View):
    def get(self, request):
        return render(request, "web/support.html")
