import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'foodresq-secret-key-production-ready-jwt-secure-mongodb-2026'
)

DEBUG = True

ALLOWED_HOSTS = ['*', '.vercel.app', 'localhost', '127.0.0.1']

INSTALLED_APPS = [
    'config.apps.MongoAdminConfig',
    'config.apps.MongoAuthConfig',
    'config.apps.MongoContentTypesConfig',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_mongodb_backend',
    
    # Third party packages
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    
    # FoodResQ Applications
    'accounts',
    'organizations',
    'donations',
    'pickups',
    'volunteers',
    'matching',
    'notifications',
    'analytics',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# MongoDB Database Configuration using django_mongodb_backend
ATLAS_URI = (
    'mongodb+srv://ashirwad682_db_user:7PRhEeR2zXia0ZXm@foodresq.iphq7jm.mongodb.net/foodresq_db?retryWrites=true&w=majority&appName=FoodResQ'
)
DEFAULT_LOCAL_URI = 'mongodb://localhost:27017/foodresq_db'

env_file = BASE_DIR / '.env'
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

env_uri = os.environ.get('MONGODB_URI')
if env_uri:
    SELECTED_MONGO_URI = env_uri.strip()
    # Ensure database path is included if URI is root cluster URL
    if '@' in SELECTED_MONGO_URI and '/' not in SELECTED_MONGO_URI.split('@')[-1].split('?')[0]:
        if '?' in SELECTED_MONGO_URI:
            base, qs = SELECTED_MONGO_URI.split('?', 1)
            SELECTED_MONGO_URI = f"{base.rstrip('/')}/foodresq_db?{qs}"
        else:
            SELECTED_MONGO_URI = f"{SELECTED_MONGO_URI.rstrip('/')}/foodresq_db"
else:
    SELECTED_MONGO_URI = ATLAS_URI

# Verify connectivity on startup
try:
    import pymongo
    client = pymongo.MongoClient(SELECTED_MONGO_URI, serverSelectionTimeoutMS=4000)
    client.admin.command('ping')
    print("✓ Connected directly to MongoDB Atlas Cloud Cluster.")
except Exception as e:
    print(f"⚠️  MongoDB Atlas connection notice: {e}")

DATABASES = {
    'default': {
        'ENGINE': 'django_mongodb_backend',
        'HOST': SELECTED_MONGO_URI,
        'NAME': 'foodresq_db',
    }
}

DATABASE_ROUTERS = ["django_mongodb_backend.routers.MongoRouter"]

# Default auto field for MongoDB ObjectId primary keys
DEFAULT_AUTO_FIELD = 'django_mongodb_backend.fields.ObjectIdAutoField'

MIGRATION_MODULES = {
    'admin': 'mongo_migrations.admin',
    'auth': 'mongo_migrations.auth',
    'contenttypes': 'mongo_migrations.contenttypes',
}

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 6},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# SimpleJWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=14),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# drf-spectacular Documentation Settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'FoodResQ API',
    'DESCRIPTION': (
        'Complete REST API for FoodResQ Smart Food Rescue Platform. '
        'Supports Donors, NGOs, Volunteers, and Admins with smart matching, '
        'pickup lifecycle tracking, notifications, and impact analytics.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SCHEMA_PATH_PREFIX': '/api/',
    'COMPONENT_SPLIT_REQUEST': True,
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
