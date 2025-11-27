from django.core.exceptions import ValidationError
from django.db import models
from django.urls import reverse
from tinymce.models import HTMLField
from versatileimagefield.fields import VersatileImageField


class About(models.Model):
    title = models.CharField(max_length=128)
    email = models.EmailField(max_length=128, blank=True, null=True)
    phone = models.CharField(max_length=128, default="+91 0000 000 000")
    description = models.TextField()
    address = models.TextField()

    class Meta:
        verbose_name = "About"
        verbose_name_plural = "About"

    def clean(self):
        if About.objects.count() >= 1 and self.pk is None:
            raise ValidationError("You can only create one About. Try editing/removing one of the existing about.")

    def __str__(self):
        return str("Change Your About")


class Banner(models.Model):
    title = models.CharField(max_length=128)
    photo = VersatileImageField("Banner Photo", blank=True, null=True, upload_to="images/banners")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("title",)

    def __str__(self):
        return str(self.title)


class CareerPost(models.Model):
    title = models.CharField(max_length=128)
    slug = models.SlugField(unique=True, blank=True, null=True)

    featured_image = VersatileImageField(upload_to="images/careers/featured_image/")
    content = HTMLField()

    timestamp = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    pub_date = models.DateTimeField(auto_now_add=True)

    def get_view_url(self):
        return reverse("web:career_single", kwargs={"slug": self.slug})

    def get_absolute_url(self):
        return reverse("web:career_single", kwargs={"slug": self.slug})

    def __str__(self):
        return f"{self.title}"

    class Meta:
        ordering = ["-pub_date"]


class CareerApplication(models.Model):
    timestamp = models.DateTimeField(db_index=True, auto_now_add=True)
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=120, blank=True, null=True)
    place = models.CharField(max_length=120, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    career = models.ForeignKey(CareerPost, on_delete=models.CASCADE)
    resume = models.FileField(upload_to="docs/careers/applications/")

    def __str__(self):
        return f"{self.name}"


class Client(models.Model):
    name = models.CharField(max_length=128)
    logo = VersatileImageField("Photo", blank=True, null=True, upload_to="images/clients")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return str(self.name)


class Testimonial(models.Model):
    name = models.CharField(max_length=128)
    content = models.TextField()
    photo = VersatileImageField("Photo", blank=True, null=True, upload_to="images/testimonials")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return str(self.name)


class News(models.Model):
    title = models.CharField(max_length=128)
    slug = models.SlugField(unique=True, blank=True, null=True)

    featured_image = VersatileImageField(upload_to="images/blog/featured_image/")
    summary = models.TextField()
    content = HTMLField(blank=True, null=True)

    timestamp = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    pub_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "News"
        verbose_name_plural = "News & Updates"
        ordering = ["-pub_date"]

    def get_view_url(self):
        return reverse("web:news_single", kwargs={"slug": self.slug})

    def get_absolute_url(self):
        return reverse("web:news_single", kwargs={"slug": self.slug})

    def __str__(self):
        return f"{self.title}"


class Social(models.Model):
    order = models.IntegerField(unique=True)
    media = models.CharField(max_length=100)
    link = models.URLField(max_length=200)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("order",)
        verbose_name = "Social Media"
        verbose_name_plural = "Social Medias"

    def __str__(self):
        return str(self.media)


class Contact(models.Model):
    timestamp = models.DateTimeField(db_index=True, auto_now_add=True)
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=120, blank=True, null=True)
    place = models.CharField(max_length=120, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    message = models.TextField()

    def __str__(self):
        return str(self.name)


class Enquiry(models.Model):
    timestamp = models.DateTimeField(db_index=True, auto_now_add=True)
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=120, blank=True, null=True)
    place = models.CharField(max_length=120, blank=True, null=True)

    class Meta:
        verbose_name = "Product Enquiry"
        verbose_name_plural = "Product Enquiries"

    def __str__(self):
        return str(self.name)
