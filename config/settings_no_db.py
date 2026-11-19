"""A minimal Django settings module that disables the database.
It imports the full production settings and then overrides DATABASES to an empty dict.
This is useful for UI‑only checks where the backend does not need to access MongoDB.
"""

from .settings import *  # noqa: F401,F403

# Disable all database connections
DATABASES = {}

# Prevent migration checks (optional)
MIGRATION_MODULES = {app_label: None for app_label in INSTALLED_APPS}

# Allow any host for local testing
ALLOWED_HOSTS = ['*']
