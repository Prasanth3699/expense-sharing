from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from api.models import CustomUser, Expense
from rest_framework_simplejwt.tokens import RefreshToken

class UserRegistrationTest(APITestCase):
    def test_user_registration(self):
        """
        Ensure a user can register successfully.
        """
        url = reverse('register_user')
        data = {
            "username": "john_doe",
            "email": "john@example.com",
            "password": "P@ssw0rd_123!",
            "mobile_number": "1234567890"
        }
        response = self.client.post(url, data, format='json')

        # Print the response data for debugging purposes
        print(response.data)

        # Ensure the response status is correct
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'User created successfully.')


class JWTAuthenticationTest(APITestCase):
    def setUp(self):
        """
        Create a user to test JWT authentication.
        """
        self.user = CustomUser.objects.create_user(
            username="john_doe", email="john@example.com", mobile_number="1234567890", password="password123"
        )

    def test_obtain_token(self):
        """
        Ensure a user can obtain a JWT token with valid credentials.
        """
        url = reverse('token_obtain_pair')
        data = {"username": "john_doe", "password": "password123"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)  # Ensure the token is present

    def test_access_protected_route(self):
        """
        Ensure that a protected route can be accessed with a valid JWT token.
        """
        # Obtain a token
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        # Set the Authorization header with the token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Test accessing a protected endpoint
        url = reverse('get_user_details', args=[self.user.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'john_doe')

class ExpenseTest(APITestCase):
    def setUp(self):
        """
        Create a user and authenticate with a JWT token.
        """
        self.user = CustomUser.objects.create_user(
            username="john_doe", email="john@example.com", mobile_number="1234567890", password="password123"
        )
        # Obtain a JWT token for the user
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        # Authenticate with the token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_create_expense(self):
        """
        Ensure an authenticated user can create an expense.
        """
        url = reverse('add_expense')
        data = {
            "name": "Lunch",
            "created_by": self.user.id,
            "total_amount": "300.00",
            "split_type": "EQUAL",
            "participants": [
                {"user_id": self.user.id, "amount_owed": "150.00"}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('expense_id', response.data)

  
    def test_get_user_expenses(self):
        """
        Ensure expenses created by the user can be retrieved.
        """
        # Create an expense for the user
        expense = Expense.objects.create(
            name="Dinner", created_by=self.user, total_amount=500.00, split_type="EQUAL"
        )

        # Verify the expense exists
        url = reverse('get_user_expenses', args=[self.user.id])
        response = self.client.get(url)

        print(response.data)  # Debugging output

        # Verify the response contains the expected data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Dinner')

    def test_download_latest_expense(self):
        """
        Ensure the latest expense can be downloaded as a CSV.
        """
        # Create an expense for the user
        expense = Expense.objects.create(
            name="Trip", created_by=self.user, total_amount=1000.00, split_type="EQUAL"
        )

        # Ensure the expense exists before downloading
        url = reverse('download_latest_expense', args=[self.user.id])
        response = self.client.get(url)

        print(response.status_code)  # Debugging output

        # Verify that the response is successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('attachment; filename="latest_expense_', response['Content-Disposition'])
