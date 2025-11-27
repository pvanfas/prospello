from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from products.models import Product
from web.models import CareerPost
from web.models import News


class StaticSitemap(Sitemap):
    changefreq = "yearly"
    priority = 1
    protocol = "https"

    def items(self):
        return ["web:index", "web:about", "web:products", "web:updates", "web:careers", "web:contact"]

    def location(self, item):
        return reverse(item)


class FeaturedProductSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.80
    protocol = "https"

    def items(self):
        return Product.objects.filter(is_active=True, is_featured=True, category__is_active=True)

    def lastmod(self, obj):
        return obj.pub_date

    def location(self, obj):
        return "/product/%s" % (obj.slug)


class ProductSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.64
    protocol = "https"

    def items(self):
        return Product.objects.filter(is_active=True, is_featured=False, category__is_active=True)

    def lastmod(self, obj):
        return obj.pub_date

    def location(self, obj):
        return "/product/%s" % (obj.slug)


class CareerPostSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.64
    protocol = "https"

    def items(self):
        return CareerPost.objects.all()

    def lastmod(self, obj):
        return obj.pub_date

    def location(self, obj):
        return "/career/%s" % (obj.slug)


class NewsSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.64
    protocol = "https"

    def items(self):
        return News.objects.all()

    def lastmod(self, obj):
        return obj.pub_date

    def location(self, obj):
        return "/news/%s" % (obj.slug)
