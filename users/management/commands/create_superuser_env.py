from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
    help = "Create superuser from environment variables if not exists"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        username = os.getenv("DJANGO_SUPERUSER_USERNAME")
        email = os.getenv("DJANGO_SUPERUSER_EMAIL")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

        # Validate presence of required env vars
        if not all([username, password]):
            self.stdout.write(
                "One or more environment variables are missing. "
                "Required: DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_PASSWORD. "
                "Optional: DJANGO_SUPERUSER_EMAIL"
            )
            return

        # Create superuser if not present
        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email or "", password=password)
            self.stdout.write(f'Superuser "{username}" created.')
        else:
            self.stdout.write(f'Superuser "{username}" already exists.')
