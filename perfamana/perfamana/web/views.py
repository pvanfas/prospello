from django.shortcuts import render


def index(request):
    context = {"is_index": True}
    return render(request, "web/index.html", context)


def about(request):
    context = {"is_about": True}
    return render(request, "web/about.html", context)



def services(request):
    context = {"is_services": True}
    return render(request, "web/services.html", context)



def stories(request):
    context = {"is_stories": True}
    return render(request, "web/stories.html", context)



def story(request):
    context = {"is_story": True}
    return render(request, "web/story.html", context)


def contact(request):
    context = {"is_contact": True}
    return render(request, "web/contact.html", context)