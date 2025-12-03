from .forms import NewsletterForm


def newsletter_form(request):
    """Make newsletter form available to all templates."""
    return {'newsletter_form': NewsletterForm()}
