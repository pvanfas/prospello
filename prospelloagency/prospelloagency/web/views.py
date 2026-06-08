from django.shortcuts import render


def index(request):
    context = {"is_index": True}
    return render(request, "web/index.html", context)


def contact(request):
    context = {"is_contact": True}
    return render(request, "web/contact.html", context)
