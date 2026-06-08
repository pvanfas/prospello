from django.views.generic import TemplateView

from .models import About, Company, News


class Index(TemplateView):
    template_name = "web/index.html"

    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(**kwargs)
        context["about"] = About.objects.first()
        context["companies"] = Company.objects.filter(is_active=True)
        context["newses"] = News.objects.filter(is_active=True)
        return context
