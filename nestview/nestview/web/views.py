from app.models import Property
from app.models import Realtor
from django.contrib import messages
from django.shortcuts import get_object_or_404
from django.shortcuts import render
from enquiries.forms import EnquiryForm

from .models import FAQ
from .models import Blog
from .models import Slider
from .models import Testimonial


def index(request):
    featured_properties = Property.objects.filter(is_featured=True)
    sliders = Slider.objects.all()
    testimonials = Testimonial.objects.all()[:1]
    blogs = Blog.objects.filter(is_published=True)
    context = {
        "is_index": True,
        "sliders": sliders,
        "featured_properties": featured_properties,
        "testimonials": testimonials,
        "blogs": blogs,
    }
    return render(request, "web/index.html", context)


def about(request):
    blogs = Blog.objects.filter(is_published=True)
    testimonials = Testimonial.objects.all()
    context = {"is_about": True, "blogs": blogs, "testimonials": testimonials}
    return render(request, "web/about.html", context)


def blogs(request):
    form = EnquiryForm(request.POST or None)
    featured_properties = Property.objects.filter(is_featured=True)
    blogs = Blog.objects.filter(is_published=True)
    context = {"is_blogs": True, "blogs": blogs, "featured_properties": featured_properties, "form": form}
    return render(request, "web/blogs.html", context)


def contact(request):
    form = EnquiryForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            messages.success(request, "Your enquiry has been submitted successfully")
    context = {"is_contact": True, "form": form}
    return render(request, "web/contact.html", context)


def faq(request):
    faqs = FAQ.objects.all()
    blogs = Blog.objects.filter(is_published=True)
    context = {"is_faq": True, "blogs": blogs, "faqs": faqs}
    return render(request, "web/faq.html", context)


def properties(request):
    properties = Property.objects.all()
    context = {"is_properties": True, "properties": properties}
    return render(request, "web/properties.html", context)


def realtors(request):
    realtors = Realtor.objects.all()
    context = {"is_realtors": True, "realtors": realtors}
    return render(request, "web/realtors.html", context)


def blog_details(request, slug):
    blog = get_object_or_404(Blog, slug=slug)
    related_blogs = Blog.objects.filter(is_published=True).exclude(id=blog.id)[:3]
    context = {"is_blog_details": True, "blog": blog, "related_blogs": related_blogs}
    return render(request, "web/blog_details.html", context)


def property_details(request, id):
    property = get_object_or_404(Property, id=id)
    related_properties = Property.objects.all().exclude(id=property.id)[:3]
    context = {"is_property_details": True, "property": property, "related_properties": related_properties}
    return render(request, "web/property_details.html", context)
