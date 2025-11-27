from pathlib import Path

from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = ["*"]


# Application definition

INSTALLED_APPS = [
    "admin_interface",
    "colorfield",
    "versatileimagefield",
    "djmoney",
    "tinymce",
    "paypal.standard.ipn",
    "djmoney.contrib.exchange",
    "import_export",
    "django.contrib.admin",
    "django.contrib.sites",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "web",
    "enquiry",
]

# Paypal settings
PAYPAL_TEST = config("PAYPAL_TEST", default=True, cast=bool)
PAYPAL_EMAIL = config("PAYPAL_EMAIL", default="secure.skydays@gmail.com")
PAYPAL_CLIENT_ID = config(
    "PAYPAL_CLIENT_ID",
    default="AdWPQc0wSKC5tJnYbnBfSeiBk9Nk_FSPZ6m9oMG3F90kZN3HhG5K-d8Z6cTDnOa8AdCMax3JQqupessX",
)
PAYPAL_API_PASSWORD = config(
    "PAYPAL_API_PASSWORD",
    default="EORQqG25-Q8dguq4brFqvSZFY-9Ub-2MxzxpHMprbh10dxNmXUYGt_GgLBPdxdvSEPLHGAO8k3Pl0uUQ",
)
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin-allow-popups"
PAYPAL_SIGNATURE = config("PAYPAL_SIGNATURE", default="")

X_FRAME_OPTIONS = "SAMEORIGIN"
SILENCED_SYSTEM_CHECKS = ["security.W019"]
SITE_ID = 1

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    'web.middlewares.SiteSuspensionMiddleware',
]

ROOT_URLCONF = "skydays.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "web.context_processors.main_context",
            ]
        },
    }
]

WSGI_APPLICATION = "skydays.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": config("DB_ENGINE", default="django.db.backends.sqlite3"),
        "NAME": config("DB_NAME", default=BASE_DIR / "db.sqlite3"),
        "USER": config("DB_USER", default=""),
        "PASSWORD": config("DB_PASSWORD", default=""),
        "HOST": config("DB_HOST", default=""),
        "PORT": "",
    }
}

CORS_ALLOW_ALL_ORIGINS = True
# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_L10N = True
USE_TZ = True


USE_L10N = False
DATE_INPUT_FORMATS = (
    "%d/%m/%Y",
    "%d-%m-%Y",
    "%d/%m/%y",
    "%d %b %Y",
    "%d %b, %Y",
    "%d %b %Y",
    "%d %b, %Y",
    "%d %B, %Y",
    "%d %B %Y",
)
DATETIME_INPUT_FORMATS = (
    "%d/%m/%Y %H:%M:%S",
    "%d/%m/%Y %H:%M",
    "%d/%m/%Y",
    "%d/%m/%y %H:%M:%S",
    "%d/%m/%y %H:%M",
    "%d/%m/%y",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%d %H:%M",
    "%Y-%m-%d",
)
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
STATIC_URL = "/static/"
STATIC_FILE_ROOT = BASE_DIR / "static"
STATICFILES_DIRS = ((BASE_DIR / "static"),)
STATIC_ROOT = BASE_DIR / "assets"

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

VERSATILEIMAGEFIELD_SETTINGS = {
    "cache_length": 2592000,
    "cache_name": "versatileimagefield_cache",
    "jpeg_resize_quality": 70,
    "sized_directory_name": "__sized__",
    "filtered_directory_name": "__filtered__",
    "placeholder_directory_name": "__placeholder__",
    "create_images_on_demand": True,
    "image_key_post_processor": None,
    "progressive_jpeg": False,
}

CURRENCIES = ("INR", "USD", "EUR", "AED")
EXCHANGE_BACKEND = "djmoney.contrib.exchange.backends.OpenExchangeRatesBackend"
OPEN_EXCHANGE_RATES_APP_ID = "46c4e94037e04c04bac2dad55809d2ac"

EMAIL_HOST = config("EMAIL_HOST", default="smtp-relay.sendinblue.com")
EMAIL_PORT = config("EMAIL_PORT", default=587)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="secure.skydays@gmail.com")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", "zqts1MmW2F3nAwJ4")
EMAIL_USE_TLS = True

DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default=EMAIL_HOST_USER)
DEFAULT_BCC_EMAIL = config("DEFAULT_BCC_EMAIL", default=EMAIL_HOST_USER)
DEFAULT_REPLY_TO_EMAIL = config("DEFAULT_REPLY_TO_EMAIL", default=EMAIL_HOST_USER)
SERVER_EMAIL = config("SERVER_EMAIL", default=EMAIL_HOST_USER)
ADMIN_EMAIL = config("ADMIN_EMAIL", default=EMAIL_HOST_USER)
EMAIL_RECEIVERS = ["gmholidays@skydays.travel"]

SITE_SUSPENDED = config("IS_SUSPENDED", default=False, cast=bool)
