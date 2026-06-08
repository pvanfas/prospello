from django.urls import path
from django.views.generic import TemplateView
from . import views

app_name = "web"

urlpatterns = [
    path("", views.index, name="index"),
    path("contact/", views.contact, name="contact"),
    path("index.html", TemplateView.as_view(template_name="web/index.html")),
    # Pages
    path("about-me-light.html", TemplateView.as_view(template_name="web/about-me-light.html")),
    path("about-us-light.html", TemplateView.as_view(template_name="web/about-us-light.html")),
    path("blog-details-light.html", TemplateView.as_view(template_name="web/blog-details-light.html")),
    path("blog-light.html", TemplateView.as_view(template_name="web/blog-light.html")),
    path("portfolio-details-light.html", TemplateView.as_view(template_name="web/portfolio-details-light.html")),
    path("portfolio-interactive-with-hover.html", TemplateView.as_view(template_name="web/portfolio-interactive-with-hover.html")),
    path("portfolio-interactive-with-scrool.html", TemplateView.as_view(template_name="web/portfolio-interactive-with-scrool.html")),
    path("portfolio-light.html", TemplateView.as_view(template_name="web/portfolio-light.html")),
    path("portfolio-mix-slicer.html", TemplateView.as_view(template_name="web/portfolio-mix-slicer.html")),
    path("portfolio-revealing-slider.html", TemplateView.as_view(template_name="web/portfolio-revealing-slider.html")),
    path("service-light.html", TemplateView.as_view(template_name="web/service-light.html")),
]