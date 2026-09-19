from django.apps import AppConfig


class DonationsConfig(AppConfig):
    default_auto_field = 'django_mongodb_backend.fields.ObjectIdAutoField'
    name = 'donations'
    verbose_name = 'Food Donations Management'
