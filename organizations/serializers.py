from rest_framework import serializers
from .models import Organization


class OrganizationBriefSerializer(serializers.ModelSerializer):
    available_capacity_kg = serializers.FloatField(read_only=True)

    class Meta:
        model = Organization
        fields = [
            'id',
            'name',
            'contact_email',
            'phone',
            'address',
            'latitude',
            'longitude',
            'is_verified',
            'max_capacity_kg',
            'available_capacity_kg',
            'beneficiary_count',
        ]


class OrganizationSerializer(serializers.ModelSerializer):
    available_capacity_kg = serializers.FloatField(read_only=True)

    class Meta:
        model = Organization
        fields = [
            'id',
            'user',
            'name',
            'registration_number',
            'contact_email',
            'phone',
            'address',
            'latitude',
            'longitude',
            'is_verified',
            'max_capacity_kg',
            'current_load_kg',
            'available_capacity_kg',
            'accepted_food_types',
            'operating_hours_start',
            'operating_hours_end',
            'beneficiary_count',
            'total_rescued_kg',
            'total_pickups_completed',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'is_verified', 'total_rescued_kg', 'total_pickups_completed', 'created_at']
