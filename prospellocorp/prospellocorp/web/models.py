from django.db import models
from django.urls import reverse
from tinymce.models import HTMLField


class Platform(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    tagline = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    summary = models.TextField()
    description = models.TextField()
    mission = models.TextField()
    vision = models.TextField()
    transparent_image = models.ImageField(upload_to="platforms")
    background_image = models.ImageField(upload_to="platforms")
    feature_image = models.ImageField(upload_to="platforms")
    established_image = models.ImageField(upload_to="platforms")

    def get_absolute_url(self):
        return reverse("web:platform_detail", kwargs={"slug": self.slug})

    class Meta:
        ordering = ["order"]
        verbose_name = "Platform/Product"
        verbose_name_plural = "Platforms/Products"

    def __str__(self):
        return self.name


class PlatformService(models.Model):
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()

    class Meta:
        verbose_name = "Platform Service"
        verbose_name_plural = "Platform Services"

    def __str__(self):
        return self.title


class SpotlightCategory(models.Model):
    name = models.CharField(max_length=200)

    class Meta:
        verbose_name = "Spotlight Category"
        verbose_name_plural = "Spotlight Categories"

    def __str__(self):
        return self.name


class Spotlight(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    category = models.ForeignKey(SpotlightCategory, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="spotlights", blank=True, null=True)
    description = HTMLField()
    date = models.DateField()

    def get_absolute_url(self):
        return reverse("web:spotlight_detail", kwargs={"slug": self.slug})

    class Meta:
        ordering = ["date"]
        verbose_name = "Spotlight"
        verbose_name_plural = "Spotlights"

    def __str__(self):
        return self.title


class Career(models.Model):
    title = models.CharField(max_length=200)
    job_id = models.CharField(max_length=200)
    summary = models.TextField()
    description = HTMLField()

    class Meta:
        verbose_name = "Career"
        verbose_name_plural = "Careers"

    def __str__(self):
        return self.title


class FAQ(models.Model):
    question = models.CharField(max_length=200)
    answer = models.TextField()

    class Meta:
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self):
        return self.question


class Frame(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="frames")
    page_link = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "Frame"
        verbose_name_plural = "Frames"

    def __str__(self):
        return self.title


class Partner(models.Model):
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to="firms")

    class Meta:
        verbose_name = "Firm"
        verbose_name_plural = "Firms"

    def __str__(self):
        return self.name


class Contact(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    message = models.TextField()

    class Meta:
        verbose_name = "Contact"
        verbose_name_plural = "Contacts"

    def __str__(self):
        return self.name


class Team(models.Model):
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=200)
    image = models.ImageField(upload_to="team")

    class Meta:
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"

    def __str__(self):
        return self.name


class Committee(models.Model):
    name = models.CharField(max_length=200)
    focus = models.TextField()
    responsibilities = models.TextField()

    class Meta:
        verbose_name = "Committee"
        verbose_name_plural = "Committees"

    def __str__(self):
        return self.name
