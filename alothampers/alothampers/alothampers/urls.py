from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = (
    [
        path("admin/", admin.site.urls),
        path("accounts/", include("registration.backends.simple.urls")),
        path("", include("web.urls", namespace="web")),
        path("main/", include("main.urls", namespace="main")),
        path("tinymce/", include("tinymce.urls")),
        path("sitemap.xml", TemplateView.as_view(template_name="sitemap.xml", content_type="text/xml")),
        path("robots.txt", TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
    ]
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
) + [path("i18n/", include("django.conf.urls.i18n"))]

admin.site.site_header = "Alot Hampers Administration"
admin.site.site_title = "Alot Hampers Admin Portal"
admin.site.index_title = "Welcome to Alot Hampers Admin Portal"
