from django.db import models
from django.urls import reverse
from tinymce.models import HTMLField


class Slider(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="slider")

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="testimonial")

    def __str__(self):
        return self.name


class Blog(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    image = models.ImageField(upload_to="blog")
    date = models.DateField(auto_now_add=True)
    summary = models.TextField()
    content = HTMLField()
    date = models.DateField(auto_now_add=True)
    is_published = models.BooleanField(default=False)

    def get_absolute_url(self):
        return reverse("web:blog_details", kwargs={"slug": self.slug})

    def __str__(self):
        return self.title


class FAQ(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
