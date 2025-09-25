from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Routine(models.Model):
    """A skincare routine (e.g., Morning Routine, Evening Routine)"""
    ROUTINE_CHOICES = [
        ('morning', 'Morning'),
        ('evening', 'Evening'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    routine_type = models.CharField(max_length=10, choices=ROUTINE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"
    
    class Meta:
        unique_together = ['user', 'routine_type']  # One morning, one evening per user


class RoutineStep(models.Model):
    """Individual steps within a routine"""
    routine = models.ForeignKey(Routine, on_delete=models.CASCADE, related_name='steps')
    step_name = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.routine.name} - {self.step_name}"
    
    class Meta:
        ordering = ['order']


class DailyCompletion(models.Model):
    """Track completion of routine steps for specific dates"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    routine_step = models.ForeignKey(RoutineStep, on_delete=models.CASCADE)
    date = models.DateField()
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.routine_step.step_name} - {self.date}"
    
    class Meta:
        unique_together = ['user', 'routine_step', 'date']  # One completion record per step per day
