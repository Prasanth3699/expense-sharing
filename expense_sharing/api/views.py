
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import CustomUser, Expense, ExpenseParticipant
from .serializers import UserSerializer, ExpenseSerializer, ExpenseParticipantSerializer
from django.shortcuts import get_object_or_404
import csv
from django.http import HttpResponse

# User Endpoints

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user.
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({'message': 'User created successfully.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request, user_id):
    """
    Retrieve user details by user_id.
    """
    user = get_object_or_404(CustomUser, id=user_id)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Expense Endpoints

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_expense(request):
    """
    Add a new expense.
    """
    serializer = ExpenseSerializer(data=request.data)
    if serializer.is_valid():
        expense = serializer.save()
        return Response({'message': 'Expense added successfully.', 'expense_id': expense.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_expenses(request, user_id):
    """
    Retrieve individual user expenses.
    """
    user = get_object_or_404(CustomUser, id=user_id)
    expenses = Expense.objects.filter(participants__user=user).distinct()
    serializer = ExpenseSerializer(expenses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_by_username(request):
    """
    Retrieve user details by username.
    """
    username = request.query_params.get('username')
    if not username:
        return Response({"error": "Username query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    user = CustomUser.objects.filter(username=username).first()
    if not user:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_expense(request, user_id):
    """
    Get the latest expense for the given user.
    """
    latest_expense = Expense.objects.filter(participants__user__id=user_id).order_by('-created_at').first()
    if latest_expense:
        serializer = ExpenseSerializer(latest_expense)
        return Response(serializer.data)
    return Response({"detail": "No expenses found."}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_overall_expenses(request):
    """
    Retrieve overall expenses for all users.
    """
    expenses = Expense.objects.all()
    serializer = ExpenseSerializer(expenses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_balance_sheet(request):
    """
    Download selected expenses as a CSV file.
    Optional query parameter: expense_ids to filter by specific expenses.
    """
    expense_ids = request.query_params.get('expense_ids')
    
    # Filter by selected expense IDs if provided
    if expense_ids:
        expense_ids = [int(id) for id in expense_ids.split(",")]
        expenses = Expense.objects.filter(id__in=expense_ids)
    else:
        expenses = Expense.objects.all()

    # Create the HttpResponse object with CSV header
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="selected_expenses.csv"'

    writer = csv.writer(response)

    # Write the CSV header
    writer.writerow([
        'Expense ID', 'Name', 'Total Amount', 'Split Type', 'Created At',
        'Participant Username', 'Amount Owed', 'Percentage Owed'
    ])

    # Write detailed expense and participant information
    for expense in expenses:
        for participant in expense.participants.all():
            writer.writerow([
                expense.id,
                expense.name,
                expense.total_amount,
                expense.split_type,
                expense.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                participant.user.username,
                participant.amount_owed if participant.amount_owed else '',
                participant.percentage_owed if participant.percentage_owed else '',
            ])

    return response




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_latest_expense(request, user_id):
    """
    Download the latest expense as a CSV file.
    """
    latest_expense = Expense.objects.filter(participants__user__id=user_id).order_by('-created_at').first()
    if not latest_expense:
        return HttpResponse("No expense found.", status=404)

    # Create the HTTP response with the CSV header.
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="latest_expense_{latest_expense.id}.csv"'

    writer = csv.writer(response)
    # Write header
    writer.writerow(['Expense Name', 'Total Amount', 'Split Type', 'Created At', 'Participant', 'Amount Owed', 'Percentage Owed'])

    # Write data for each participant
    for participant in latest_expense.participants.all():
        writer.writerow([
            latest_expense.name,
            latest_expense.total_amount,
            latest_expense.split_type,
            latest_expense.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            participant.user.username,
            participant.amount_owed if participant.amount_owed else '',
            participant.percentage_owed if participant.percentage_owed else '',
        ])

    return response

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['user_id'] = user.id
        token['username'] = user.username

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user_id to the response
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
