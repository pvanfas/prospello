from django.db import models
from django.urls import reverse
from tinymce.models import HTMLField
from versatileimagefield.fields import PPOIField
from versatileimagefield.fields import VersatileImageField


class Category(models.Model):
    title = models.CharField(max_length=120)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return str(self.title)


class Client(models.Model):
    title = models.CharField(max_length=120)
    photo = VersatileImageField(upload_to="images/news", ppoi_field="ppoi")
    ppoi = PPOIField("Image PPOI")

    def __str__(self):
        return str(self.title)


class News(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(unique=True, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    photo = VersatileImageField(upload_to="images/news", ppoi_field="ppoi")
    ppoi = PPOIField("Image PPOI")
    date = models.DateTimeField(db_index=True, auto_now_add=True)
    summary = models.TextField()
    content = HTMLField()
    show_in_homepage = models.BooleanField(default=True)

    class Meta:
        verbose_name = "News & Updates"
        verbose_name_plural = "Newses & Updates"

    def get_absolute_url(self):
        return reverse("web:update", kwargs={"slug": self.slug})

    def get_images(self):
        return NewsImage.objects.filter(news=self)

    def __str__(self):
        return str(self.title)


class NewsImage(models.Model):
    news = models.ForeignKey(News, on_delete=models.CASCADE)
    photo = VersatileImageField(upload_to="images/leadership", ppoi_field="ppoi")
    ppoi = PPOIField("Image PPOI")

    def __str__(self):
        return str(self.news.title)


class Leadership(models.Model):
    name = models.CharField(max_length=120)
    designation = models.CharField(max_length=120)
    photo = VersatileImageField(upload_to="images/leadership", ppoi_field="ppoi")
    ppoi = PPOIField("Image PPOI")
    description = models.TextField()
    order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return str(self.name)


class Team(models.Model):
    name = models.CharField(max_length=120)
    order = models.IntegerField(blank=True, null=True)
    designation = models.CharField(max_length=120)
    photo = VersatileImageField(upload_to="images/teams", ppoi_field="ppoi")
    ppoi = PPOIField("Image PPOI")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return str(self.name)


class ProjectCategory(models.Model):
    title = models.CharField(max_length=120)

    class Meta:
        verbose_name = "Project Category"
        verbose_name_plural = "Project Categories"

    def __str__(self):
        return str(self.title)


class Project(models.Model):
    STATUS_CHOICES = (("COMPLETED", "COMPLETED"), ("ONGOING", "ONGOING"))

    title = models.CharField(max_length=120)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    status = models.CharField(max_length=128, choices=STATUS_CHOICES, default="COMPLETED")
    photo = VersatileImageField(upload_to="images/projects", ppoi_field="ppoi")
    ppoi = PPOIField("Image PPOI")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return str(self.title)


class Career(models.Model):
    department = models.CharField(max_length=120)
    title = models.CharField(max_length=120)
    photo = VersatileImageField(upload_to="images/leadership", ppoi_field="ppoi")
    ppoi = PPOIField("Image PPOI")
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Job Post"
        verbose_name_plural = "Job Posts"

    def __str__(self):
        return str(self.title)


class Application(models.Model):
    timestamp = models.DateTimeField(db_index=True, auto_now_add=True)
    career = models.ForeignKey(Career, on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    resume = models.FileField()

    class Meta:
        verbose_name = "Job Application"
        verbose_name_plural = "Job Applications"

    def __str__(self):
        return str(self.name)


class Appointment(models.Model):
    TEAM_CHOICES = (
        ("", "-- Select Team --"),
        ("Chairman", "Chairman"),
        ("Managing-Director", "Managing-Director"),
        ("Operation-Manager", "Operation-Manager"),
    )

    timestamp = models.DateTimeField(db_index=True, auto_now_add=True)
    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=120, blank=True, null=True)
    team = models.CharField(max_length=128, choices=TEAM_CHOICES)
    message = models.TextField()

    class Meta:
        verbose_name = "Appointment Request"
        verbose_name_plural = "Appointment Requests"

    def __str__(self):
        return str(self.name)


class Contact(models.Model):
    name = models.CharField(max_length=120)
    timestamp = models.DateTimeField(db_index=True, auto_now_add=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=120, blank=True, null=True)
    message = models.TextField()

    class Meta:
        verbose_name = "Contact Form Entry"
        verbose_name_plural = "Contact Form Entries"

    def __str__(self):
        return str(self.name)
