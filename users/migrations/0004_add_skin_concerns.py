"""
Migration to add skin_concerns field if missing.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_userprofile_additional_notes_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='skin_concerns',
            field=models.TextField(blank=True, help_text='Describe your main skin concerns'),
        ),
    ]
