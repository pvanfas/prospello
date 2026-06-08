from django.conf import settings

from products.models import Cart

from .models import Category, Emotion, GeneralSetting, Occasion, Recipient


def main_context(request):
    session_id = request.session.session_key
    cart_items = Cart.objects.filter(session_id=session_id)
    cart_total = float(sum(item.subtotal() for item in cart_items))

    if GeneralSetting.objects.all().count() == 0:
        GeneralSetting.objects.create()

    return {
        "site_name": "Alot Hampers",
        "site_description": "Alot Hampers is a company that sells hampers for different occasions.",
        "categories": Category.objects.filter(is_active=True, is_addon=False),
        "nav_categories": Category.objects.filter(is_active=True, show_in_nav=True, is_addon=False),
        "occasions": Occasion.objects.filter(is_active=True),
        "recipients": Recipient.objects.filter(is_active=True),
        "emotions": Emotion.objects.filter(is_active=True),
        "app_settings": settings.APP_SETTINGS,
        "version": "?v=1.1",
        "cart_items": cart_items,
        "cart_total": cart_total,
        "settings": GeneralSetting.objects.first(),
    }
