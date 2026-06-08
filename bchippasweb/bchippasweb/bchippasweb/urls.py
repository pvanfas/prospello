from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = (
    [
        path("admin/", admin.site.urls),
        path("", include(("web.urls"), namespace="web")),
        path(
            "sitemap.xml",
            TemplateView.as_view(template_name="sitemap.xml", content_type="application/xml"),
            name="sitemap",
        ),
        path("robots.txt", TemplateView.as_view(template_name="robots.txt", content_type="text/plain"), name="robots"),
    ]
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
)

admin.site.site_header = "Bchippas administration"
admin.site.site_title = "Bchippas admin"
admin.site.index_title = "Welcome to the dashboard"
