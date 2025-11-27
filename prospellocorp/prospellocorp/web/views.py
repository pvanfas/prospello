from django.shortcuts import render

from .models import FAQ, Career, Committee, Frame, Partner, Platform, Spotlight, Team
from django.shortcuts import get_object_or_404


def index(request):
    platforms = Platform.objects.all()
    spotlights = Spotlight.objects.all()[0:3]
    frames = Frame.objects.filter(is_active=True)
    partners = Partner.objects.all()
    context = {
        "is_index": True,
        "platforms": platforms,
        "spotlights": spotlights,
        "frames": frames,
        "partners": partners,
    }
    return render(request, "web/index.html", context)


def about_us(request):
    teams = Team.objects.all()
    committees = Committee.objects.all()
    context = {"is_about": True, "teams": teams, "committees": committees}
    return render(request, "web/about.html", context)


def about_story(request):
    context = {"is_about_story": True}
    return render(request, "web/story.html", context)


def contact(request):
    context = {"is_contact": True}
    return render(request, "web/contact.html", context)


def careers(request):
    careers = Career.objects.all()
    faqs = FAQ.objects.all()
    context = {"is_careers": True, "careers": careers, "faqs": faqs}
    return render(request, "web/careers.html", context)


def services_detail(request):
    context = {"is_services_detail": True}
    return render(request, "web/services_detail.html", context)


def industries(request):
    context = {"is_industries": True}
    return render(request, "web/industries.html", context)


def technologies_industry(request):
    context = {"is_technologies_industry": True}
    return render(request, "web/industry/technologies.html", context)


def media_industry(request):
    context = {"is_media_industry": True}
    return render(request, "web/industry/media.html", context)


def society_industry(request):
    context = {"is_society_industry": True}
    return render(request, "web/industry/society.html", context)


def education_industry(request):
    context = {"is_education_industry": True}
    return render(request, "web/industry/education.html", context)


def platform_detail(request, slug):
    platform = get_object_or_404(Platform, slug=slug)
    context = {"is_platform_detail": True, "platform": platform}
    return render(request, "web/platform_detail.html", context)


def spotlight_detail(request, slug):
    spotlight = get_object_or_404(Spotlight, slug=slug)
    context = {"is_spotlight_detail": True, "spotlight": spotlight}
    return render(request, "web/spotlight_detail.html", context)
