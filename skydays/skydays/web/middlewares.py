from django.conf import settings
from django.shortcuts import render

class SiteSuspensionMiddleware:
    """
    Middleware to render a site suspension page if the site is suspended.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if settings.SITE_SUSPENDED:
            return render(request, 'suspended.html')
        return self.get_response(request)