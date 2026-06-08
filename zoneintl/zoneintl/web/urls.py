from django.urls import path

from . import views


app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("about/", views.about, name="about"),
    path("courses/", views.courses, name="courses"),
    path("category/<str:pk>/", views.category_view, name="category_view"),
    path("universities/", views.universities, name="universities"),
    path("services/", views.services, name="services"),
    path("contact/", views.contact, name="contact"),
]
