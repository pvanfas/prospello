from django.urls import path

from . import views

app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("learning/", views.learning, name="learning"),
    path("admissions/", views.admissions, name="admissions"),
    path("events/", views.events, name="events"),
    path("about/", views.about_us, name="about_us"),
    path("program/<str:slug>/", views.program_detail, name="program_detail"),
    # Form save views
    path("form/save_application/", views.save_application, name="save_application"),
    path("form/save_chat_request/", views.save_chat_request, name="save_chat_request"),
    path("form/save_phone_request/", views.save_phone_request, name="save_phone_request"),
    path("form/success/", views.success, name="success"),
    # Policies
    path("pricing-policy/", views.pricing_policy, name="pricing_policy"),
    path("shipping-policy/", views.shipping_policy, name="shipping_policy"),
    path("terms-and-conditions/", views.terms_and_conditions, name="terms_and_conditions"),
    path("privacy-policy/", views.privacy_policy, name="privacy_policy"),
    path("cancellation-refund-policy/", views.cancellation_refund_policy, name="cancellation_refund_policy"),
    path("payment-policy/", views.payment_policy, name="payment_policy"),
    # Sitemap
    path("sitemap/", views.sitemap, name="sitemap"),
    # Pages
    # path("page/bangalores-ultimate-ai-hackathon/", views.ai_hackathon, name="ai_hackathon"),
    # path("page/test/", views.test, name="test"),
    # path("zohoverify/verifyforzoho.html", lambda r: HttpResponse("57467200"), name="zoho_verify"),
]
