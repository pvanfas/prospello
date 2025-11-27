from django.shortcuts import render
from .models import Category, News, Slider, Team, Career, Brand
from .forms import ContactForm, ApplicationForm
from django.http import JsonResponse


def index(request):
    sliders = Slider.objects.all()
    categories = Category.objects.all()
    newses = News.objects.all()[0:3]
    form = ContactForm(request.POST or None)
    context = {
        "is_index": True,
        "sliders": sliders,
        "categories": categories,
        "newses": newses,
        "form": form,
        "hide_footer": True,
        "hide_appointment": True,
        "brands": Brand.objects.all(),
    }
    return render(request, "web/index.html", context)


def about(request):
    categories = Category.objects.all()
    context = {"is_about": True, "categories": categories}
    return render(request, "web/about.html", context)


def business_lines(request):
    categories = Category.objects.all()
    context = {"is_business_lines": True, "categories": categories}
    return render(request, "web/business_lines.html", context)


def team(request):
    teams = Team.objects.all()
    context = {"is_team": True, "teams": teams}
    return render(request, "web/team.html", context)


def news(request):
    newses = News.objects.all()
    context = {"is_news": True, "newses": newses}
    return render(request, "web/news.html", context)


def careers(request):
    form = ApplicationForm(request.POST or None, request.FILES or None)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            form = ApplicationForm()
            response_data = {"status": True, "message": "Your application has been submitted successfully!"}
        else:
            print(form.errors)
            response_data = {"status": False, "message": repr(form.errors)}
        return JsonResponse(response_data)
    else:
        careers = Career.objects.all()
        context = {"is_careers": True, "careers": careers, "form": form}
        return render(request, "web/careers.html", context)


def news_details(request, slug):
    news = News.objects.get(slug=slug)
    context = {"is_news_details": True, "news": news}
    return render(request, "web/news_details.html", context)


def contact(request):
    form = ContactForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            form = ContactForm()
            response_data = {"status": True, "message": "Your message has been sent successfully!"}
        else:
            print(form.errors)
            response_data = {"status": False, "message": repr(form.errors)}
        return JsonResponse(response_data)
    else:
        context = {"is_contact": True, "form": form, "hide_footer": True, "hide_appointment": True}
        return render(request, "web/contact.html", context)


def career_details(request, slug):
    career = Career.objects.get(slug=slug)
    context = {"is_career_details": True, "career": career}
    return render(request, "web/career_details.html", context)
