web: gunicorn config.wsgi
release: python manage.py migrate --noinput && python manage.py create_superuser_env || echo "release step completed"
