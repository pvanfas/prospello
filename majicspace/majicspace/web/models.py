from django.db import models
from django.urls import reverse
from tinymce.models import HTMLField


class Banner(models.Model):
    service = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to="banner")

    class Meta:
        ordering = ["-id"]
        verbose_name = "Banner"
        verbose_name_plural = "Banners"

    def __str__(self):
        return self.title


class Service(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=100, blank=True)
    description = HTMLField()
    image = models.ImageField(upload_to="service")

    class Meta:
        ordering = ["-id"]
        verbose_name = "Service"
        verbose_name_plural = "Services"

    def get_absolute_url(self):
        return reverse("web:service_detail", kwargs={"service_slug": self.slug})

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to="testimonials")

    class Meta:
        verbose_name = "Testimonial"
        verbose_name_plural = "Testimonials"

    def __str__(self):
        return self.name


class Portfolio(models.Model):
    service = models.ForeignKey("web.Service", on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=100, blank=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="portfolio")

    class Meta:
        verbose_name = "Portfolio"
        verbose_name_plural = "Portfolios"

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("web:portfolio_detail", kwargs={"portfolio_slug": self.slug, "service_slug": self.service.slug})

    def get_images(self):
        return PortfolioImage.objects.filter(project=self)


class PortfolioImage(models.Model):
    project = models.ForeignKey(Portfolio, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="portfolio/")

    class Meta:
        verbose_name = "Portfolio Image"
        verbose_name_plural = "Portfolio Images"

    def __str__(self):
        return self.project.title


class Blog(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=100, blank=True)
    date = models.DateField()
    description = HTMLField()
    image = models.ImageField(upload_to="blog")

    class Meta:
        verbose_name = "Blog"
        verbose_name_plural = "Blogs"

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("web:blog_detail", kwargs={"slug": self.slug})


class Contact(models.Model):
    name = models.CharField(max_length=120)
    timestamp = models.DateTimeField(db_index=True, auto_now_add=True)
    phone = models.CharField(max_length=120, blank=True, null=True)
    message = models.TextField()

    def __str__(self):
        return str(self.name)


class Team(models.Model):
    name = models.CharField(max_length=120)
    designation = models.CharField(max_length=120)
    image = models.ImageField(upload_to="team")

    class Meta:
        verbose_name = "Team"
        verbose_name_plural = "Teams"

    def __str__(self):
        return self.name
