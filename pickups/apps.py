from django.apps import AppConfig


class PickupsConfig(AppConfig):
    default_auto_field = 'django_mongodb_backend.fields.ObjectIdAutoField'
    name = 'pickups'
    verbose_name = 'Pickup Requests & Workflow Management'
