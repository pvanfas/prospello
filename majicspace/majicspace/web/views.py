from django.http import JsonResponse
from django.views.generic import DetailView
from django.views.generic import FormView
from django.views.generic import ListView
from django.views.generic import TemplateView

from .forms import ContactForm
from .models import Banner
from .models import Blog
from .models import Portfolio
from .models import Service
from .models import Team
from .models import Testimonial


class IndexView(TemplateView):
    template_name = "web/index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["banners"] = Banner.objects.all()
        context["is_index_header"] = True
        return context


class AboutView(FormView):
    template_name = "web/about.html"
    form_class = ContactForm

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["testimonials"] = Testimonial.objects.all()
        context["teams"] = Team.objects.all()
        return context

    def form_valid(self, form):
        form.save()
        response_data = {"status": "true", "title": "Successfully Submitted", "message": "Message successfully updated"}
        return JsonResponse(response_data)

    def form_invalid(self, form):
        response_data = {"status": "false", "title": "Form validation error"}
        return JsonResponse(response_data, status=400)


class ServiceListView(ListView):
    model = Service

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["services"] = Service.objects.all()
        return context


class ServiceDetailView(DetailView):
    model = Service
    template_name = "web/service_detail.html"

    def get_object(self, queryset=None):
        return Service.objects.get(slug=self.kwargs["service_slug"])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["portfolios"] = Portfolio.objects.filter(service=self.object)
        return context


class PortfolioListView(ListView):
    model = Portfolio
    context_object_name = "portfolios"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["services"] = Service.objects.all()
        return context


class PortfolioDetailView(DetailView):
    model = Portfolio
    template_name = "web/portfolio_detail.html"

    def get_object(self, queryset=None):
        return Portfolio.objects.get(slug=self.kwargs["portfolio_slug"])


class BlogListView(ListView):
    model = Blog

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["blogs"] = Blog.objects.all()

        return context


class BlogDetailView(DetailView):
    model = Blog


class ContactView(FormView):
    form_class = ContactForm
    template_name = "web/contact.html"

    def form_valid(self, form):
        form.save()
        response_data = {"status": "true", "title": "Successfully Submitted", "message": "Message successfully updated"}
        return JsonResponse(response_data)

    def form_invalid(self, form):
        response_data = {"status": "false", "title": "Form validation error"}
        return JsonResponse(response_data, status=400)
