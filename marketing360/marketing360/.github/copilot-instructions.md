# Copilot Instructions for `prospello/marketing360`

These notes help AI coding agents work productively in this Django website codebase. Stick to the observed patterns and files referenced here.

## Architecture Overview
- **Framework:** Django 4.x single project (`marketing360`) with one app `web`.
- **Entry points:** `manage.py` sets `DJANGO_SETTINGS_MODULE=marketing360.settings`. Root URLs in `marketing360/urls.py` delegate to `web.urls` (see `web/urls.py`).
- **Views & Templates:** `web/views.py` renders templates under `templates/web/**`. Views mostly return static pages with small context flags like `is_dark_navbar` and route-specific booleans (e.g., `is_index`, `is_courses`).
- **Models & Data:** `web/models.py` defines `Mentor`, `HiringPartner`, `BlogPost`, `Contact`, `Tool`. These power homepage and courses pages. Images are stored under `media/mentors/**`, `media/partners/**`, `media/blog/**`, `media/tools/**`.
- **Static & Media:** Static assets under `static/**` (including admin theme assets). Media uploads under `media/**`. `settings.py` sets `MEDIA_URL`, `MEDIA_ROOT`, `STATIC_URL`, `STATICFILES_DIRS`, `STATIC_ROOT`.
- **Admin/UI:** Uses `admin_interface`, `colorfield`, `import_export`. Expect custom Admin styling and import/export in Django Admin.

## Configuration & Environment
- **Secrets & env:** `settings.py` uses `python-decouple` via `decouple.config`. Provide environment variables where applicable:
  - `SECRET_KEY`, `DEBUG` (bool), `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`.
- **Defaults:** If env vars are absent, defaults are SQLite at `BASE_DIR/db.sqlite3` and `DEBUG=True`.
- **Security:** `X_FRAME_OPTIONS="SAMEORIGIN"`; `SILENCED_SYSTEM_CHECKS=['security.W019']`. Leave as-is unless explicitly changing security posture.

## Developer Workflows
- **Run dev server:**
  - `python ./manage.py runserver`
- **Migrations:**
  - Make: `python ./manage.py makemigrations web`
  - Apply: `python ./manage.py migrate`
- **Admin media/static:** Ensure `MEDIA_ROOT` and `STATICFILES_DIRS` are respected. For production collect:
  - `python ./manage.py collectstatic`
- **Data loading:** A sample fixture exists: `fixtures/2025_10_18_03_59_AM.json`. Load with:
  - `python ./manage.py loaddata fixtures/2025_10_18_03_59_AM.json`

## URL & View Patterns
- **URL schema:** `web/urls.py` includes routes like `/courses/`, `/mentors/`, `/centers/`, `/webinars/`, `/faq/`, `/communities/`, `/about/`, `/contact/`, `/refer/`, `/case_studies/`, `/blog/`, policy pages, and `/courses/digital-marketing/`.
- **Context flags:** Views set booleans used by templates, e.g., `is_dark_navbar=True`, and page flags like `is_index`, `is_courses`. Maintain this convention when adding new pages.
- **Data usage:**
  - `index`: queries `Mentor`, `HiringPartner`, `BlogPost` (top 3 by date).
  - `courses`: queries `Tool`, `Mentor`, `HiringPartner`.
  - Other views are static render with flags.
- **Template locations:** Pages live in `templates/web/*.html` and subfolders like `templates/web/courses/*.html`. Ensure template names align with view names.

## Models & Media Conventions
- **Ordering:** All models specify `Meta.ordering` (typically `['-name']` or `['-date']`). Preserve ordering semantics for new models.
- **Image fields:** Use `upload_to` consistent with existing paths: `mentors/`, `mentors/logos/`, `partners/`, `blog/`, `tools/`.
- **Absolute URLs:** `BlogPost.get_absolute_url` returns `#` (placeholder). If introducing detail pages, implement proper slugs and URLs consistently.

## Admin & Third-Party
- **admin_interface:** Custom admin theming; do not break static paths under `static/admin_interface/**`.
- **import_export:** For admin data import/export; adding models to admin should consider import-export integration.

## Project Conventions
- **Templates:** Use page-specific context flags. Avoid heavy logic in templates; views should assemble minimal context.
- **Static structure:** Keep assets under existing folders (`static/web/**`, `static/admin/**`). New assets should follow similar grouping.
- **Time zone & formats:** `TIME_ZONE='Asia/Kolkata'`. `DATE_INPUT_FORMATS` and `DATETIME_INPUT_FORMATS` are customized in `settings.py`; respect these for forms and serializers.

## Adding Features (Examples)
- **New static page:**
  1) Add view in `web/views.py` with `is_<page>` and `is_dark_navbar=True`.
  2) Add route in `web/urls.py`.
  3) Create `templates/web/<page>.html`.
- **Model-backed listing:**
  - Define model in `web/models.py` with `Meta.ordering` and `upload_to` if images.
  - Run migrations; render via a new view querying the model.

## Testing & Linting
- **Tests:** Minimal scaffold at `web/tests.py`. If adding tests, keep them within the `web` app.
- **Requirements:** See `requirements.txt`; ensure new libs are added there and imported via env-managed settings (decouple) when appropriate.

## Files to Reference
- `marketing360/settings.py`, `marketing360/urls.py`
- `web/views.py`, `web/urls.py`, `web/models.py`
- `templates/web/**`, `static/**`, `media/**`
- `fixtures/2025_10_18_03_59_AM.json`

If any of the above feels incomplete or unclear (e.g., missing URL patterns, admin registration details, or deployment specifics), tell us which sections to expand and we’ll iterate.
