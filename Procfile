web: gunicorn config.wsgi
release: python manage.py migrate --noinput && if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then python manage.py create_superuser_env; else echo "One or more environment variables are missing..."; fi
release: python manage.py migrate && python manage.py createsuperuser --noinput
