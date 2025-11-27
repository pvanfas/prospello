import json

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render
from products.models import Product
from web.models import Banner
from web.models import CareerPost
from web.models import Client
from web.models import News
from web.models import Testimonial

from .filters import ProductFilter
from .forms import ApplicationForm
from .forms import ContactForm
from .forms import EnquiryForm


def index(request):
    products = Product.objects.filter(is_active=True, is_featured=True, category__is_active=True)
    clients = Client.objects.filter(is_active=True)
    banners = Banner.objects.filter(is_active=True)
    testimonials = Testimonial.objects.filter(is_active=True)
    newses = News.objects.filter(is_active=True)
    context = {
        "is_index": True,
        "products": products,
        "banners": banners,
        "clients": clients,
        "testimonials": testimonials,
        "newses": newses,
    }
    return render(request, "website/index.html", context)


def about(request):
    context = {"is_about": True}
    return render(request, "website/about.html", context)


def products(request):
    dataset = Product.objects.filter(is_active=True, category__is_active=True)
    products = ProductFilter(request.GET, queryset=dataset)
    context = {"is_products": True, "products": products}
    return render(request, "website/products.html", context)


def product_single(request, slug):
    product = get_object_or_404(Product, slug=slug)
    form = EnquiryForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            data = form.save(commit=False)
            data.product = product
            data.save()
            response_data = {
                "status": "true",
                "title": "Successfully Submitted",
                "message": "Message successfully updated",
            }
        else:
            print(form.errors)
            response_data = {"form": form, "status": "false", "title": "Form validation error"}
        return HttpResponse(json.dumps(response_data), content_type="application/javascript")
    else:
        context = {"is_products": True, "form": form, "product": product}
        return render(request, "website/product_single.html", context)


def career_single(request, slug):
    form = ApplicationForm(request.POST or None, request.FILES or None)
    career = get_object_or_404(CareerPost, slug=slug)
    if request.method == "POST":
        if form.is_valid():
            data = form.save(commit=False)
            data.career = career
            data.save()
            response_data = {
                "status": "true",
                "title": "Successfully Submitted",
                "message": "Application successfully updated",
            }
        else:
            print(form.errors)
            response_data = {"form": form, "status": "false", "title": "Form validation error"}
        return HttpResponse(json.dumps(response_data), content_type="application/javascript")
    else:
        context = {"is_careers": True, "career": career, "form": form}
        return render(request, "website/career_single.html", context)


def news_single(request, slug):
    news = get_object_or_404(News, slug=slug)
    context = {"is_newss": True, "news": news}
    return render(request, "website/news_single.html", context)


def updates(request):
    newses = News.objects.filter(is_active=True)
    context = {"is_updates": True, "newses": newses}
    return render(request, "website/updates.html", context)


def careers(request):
    careers = CareerPost.objects.filter(is_active=True)
    context = {"is_careers": True, "careers": careers}
    return render(request, "website/careers.html", context)


def contact(request):
    form = ContactForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            response_data = {
                "status": "true",
                "title": "Successfully Submitted",
                "message": "Message successfully updated",
            }
        else:
            print(form.errors)
            response_data = {"status": "false", "title": "Form validation error", "message": repr(form.errors)}
        return HttpResponse(json.dumps(response_data), content_type="application/javascript")
    else:
        context = {"is_contact": True, "form": form}
    return render(request, "website/contact.html", context)


def privacy_policy(request):
    context = {}
    return render(request, "website/privacy_policy.html", context)



def brochure(request):
    context = {"is_brochure": True}
    return render(request, "website/brochure.html", context)
