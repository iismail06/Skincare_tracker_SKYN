from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from routines.models import Routine, RoutineStep


class AddRoutineViaProfileTest(TestCase):
	def setUp(self):
		self.username = 'testuser'
		self.password = 'testpass123'
		self.user = User.objects.create_user(username=self.username, password=self.password)

	def test_post_add_routine_creates_routine_and_steps(self):
		self.client.login(username=self.username, password=self.password)
		url = reverse('routines:add_routine')
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
		url = reverse('routines:add_routine')
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
		url = reverse('routines:add_routine')
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
		url = reverse('routines:add_routine')
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
		url = reverse('routines:add_routine')
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
