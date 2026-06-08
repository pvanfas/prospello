from django.urls import path

# templateview
from . import views


app_name = "web"

urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path("about/", views.AboutView.as_view(), name="about"),
    path("portfolio/", views.PortfolioListView.as_view(), name="portfolio"),
    path("portfolio/<slug:service_slug>/", views.ServiceDetailView.as_view(), name="service_detail"),
    path(
        "portfolio/<slug:service_slug>/<slug:portfolio_slug>/",
        views.PortfolioDetailView.as_view(),
        name="portfolio_detail",
    ),
    path("blog/", views.BlogListView.as_view(), name="blog"),
    path("blog/<slug:slug>/", views.BlogDetailView.as_view(), name="blog_detail"),
    path("contact/", views.ContactView.as_view(), name="contact"),
]
