from django.urls import path

from . import views


app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("about/", views.about, name="about"),
    path("updates/", views.updates, name="updates"),
    path("update/<str:slug>/", views.update, name="update"),
    path("careers/", views.careers, name="careers"),
    path("projects/", views.projects, name="projects"),
    path("our-story/", views.story, name="story"),
    path("services/", views.services, name="services"),
    path("contact/", views.contact, name="contact"),
    path("appointment/", views.appointment, name="appointment"),
]
