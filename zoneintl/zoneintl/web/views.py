from django.shortcuts import get_object_or_404
from django.shortcuts import render

from .models import Category
from .models import University


def index(request):
    context = {"is_index": True}
    return render(request, "web/index.html", context)


def about(request):
    context = {"is_about": True}
    return render(request, "web/about.html", context)


def courses(request):
    context = {"is_courses": True, "categories": Category.objects.filter(is_active=True)}
    return render(request, "web/courses.html", context)


def category_view(request, pk):
    context = {"is_category_view": True, "category": get_object_or_404(Category, is_active=True, pk=pk)}
    return render(request, "web/category_view.html", context)


def universities(request):
    context = {"is_universities": True, "universities": University.objects.filter(is_active=True)}
    return render(request, "web/universities.html", context)


def services(request):
    context = {"is_services": True}
    return render(request, "web/services.html", context)


def contact(request):
    context = {"is_contact": True}
    return render(request, "web/contact.html", context)
