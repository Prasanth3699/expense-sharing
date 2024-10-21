# api/serializers.py

from rest_framework import serializers
from .models import CustomUser, Expense, ExpenseParticipant
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from decimal import Decimal, ROUND_HALF_UP

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    mobile_number = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())]
    )

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'mobile_number')

    def create(self, validated_data):
        user = CustomUser.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            mobile_number=validated_data['mobile_number']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class ExpenseParticipantSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source='user',
        write_only=True
    )
    username = serializers.CharField(source='user.username', read_only=True)
    # Fields for EXACT and PERCENTAGE splits
    amount_owed = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    percentage_owed = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = ExpenseParticipant
        fields = ('user_id', 'username', 'amount_owed', 'percentage_owed')

class ExpenseSerializer(serializers.ModelSerializer):
    participants = ExpenseParticipantSerializer(many=True)
    created_by = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        write_only=True
    )
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Expense
        fields = ('id', 'name','created_by', 'created_by_username', 'total_amount', 'split_type', 'created_at', 'participants')
        read_only_fields = ('id', 'created_at', 'created_by_username')

    def validate(self, data):
        split_type = data.get('split_type')
        participants = data.get('participants')
        total_amount = data.get('total_amount')

        if split_type not in dict(Expense.SPLIT_CHOICES):
            raise serializers.ValidationError("Invalid split type.")

        if not participants:
            raise serializers.ValidationError("At least one participant is required.")

        # Validate based on split type
        if split_type == 'EXACT':
            sum_amounts = Decimal('0.00')
            for participant in participants:
                amount = participant.get('amount_owed')
                if amount is None:
                    raise serializers.ValidationError("All participants must have 'amount_owed' for EXACT split.")
                if amount < 0:
                    raise serializers.ValidationError("'amount_owed' must be non-negative.")
                sum_amounts += amount
            if sum_amounts != total_amount:
                raise serializers.ValidationError(f"Sum of exact amounts {sum_amounts} does not equal total amount {total_amount}.")
        
        elif split_type == 'PERCENTAGE':
            sum_percent = Decimal('0.00')
            for participant in participants:
                percent = participant.get('percentage_owed')
                if percent is None:
                    raise serializers.ValidationError("All participants must have 'percentage_owed' for PERCENTAGE split.")
                if percent < 0:
                    raise serializers.ValidationError("'percentage_owed' must be non-negative.")
                sum_percent += percent
            if sum_percent != Decimal('100.00'):
                raise serializers.ValidationError(f"Sum of percentages {sum_percent} does not equal 100%.")
        
        elif split_type == 'EQUAL':
            # For equal split, ensure total_amount is positive and participants are non-empty
            if total_amount <= 0:
                raise serializers.ValidationError("Total amount must be greater than zero for EQUAL split.")

        return data

    def create(self, validated_data):
        participants_data = validated_data.pop('participants')
        expense = Expense.objects.create(**validated_data)
        split_type = expense.split_type
        total_amount = expense.total_amount
        num_participants = len(participants_data)

        if split_type == 'EQUAL':
            # Calculate equal share, handle rounding to ensure total matches
            equal_share = (total_amount / num_participants).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            shares = [equal_share for _ in range(num_participants)]
            # Adjust the last participant's share to account for any rounding discrepancies
            total_assigned = sum(shares)
            discrepancy = total_amount - total_assigned
            if discrepancy != Decimal('0.00'):
                shares[-1] += discrepancy

            for participant_data, share in zip(participants_data, shares):
                ExpenseParticipant.objects.create(
                    expense=expense,
                    user=participant_data['user'],
                    amount_owed=share
                )

        elif split_type == 'EXACT':
            for participant_data in participants_data:
                ExpenseParticipant.objects.create(
                    expense=expense,
                    user=participant_data['user'],
                    amount_owed=participant_data['amount_owed']
                )

        elif split_type == 'PERCENTAGE':
            for participant_data in participants_data:
                percentage = participant_data['percentage_owed']
                amount = (percentage / Decimal('100.00')) * total_amount
                # Round the amount to 2 decimal places
                amount = amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                ExpenseParticipant.objects.create(
                    expense=expense,
                    user=participant_data['user'],
                    percentage_owed=percentage,
                    amount_owed=amount
                )

        return expense
