from django.db import models
from django.urls import reverse


class Property(models.Model):
    title = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="property")
    amenities = models.ManyToManyField("Amenity", related_name="properties")
    map_src = models.CharField(max_length=400, blank=True, null=True)
    video_id = models.CharField(max_length=200, blank=True, null=True)
    listed_on = models.DateField(auto_now_add=True)
    is_featured = models.BooleanField(default=False)

    property_id = models.CharField(max_length=200, blank=True, null=True)
    property_type = models.CharField(max_length=200, blank=True, null=True)
    property_status = models.CharField(max_length=200, blank=True, null=True)
    property_price = models.CharField(max_length=200, blank=True, null=True)
    property_area = models.CharField(max_length=200, blank=True, null=True)
    property_bedrooms = models.CharField(max_length=200, blank=True, null=True)
    property_bathrooms = models.CharField(max_length=200, blank=True, null=True)
    property_garages = models.CharField(max_length=200, blank=True, null=True)
    property_year_built = models.CharField(max_length=200, blank=True, null=True)
    property_floor = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Properties"

    def get_images(self):
        return PropertyImage.objects.filter(property=self)

    def get_features(self):
        return PropertyFeature.objects.filter(property=self)

    def get_absolute_url(self):
        return reverse("web:property_details", kwargs={"id": self.id})

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="property")

    def __str__(self):
        return self.property.title


class PropertyFeature(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    feature = models.CharField(max_length=200)
    text = models.CharField(max_length=200)

    def __str__(self):
        return self.feature


class Amenity(models.Model):
    title = models.CharField(max_length=200)

    class Meta:
        verbose_name_plural = "Amenities"

    def __str__(self):
        return self.title


class Realtor(models.Model):
    name = models.CharField(max_length=200)
    photo = models.ImageField(upload_to="realtors")
    designation = models.CharField(max_length=200)

    def __str__(self):
        return self.name
