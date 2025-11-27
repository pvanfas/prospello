from django.core.exceptions import ValidationError
from django.db import models
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField

from main.base import BaseModel


class Slider(BaseModel):
    topline = models.CharField(max_length=100)
    title = models.TextField()
    image = models.ImageField(upload_to="slider")
    order = models.IntegerField(default=0)
    link = models.CharField(max_length=200)

    class Meta:
        ordering = ("order",)
        verbose_name = _("Slider")
        verbose_name_plural = _("Sliders")

    def get_absolute_url(self):
        return reverse("web:home")

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:slider_list")

    def get_update_url(self):
        return reverse_lazy("main:slider_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:slider_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return self.title


class Category(BaseModel):
    name = models.TextField()
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.ImageField(upload_to="category")
    show_in_nav = models.BooleanField("Show in navigation", default=True)
    is_addon = models.BooleanField("Handle as an Addon", default=False)

    class Meta:
        ordering = ("name",)
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")

    def get_count(self):
        return Product.objects.filter(is_active=True, category=self).count()

    def get_absolute_url(self):
        return reverse("web:category", kwargs={"slug": self.slug})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:category_list")

    def get_update_url(self):
        return reverse_lazy("main:category_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:category_delete", kwargs={"pk": self.pk})

    def __str__(self):
        if self.is_addon:
            return f"{self.name} (Addon)"
        return self.name


class Recipient(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    image = models.ImageField(upload_to="recipient", blank=True, null=True)

    class Meta:
        ordering = ("name",)
        verbose_name = _("Recipient")
        verbose_name_plural = _("Recipients")

    def get_count(self):
        return Product.objects.filter(is_active=True, product_type="MAIN", recipient__in=[self]).count()

    def get_absolute_url(self):
        return reverse("web:recipient", kwargs={"slug": self.slug})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:recipient_list")

    def get_update_url(self):
        return reverse_lazy("main:recipient_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:recipient_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return self.name


class Occasion(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    image = models.ImageField(upload_to="occasion", blank=True, null=True)

    class Meta:
        ordering = ("name",)
        verbose_name = _("Occasion")
        verbose_name_plural = _("Occasions")

    def get_count(self):
        return Product.objects.filter(is_active=True, product_type="MAIN", occasion__in=[self]).count()

    def get_absolute_url(self):
        return reverse("web:occasion", kwargs={"slug": self.slug})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:occasion_list")

    def get_update_url(self):
        return reverse_lazy("main:occasion_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:occasion_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return self.name


class Emotion(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    image = models.ImageField(upload_to="emotion", blank=True, null=True)

    class Meta:
        ordering = ("name",)
        verbose_name = _("Emotion")
        verbose_name_plural = _("Emotions")

    def get_count(self):
        return Product.objects.filter(is_active=True, product_type="MAIN", emotion__in=[self]).count()

    def get_absolute_url(self):
        return reverse("web:emotion", kwargs={"slug": self.slug})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:emotion_list")

    def get_update_url(self):
        return reverse_lazy("main:emotion_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:emotion_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return self.name


class Product(BaseModel):
    TYPE_CHOICES = (
        ("MAIN", "Main Product"),
        ("WRAP", "Gift Wrapping"),
        ("CARD", "Greeting Card"),
        ("ADDON", "Addons"),
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    tagline = models.CharField(max_length=100, blank=True, null=True)
    sku = models.CharField("SKU", max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to="product")
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)

    product_type = models.CharField(max_length=100, choices=TYPE_CHOICES, default="MAIN")
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    summary = models.TextField(blank=True, null=True)

    recipient = models.ManyToManyField(Recipient, blank=True)
    occasion = models.ManyToManyField(Occasion, blank=True)
    emotion = models.ManyToManyField(Emotion, blank=True)

    video = models.FileField(upload_to="product", blank=True, null=True)
    description = HTMLField(blank=True, null=True)
    created = models.DateTimeField(default=timezone.now)
    updated = models.DateTimeField(auto_now=True)
    is_trending = models.BooleanField("Mark as Trending", default=False)
    enable_greeting_card = models.BooleanField("Enable greeting card", default=False)
    enable_gift_wrapping = models.BooleanField("Enable gift wrapping", default=False)
    enable_addons = models.BooleanField("Enable addons", default=False)
    enable_message = models.BooleanField("Enable message", default=False)
    message_label = models.CharField("Message Label", max_length=100, default="Your Message")
    enable_file_upload = models.BooleanField("Enable file upload", default=False)
    file_upload_label = models.CharField("File Upload Label", max_length=100, default="Upload File")

    class Meta:
        ordering = ("-name",)
        verbose_name = _("Product")
        verbose_name_plural = _("Products")

    def has_offer(self):
        return Offer.objects.filter(is_active=True, product=self, offer_end__gte=timezone.now()).exists()

    def get_offer(self):
        return Offer.objects.filter(is_active=True, product=self, offer_end__gte=timezone.now()).first()

    def get_price(self):
        if self.has_offer():
            return self.get_offer().offer_price
        return self.sale_price

    def get_absolute_url(self):
        return reverse("web:product", kwargs={"slug": self.slug})

    def get_update_url(self):
        return reverse_lazy("main:product_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:product_delete", kwargs={"pk": self.pk})

    def get_images(self):
        return ProductImage.objects.filter(is_active=True, product=self)

    def get_reviews(self):
        return Review.objects.filter(is_active=True, product=self)

    def get_informations(self):
        return Information.objects.filter(is_active=True, product=self)

    def __str__(self):
        return self.name


class Testimonial(BaseModel):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to="testimonial")

    def get_absolute_url(self):
        return reverse("web:home")

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:testimonial_list")

    def get_update_url(self):
        return reverse_lazy("main:testimonial_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:testimonial_delete", kwargs={"pk": self.pk})

    class Meta:
        ordering = ("name",)
        verbose_name = _("Testimonial")
        verbose_name_plural = _("Testimonials")

    def __str__(self):
        return self.name


class Collection(BaseModel):
    title = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    image = models.ImageField(upload_to="promotion")
    link = models.CharField(max_length=200)
    products = models.ManyToManyField(Product, blank=True)

    class Meta:
        ordering = ("title",)
        verbose_name = _("Collection")
        verbose_name_plural = _("Collections")

    def get_absolute_url(self):
        return reverse("web:collection", kwargs={"slug": self.slug})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:collection_list")

    def get_update_url(self):
        return reverse_lazy("main:collection_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:collection_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return self.title


class Information(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=250)

    class Meta:
        ordering = ("title",)
        verbose_name = _("Product Information")
        verbose_name_plural = _("Product Informations")

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:product_list")

    def __str__(self):
        return self.title


class Section(BaseModel):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to="section")
    description = models.TextField()
    button_text = models.CharField(max_length=100, default="Explore")
    button_link = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        ordering = ("title",)
        verbose_name = _("Page Section")
        verbose_name_plural = _("Page Sections")

    def get_absolute_url(self):
        return self.button_link

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:section_list")

    def get_update_url(self):
        return reverse_lazy("main:section_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:section_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return self.title


class ProductImage(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="product")

    class Meta:
        ordering = ("product",)
        verbose_name = _("Product Image")
        verbose_name_plural = _("Product Images")

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:product_list")

    def __str__(self):
        return self.product.name


class Offer(BaseModel):
    name = models.CharField(max_length=100)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    offer_start = models.DateTimeField()
    offer_end = models.DateTimeField()
    max_sales = models.IntegerField(default=0)
    sold_count = models.PositiveIntegerField(default=0)
    offer_price = models.DecimalField(max_digits=10, decimal_places=2)

    def discount(self):
        return round(
            (self.product.sale_price - self.offer_price) / self.product.sale_price * 100,
            1,
        )

    def clean(self):
        if self.offer_start and self.offer_end:
            if self.offer_start > self.offer_end:
                raise ValidationError(_("Offer start date should be less than offer end date."))
            if (
                Offer.objects.filter(
                    is_active=True,
                    product=self.product,
                    offer_end__gte=self.offer_start,
                    offer_start__lte=self.offer_end,
                )
                .exclude(pk=self.pk)
                .exists()
            ):
                raise ValidationError(_("Offer already exists for this product in this date range."))

    class Meta:
        ordering = ("-offer_start",)
        verbose_name = _("Offer")
        verbose_name_plural = _("Offers")

    def get_absolute_url(self):
        return reverse("web:home")

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:offer_list")

    def get_update_url(self):
        return reverse_lazy("main:offer_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:offer_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return self.product.name


class Review(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to="review", blank=True, null=True)
    rating = models.IntegerField(default=5, choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()

    class Meta:
        ordering = ("product",)
        verbose_name = _("Review")
        verbose_name_plural = _("Reviews")

    def get_absolute_url(self):
        return reverse("web:product", kwargs={"slug": self.product.slug})

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:review_list")

    def get_update_url(self):
        return reverse_lazy("main:review_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:review_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return self.product.name


class Material(BaseModel):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to="material", blank=True, null=True)

    class Meta:
        ordering = ("name",)
        verbose_name = _("Material")
        verbose_name_plural = _("Materials")

    def get_absolute_url(self):
        return reverse("web:home")

    @staticmethod
    def get_list_url():
        return reverse_lazy("main:material_list")

    def get_update_url(self):
        return reverse_lazy("main:material_update", kwargs={"pk": self.pk})

    def get_delete_url(self):
        return reverse_lazy("main:material_delete", kwargs={"pk": self.pk})

    def __str__(self):
        return self.name


class GeneralSetting(models.Model):
    show_welcome_text = models.BooleanField(default=True)
    welcome_text = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = _("General Setting")
        verbose_name_plural = _("General Settings")

    def __str__(self):
        return "General Setting"
