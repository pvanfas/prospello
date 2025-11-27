from django.db import models
from django.urls import reverse
from tinymce.models import HTMLField
from versatileimagefield.fields import VersatileImageField


class Category(models.Model):
    name = models.CharField(max_length=128)
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def get_product_count(self):
        return Product.objects.filter(category=self, is_active=True).count()

    def __str__(self):
        return str(self.name)


class Product(models.Model):
    name = models.CharField(max_length=128)
    slug = models.SlugField(unique=True, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    featured_image = VersatileImageField(upload_to="images/products/featured_image/")
    summary = models.TextField()
    description = HTMLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=True)
    rank = models.PositiveIntegerField(blank=True, null=True)
    pub_date = models.DateTimeField(auto_now_add=True)

    def get_view_url(self):
        return reverse("web:product_single", kwargs={"slug": self.slug})

    def get_absolute_url(self):
        return reverse("web:product_single", kwargs={"slug": self.slug})

    class Meta:
        ordering = ("-rank", "name")

    def __str__(self):
        return str(self.name)
