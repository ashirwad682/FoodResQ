from django.apps import AppConfig


class MatchingConfig(AppConfig):
    default_auto_field = 'django_mongodb_backend.fields.ObjectIdAutoField'
    name = 'matching'
    verbose_name = 'Smart NGO & Volunteer Priority Engine'
