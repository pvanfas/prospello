"""Project level URL configuration."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = (
    [
        path("admin/doc/", include("django.contrib.admindocs.urls")),
        path("admin/", admin.site.urls),
        path("", include(("web.urls", "web"), namespace="web")),
        path("sitemap.xml", TemplateView.as_view(template_name="sitemap.xml", content_type="application/xml")),
        path("robots.txt",TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
    ]
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
)

admin.site.site_header = "Prospello administration"
admin.site.site_title = "Prospello admin"
admin.site.index_title = "Welcome to the dashboard"
