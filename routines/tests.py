from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from routines.models import Routine, RoutineStep, DailyCompletion
from datetime import date


class AddRoutineViaProfileTest(TestCase):
	def setUp(self):
		self.username = 'testuser'
		self.password = 'testpass123'
		self.user = User.objects.create_user(username=self.username, password=self.password)

	def test_post_add_routine_creates_routine_and_steps(self):
		self.client.login(username=self.username, password=self.password)
		url = reverse('routines:add')
		data = {
			'routine_name': 'Test Routine',
			'routine_type': 'morning',
			'step1': 'Cleanse',
			'step2': 'Tone',
			'step3': 'Moisturize',
		}
		response = self.client.post(url, data, follow=True)
		# Should redirect back to profile
		self.assertEqual(response.status_code, 200)
		# Routine created
		routine = Routine.objects.filter(user=self.user, name='Test Routine').first()
		self.assertIsNotNone(routine)
		steps = list(routine.steps.order_by('order').values_list('step_name', flat=True))
		self.assertIn('Cleanse', steps)
		self.assertIn('Tone', steps)
		self.assertIn('Moisturize', steps)

	def test_post_add_routine_missing_name_shows_error(self):
		self.client.login(username=self.username, password=self.password)
		url = reverse('routines:add')
		data = {
			'routine_name': '',
			'routine_type': 'morning',
			'step1': 'Cleanse',
		}
		response = self.client.post(url, data, follow=True)
		# Should redirect back to profile and render with errors (status 200)
		self.assertEqual(response.status_code, 200)
		# No routine should be created
		routine = Routine.objects.filter(user=self.user, routine_type='morning').first()
		self.assertIsNone(routine)
		# Error message should be in response content
		self.assertContains(response, 'Please provide a name for your routine')

	def test_post_add_routine_no_steps_shows_error(self):
		self.client.login(username=self.username, password=self.password)
		url = reverse('routines:add')
		data = {
			'routine_name': 'No Steps',
			'routine_type': 'evening',
		}
		response = self.client.post(url, data, follow=True)
		self.assertEqual(response.status_code, 200)
		routine = Routine.objects.filter(user=self.user, name='No Steps').first()
		self.assertIsNone(routine)
		self.assertContains(response, 'Add at least one step for the routine')

	def test_profile_shows_inline_success_after_create(self):
		"""After creating a routine via the add endpoint, profile should show inline success with name and link."""
		self.client.login(username=self.username, password=self.password)
		url = reverse('routines:add')
		data = {
			'routine_name': 'Inline Success Routine',
			'routine_type': 'morning',
			'step1': 'Cleanse',
		}
		response = self.client.post(url, data, follow=True)
		# should end up rendering profile
		self.assertEqual(response.status_code, 200)
		# routine created
		routine = Routine.objects.filter(user=self.user, name='Inline Success Routine').first()
		self.assertIsNotNone(routine)
		# profile should contain the inline success block with the routine name and the dashboard URL
		detail_url = reverse('routines:dashboard')
		self.assertContains(response, 'Added')
		self.assertContains(response, 'Inline Success Routine')
		self.assertContains(response, detail_url)

	def test_ajax_add_routine_returns_json(self):
		"""Simulate an AJAX POST and assert a JSON success response and created routine."""
		self.client.login(username=self.username, password=self.password)
		url = reverse('routines:add')
		data = {
			'routine_name': 'AJAX Routine',
			'routine_type': 'morning',
			'step1': 'Cleanse',
		}
		response = self.client.post(url, data, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
		# should be JSON
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response['Content-Type'], 'application/json')
		import json
		body = json.loads(response.content.decode())
		self.assertTrue(body.get('success'))
		self.assertIn('detail_url', body)
		# routine persisted
		routine = Routine.objects.filter(user=self.user, name='AJAX Routine').first()
		self.assertIsNotNone(routine)


class RoutineChecklistCompletionTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.login(username='testuser', password='testpass')
        self.routine = Routine.objects.create(user=self.user, name='Morning', routine_type='morning')
        self.step1 = RoutineStep.objects.create(routine=self.routine, step_name='Cleanse', order=1)
        self.step2 = RoutineStep.objects.create(routine=self.routine, step_name='Moisturize', order=2)

    def test_mark_step_completed_creates_dailycompletion(self):
        today = date.today()
        url = reverse('routines:dashboard')
        # Simulate checking the step as completed
        data = {
            'routine_id': self.routine.id,
            f'completed_{self.step1.id}': '1'
        }
        response = self.client.post(url, data, follow=True)
        self.assertEqual(response.status_code, 200)
        # Check that a DailyCompletion record exists for today
        dc = DailyCompletion.objects.filter(user=self.user, routine_step=self.step1, date=today, completed=True).first()
        self.assertIsNotNone(dc)

    def test_mark_multiple_steps_completed(self):
        today = date.today()
        url = reverse('routines:dashboard')
        data = {
            'routine_id': self.routine.id,
            f'completed_{self.step1.id}': '1',
            f'completed_{self.step2.id}': '1',
        }
        response = self.client.post(url, data, follow=True)
        self.assertEqual(response.status_code, 200)
        dc1 = DailyCompletion.objects.filter(user=self.user, routine_step=self.step1, date=today, completed=True).first()
        dc2 = DailyCompletion.objects.filter(user=self.user, routine_step=self.step2, date=today, completed=True).first()
        self.assertIsNotNone(dc1)
        self.assertIsNotNone(dc2)

    def test_add_routine_and_steps(self):
        url = reverse('routines:add')
        data = {
            'routine_name': 'Evening Routine',
            'routine_type': 'evening',
            'step1': 'Remove Makeup',
            'step2': 'Serum',
        }
        response = self.client.post(url, data, follow=True)
        self.assertEqual(response.status_code, 200)
        routine = Routine.objects.filter(user=self.user, name='Evening Routine').first()
        self.assertIsNotNone(routine)
        steps = list(routine.steps.order_by('order').values_list('step_name', flat=True))
        self.assertIn('Remove Makeup', steps)
        self.assertIn('Serum', steps)

    def test_dashboard_shows_routine_and_steps(self):
        url = reverse('routines:dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Morning')
        self.assertContains(response, 'Cleanse')
        self.assertContains(response, 'Moisturize')

    def test_mark_step_not_completed(self):
        today = date.today()
        # First, mark as completed
        DailyCompletion.objects.create(user=self.user, routine_step=self.step1, date=today, completed=True)
        url = reverse('routines:dashboard')
        data = {
            'routine_id': self.routine.id,
            # Do NOT include completed_{self.step1.id} to simulate unchecking
        }
        response = self.client.post(url, data, follow=True)
        self.assertEqual(response.status_code, 200)
        dc = DailyCompletion.objects.filter(user=self.user, routine_step=self.step1, date=today).first()
        self.assertIsNotNone(dc)
        self.assertFalse(dc.completed)

    def test_dashboard_includes_routine_events_json(self):
        url = reverse('routines:dashboard')
        response = self.client.get(url)
        # The dashboard now embeds data via JSON script tags instead of legacy globals
        self.assertContains(response, 'id="routine-events"')

    def test_user_cannot_update_another_users_routine(self):
        other_user = User.objects.create_user(username='other', password='otherpass')
        other_routine = Routine.objects.create(user=other_user, name='Other Routine', routine_type='morning')
        other_step = RoutineStep.objects.create(routine=other_routine, step_name='Other Step', order=1)
        url = reverse('routines:dashboard')
        data = {
            'routine_id': other_routine.id,
            f'completed_{other_step.id}': '1',
        }
        response = self.client.post(url, data, follow=True)
        self.assertEqual(response.status_code, 200)
        dc = DailyCompletion.objects.filter(user=other_user, routine_step=other_step, date=date.today()).first()
        self.assertIsNone(dc)
