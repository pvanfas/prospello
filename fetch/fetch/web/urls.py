from django.urls import path

from . import views


app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("about/", views.about, name="about"),
    path("products/", views.products, name="products"),
    path("product/<str:slug>/", views.product_single, name="product_single"),
    path("career/<str:slug>/", views.career_single, name="career_single"),
    path("news/<str:slug>/", views.news_single, name="news_single"),
    path("updates/", views.updates, name="updates"),
    path("careers/", views.careers, name="careers"),
    path("contact/", views.contact, name="contact"),
    path("brochure/", views.brochure, name="brochure"),
    path("privacy_policy/", views.privacy_policy, name="privacy_policy"),
]
