import json

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render

from .forms import ApplicationForm
from .forms import AppointmentForm
from .forms import ContactForm
from .models import Career
from .models import Client
from .models import Leadership
from .models import News
from .models import Project
from .models import Team


def index(request):
    newses = News.objects.filter(show_in_homepage=True)[:3]
    clients = Client.objects.all()
    appointment_form = AppointmentForm()
    context = {"is_index": True, "newses": newses, "clients": clients, "appointment_form": appointment_form}
    return render(request, "web/index.html", context)


def about(request):
    appointment_form = AppointmentForm()
    context = {"is_about": True, "appointment_form": appointment_form}
    return render(request, "web/about.html", context)


def updates(request):
    newses = News.objects.all()
    appointment_form = AppointmentForm()
    context = {"is_updates": True, "newses": newses, "appointment_form": appointment_form}
    return render(request, "web/updates.html", context)


def update(request, slug):
    news = get_object_or_404(News, slug=slug)
    newses = News.objects.all()
    appointment_form = AppointmentForm()
    context = {"is_updates": True, "news": news, "newses": newses, "appointment_form": appointment_form}
    return render(request, "web/post.html", context)


def careers(request):
    appointment_form = AppointmentForm()
    application_form = ApplicationForm(request.POST or None, request.FILES or None)
    careers = Career.objects.filter(is_active=True)
    if request.method == "POST":
        if application_form.is_valid():
            application_form.save()
            response_data = {
                "status": "true",
                "title": "Successfully Submitted",
                "message": "Application successfully Submitted",
            }
        else:
            print(application_form.errors)
            response_data = {"status": "false", "title": "Form validation error"}
        return HttpResponse(json.dumps(response_data), content_type="application/javascript")
    else:
        context = {
            "is_careers": True,
            "careers": careers,
            "appointment_form": appointment_form,
            "application_form": application_form,
        }
        return render(request, "web/careers.html", context)


def commercial(request):
    appointment_form = AppointmentForm()
    context = {"is_commercial": True, "appointment_form": appointment_form}
    return render(request, "web/commercial.html", context)


def projects(request):
    appointment_form = AppointmentForm()
    completed_projects = Project.objects.filter(is_active=True, status="COMPLETED")
    ongoing_projects = Project.objects.filter(is_active=True, status="ONGOING")
    context = {
        "is_projects": True,
        "appointment_form": appointment_form,
        "completed_projects": completed_projects,
        "ongoing_projects": ongoing_projects,
    }
    return render(request, "web/projects.html", context)


def story(request):
    appointment_form = AppointmentForm()
    leaderships = Leadership.objects.filter(is_active=True)
    teams = Team.objects.filter(is_active=True)
    context = {"is_story": True, "appointment_form": appointment_form, "leaderships": leaderships, "teams": teams}
    return render(request, "web/story.html", context)


def services(request):
    appointment_form = AppointmentForm()
    context = {"is_services": True, "appointment_form": appointment_form}
    return render(request, "web/services.html", context)


def contact(request):
    appointment_form = AppointmentForm()
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
            response_data = {"status": "false", "title": "Form validation error"}
        return HttpResponse(json.dumps(response_data), content_type="application/javascript")
    else:
        context = {"is_contact": True, "appointment_form": appointment_form, "form": form}
    return render(request, "web/contact.html", context)


def appointment(request):
    appointment_form = AppointmentForm(request.POST or None)
    if request.method == "POST":
        if appointment_form.is_valid():
            appointment_form.save()
            response_data = {
                "status": "true",
                "title": "Successfully Submitted",
                "message": "Request successfully Sent",
            }
        else:
            print(appointment_form.errors)
            response_data = {"status": "false", "title": "Form validation error"}
        return HttpResponse(json.dumps(response_data), content_type="application/javascript")
    else:
        context = {"is_contact": True, "appointment_form": appointment_form, "appointment_form": appointment_form}
    return render(request, "web/index.html", context)
