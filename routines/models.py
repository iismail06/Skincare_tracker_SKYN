from django.conf import settings
from django.db import models


class Routine(models.Model):
    ROUTINE_CHOICES = [
        ('morning', 'Morning'),
        ('evening', 'Evening'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('hair', 'Hair'),
        ('body', 'Body'),
        ('special', 'Special'),
        ('seasonal', 'Seasonal'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    routine_type = models.CharField(max_length=10, choices=ROUTINE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.name} ({self.routine_type})"


class RoutineStep(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    routine = models.ForeignKey('Routine', related_name='steps', on_delete=models.CASCADE)
    step_name = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    product = models.ForeignKey('products.Product', null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.step_name} ({self.routine.routine_type})"


class DailyCompletion(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    routine_step = models.ForeignKey('RoutineStep', on_delete=models.CASCADE)
    date = models.DateField()
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'routine_step', 'date')

    def __str__(self):
        status = '✅' if self.completed else '⬜'
        return f"{self.user} {status} {self.routine_step.step_name} on {self.date}"
