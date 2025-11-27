from django.urls import path
from . import views

app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("about/", views.about, name="about"),
    path("services/", views.services, name="services"),
    path("stories/", views.stories, name="stories"),
    path("contact/", views.contact, name="contact"),
    path("story/<int:id>/", views.story, name="story"),
]