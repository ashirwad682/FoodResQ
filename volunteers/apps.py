from django.apps import AppConfig


class VolunteersConfig(AppConfig):
    default_auto_field = 'django_mongodb_backend.fields.ObjectIdAutoField'
    name = 'volunteers'
    verbose_name = 'Volunteer Network Management'
