from django.db import models
from django.utils.safestring import mark_safe
from django_ckeditor_5.fields import CKEditor5Field


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    mode = models.CharField(max_length=50, default="Online")
    duration = models.CharField(max_length=50, blank=True)
    image = models.ImageField(upload_to="courses/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "Course"
        verbose_name_plural = "Courses"

    def __str__(self):
        return self.title


class Webinar(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    time = models.CharField(max_length=50)
    location = models.CharField(max_length=100)
    image = models.ImageField(upload_to="webinars/")
    registration_count = models.PositiveIntegerField(default=0)
    registration_link = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-date"]
        verbose_name = "Webinar"
        verbose_name_plural = "Webinars"

    def __str__(self):
        return self.title


class Center(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to="centers/")
    address = models.CharField(max_length=255, blank=True)
    contact_info = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Center"
        verbose_name_plural = "Centers"

    def __str__(self):
        return f"{self.name} ({self.city})"


class FAQCategory(models.Model):
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "FAQ Category"
        verbose_name_plural = "FAQ Categories"

    def __str__(self):
        return self.name


class FAQ(models.Model):
    category = models.ForeignKey(
        FAQCategory, on_delete=models.CASCADE, related_name="faqs"
    )
    question = models.CharField(max_length=255)
    answer = CKEditor5Field("Answer", config_name="default")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["category", "order"]
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self):
        return self.question


class Community(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to="communities/")
    type = models.CharField(
        max_length=50, choices=[("free", "Free"), ("paid", "Paid")], default="free"
    )
    features = models.TextField()
    join_link = models.URLField(blank=True)
    learn_more_link = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Community"
        verbose_name_plural = "Communities"

    def __str__(self):
        return self.name


class ReferralStep(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to="referral_steps/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = "Referral Step"
        verbose_name_plural = "Referral Steps"

    def __str__(self):
        return self.title


class CaseStudy(models.Model):
    title = models.CharField(max_length=200)
    problem = models.TextField()
    strategy = models.TextField()
    execution = models.TextField()
    result = models.TextField()
    image = models.ImageField(upload_to="case_studies/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "Case Study"
        verbose_name_plural = "Case Studies"

    def __str__(self):
        return self.title


class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Blog Category"
        verbose_name_plural = "Blog Categories"

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        from django.urls import reverse

        return reverse("web:blog_category", kwargs={"slug": self.slug})


class Audience(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.FileField(upload_to="audiences/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "Audience"
        verbose_name_plural = "Audiences"

    def __str__(self):
        return self.title


class Feature(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to="features/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "Feature"
        verbose_name_plural = "Features"

    def __str__(self):
        return self.title


class WhyUs(models.Model):
    title = models.CharField(max_length=100)
    description = CKEditor5Field("Description", config_name="default")
    icon = models.FileField(upload_to="whyus/")
    number = models.PositiveIntegerField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "number"]
        verbose_name = "Why Us"
        verbose_name_plural = "Why Us"

    def __str__(self):
        return self.title


class Mentor(models.Model):
    name = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    bio = models.TextField()
    expertise = models.TextField()
    profile_picture = models.ImageField(upload_to="mentors/")
    company_logo = models.ImageField(upload_to="mentors/logos/")

    class Meta:
        ordering = ["-name"]
        verbose_name = "Mentor"
        verbose_name_plural = "Mentors"

    def preview(self):
        if self.profile_picture:
            return mark_safe(
                f'<img src="{self.profile_picture.url}" width="100" height="100" style="object-fit:contain;" />'
            )
        return "No Image"

    def __str__(self):
        return self.name


class HiringPartner(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="partners/")

    class Meta:
        ordering = ["-name"]
        verbose_name = "Hiring Partner"
        verbose_name_plural = "Hiring Partners"

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts",
    )
    summary = CKEditor5Field("Summary", config_name="default")
    content = CKEditor5Field("Content", config_name="extends")
    featured_image = models.ImageField(upload_to="blog/")
    author = models.CharField(max_length=100, default="Admin")
    is_featured = models.BooleanField(default=False)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify

            self.slug = slugify(self.title)
            # Ensure unique slug
            original_slug = self.slug
            counter = 1
            while BlogPost.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        from django.urls import reverse

        return reverse("web:blog_detail", kwargs={"slug": self.slug})

    def __str__(self):
        return self.title


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    message = models.TextField()

    class Meta:
        ordering = ["-name"]
        verbose_name = "Contact"
        verbose_name_plural = "Contacts"

    def __str__(self):
        return self.name


class Tool(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="tools/")

    class Meta:
        ordering = ["-name"]
        verbose_name = "Tool"
        verbose_name_plural = "Tools"

    def __str__(self):
        return self.name


class Newsletter(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-subscribed_at"]
        verbose_name = "Newsletter Subscription"
        verbose_name_plural = "Newsletter Subscriptions"

    def __str__(self):
        return self.email


class StudentSuccessStory(models.Model):
    name = models.CharField(max_length=100)
    profile_picture = models.ImageField(upload_to="student_success/")
    job_role = models.CharField(max_length=100)
    company_name = models.CharField(max_length=100)
    company_logo = models.ImageField(upload_to="student_success/companies/")
    package = models.CharField(max_length=50, help_text="e.g., 5 LPA")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Student Success Story"
        verbose_name_plural = "Student Success Stories"

    def __str__(self):
        return f"{self.name} - {self.job_role} at {self.company_name}"


class CommunityTestimonial(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    testimonial = models.TextField()
    image = models.ImageField(upload_to="testimonials/", blank=True)
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="testimonials", null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Community Testimonial"
        verbose_name_plural = "Community Testimonials"

    def __str__(self):
        return f"{self.name} - {self.role}"


class CommunityBenefit(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to="community_benefits/", blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "Community Benefit"
        verbose_name_plural = "Community Benefits"

    def __str__(self):
        return self.title


class ReferralBenefit(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to="referral_benefits/")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "Referral Benefit"
        verbose_name_plural = "Referral Benefits"

    def __str__(self):
        return self.title


class ReferralTerm(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "question"]
        verbose_name = "Referral Term"
        verbose_name_plural = "Referral Terms"

    def __str__(self):
        return self.question

