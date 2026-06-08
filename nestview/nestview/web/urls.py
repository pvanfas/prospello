from django.urls import path

from . import views


app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("about/", views.about, name="about"),
    path("blogs/", views.blogs, name="blogs"),
    path("contact/", views.contact, name="contact"),
    path("faq/", views.faq, name="faq"),
    path("properties/", views.properties, name="properties"),
    path("realtors/", views.realtors, name="realtors"),
    path("blog/<str:slug>/", views.blog_details, name="blog_details"),
    path("property/<str:id>/", views.property_details, name="property_details"),
]
