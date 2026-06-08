from django.urls import path

from . import views

app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("about/", views.about_us, name="about_us"),
    path("about/story/", views.about_story, name="about_story"),
    path("careers/", views.careers, name="careers"),
    path("industries/", views.industries, name="industries"),
    path("platform/<str:slug>/", views.platform_detail, name="platform_detail"),
    path("spotlight/<str:slug>/", views.spotlight_detail, name="spotlight_detail"),
    path("industry/technologies/", views.technologies_industry, name="technologies_industry"),
    path("industry/media/", views.media_industry, name="media_industry"),
    path("industry/education/", views.education_industry, name="education_industry"),
    path("industry/society/", views.society_industry, name="society_industry"),
    path("contact/", views.contact, name="contact"),
]
