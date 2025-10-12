from django.contrib import admin
from .models import Routine, RoutineStep, DailyCompletion


# Register your models here.

@admin.register(Routine)
class RoutineAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'routine_type', 'created_at']
    list_filter = ['routine_type', 'created_at']
    search_fields = ['name', 'user__username']


@admin.register(RoutineStep)
class RoutineStepAdmin(admin.ModelAdmin):
    list_display = ['step_name', 'routine', 'order']
    list_filter = ['routine__routine_type']
    search_fields = ['step_name', 'routine__name']
    ordering = ['routine', 'order']


@admin.register(DailyCompletion)
class DailyCompletionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'routine_step', 'date', 'completed', 'completed_at'
    ]
    list_filter = [
        'completed', 'date', 'routine_step__routine__routine_type'
    ]
    search_fields = ['user__username', 'routine_step__step_name']
