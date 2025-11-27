from django.conf import settings
from django.contrib.sites.models import Site


def main_context(request):
    if not Site.objects.filter(pk=settings.SITE_ID).exists():
        Site(
            pk=settings.SITE_ID, domain=request.META["HTTP_HOST"], name="Skydays"
        ).save()
    if not request.session.session_key:
        request.session.save()
    return {
        "domain": request.META["HTTP_HOST"],
        "site_name": "Skydays",
        "footer_text": "Copyright Skydays. All rights reserved.",
        "currencies": settings.CURRENCIES,
        "currency": request.session.get("currency", "INR"),
        "PAYPAL_CLIENT_ID": settings.PAYPAL_CLIENT_ID,
    }
