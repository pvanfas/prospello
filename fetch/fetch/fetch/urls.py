from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include
from django.urls import path
from django.views.generic import TemplateView
from web.sitemaps import CareerPostSitemap
from web.sitemaps import FeaturedProductSitemap
from web.sitemaps import NewsSitemap
from web.sitemaps import ProductSitemap
from web.sitemaps import StaticSitemap


sitemaps = {
    "static": StaticSitemap,
    "product": ProductSitemap,
    "featured_products": FeaturedProductSitemap,
    "career": CareerPostSitemap,
    "news": NewsSitemap,
}

urlpatterns = (
    [
        path("admin/", admin.site.urls),
        path("", include("web.urls", namespace="web")),
        path("tinymce/", include("tinymce.urls")),
        path("accounts/", include("registration.backends.default.urls")),
        path("sitemap.xml", TemplateView.as_view(template_name="static-sitemap.xml", content_type="text/xml")),
        # path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
        path("robots.txt", TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
    ]
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
)

admin.site.site_header = "Fetch Administration"
admin.site.site_title = "Fetch Admin Portal"
admin.site.index_title = "Welcome to Fetch Admin Portal"
