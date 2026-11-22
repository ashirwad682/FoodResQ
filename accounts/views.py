from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import User, UserRole, DonorProfile, VolunteerProfile
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    DonorProfileSerializer,
    VolunteerProfileSerializer,
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field, '')
        if username_or_email:
            raw_input = username_or_email.strip()
            # 1. Resolve registered email to user's username
            user_by_email = User.objects.filter(email__iexact=raw_input).first()
            if user_by_email:
                attrs[self.username_field] = user_by_email.username
            else:
                # 2. Case-insensitive username lookup
                user_by_uname = User.objects.filter(username__iexact=raw_input).first()
                if user_by_uname:
                    attrs[self.username_field] = user_by_uname.username

        data = super().validate(attrs)
        user_serializer = UserSerializer(self.user)
        data['user'] = user_serializer.data
        return data


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Login with username/password. Returns JWT access, refresh tokens and user profile.
    """
    serializer_class = CustomTokenObtainPairSerializer


class DemoLoginView(APIView):
    """
    POST /api/auth/demo-login/
    LOCALHOST ONLY: Instant 1-click authentication for testing role dashboards.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        host = request.get_host().split(':')[0]
        # Only permit on localhost / 127.0.0.1 or in debug mode
        if host not in ['localhost', '127.0.0.1', '0.0.0.0', 'testserver'] and not settings.DEBUG:
            return Response({'error': 'Demo login is only permitted in local development.'}, status=status.HTTP_403_FORBIDDEN)

        role = request.data.get('role', '').upper()
        role_map = {
            UserRole.DONOR: ('donor_spice', 'Donor@12345'),
            UserRole.NGO: ('ngo_feedhope', 'Ngo@12345'),
            UserRole.VOLUNTEER: ('vol_arun', 'Volunteer@12345'),
            UserRole.ADMIN: ('admin', 'Admin@12345'),
        }

        if role not in role_map:
            return Response({'error': f"Invalid role '{role}'."}, status=status.HTTP_400_BAD_REQUEST)

        username, default_pass = role_map[role]
        user = User.objects.filter(username=username).first()
        if not user:
            user = User.objects.filter(role=role).first()
            if not user:
                user = User.objects.create_user(
                    username=username,
                    email=f"{username}@resqfood.local",
                    password=default_pass,
                    role=role
                )
                if role == UserRole.ADMIN:
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_data
        }, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user with specific role (DONOR, NGO, VOLUNTEER). Auto-initializes profiles.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        return Response({
            'message': 'User registered successfully.',
            'user': user_data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Logout the user. Client discards local access and refresh tokens.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="User Logout",
        description="Logs out the authenticated user. In a stateless JWT architecture, the client discards stored tokens.",
        request=None,
        responses={200: OpenApiResponse(description="Logged out successfully.")}
    )
    def post(self, request):
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """
    GET /api/auth/profile/
    PATCH /api/auth/profile/
    Retrieve or update current authenticated user's profile and role-specific details.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get Current User Profile",
        responses={200: UserSerializer}
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        summary="Update Current User Profile",
        request=UserSerializer,
        responses={200: UserSerializer}
    )
    def patch(self, request):
        user = request.user
        data = request.data

        # Update primary user fields
        for field in ['first_name', 'last_name', 'phone_number', 'avatar_url']:
            if field in data:
                setattr(user, field, data[field])
        user.save()

        # Update role-specific profile fields
        if user.role == UserRole.DONOR and hasattr(user, 'donor_profile'):
            profile = user.donor_profile
            donor_data = dict(data.get('donor_profile') or {})
            for k in ['business_name', 'organization_name', 'fssai_license', 'food_license_number', 'address', 'pickup_instructions', 'donor_type']:
                if k in data and k not in donor_data:
                    donor_data[k] = data[k]
            if 'business_name' in donor_data and 'organization_name' not in donor_data:
                donor_data['organization_name'] = donor_data['business_name']
            if 'food_license_number' in donor_data and 'fssai_license' not in donor_data:
                donor_data['fssai_license'] = donor_data['food_license_number']
            p_serializer = DonorProfileSerializer(profile, data=donor_data, partial=True)
            if p_serializer.is_valid():
                p_serializer.save()

        elif user.role == UserRole.VOLUNTEER and hasattr(user, 'volunteer_profile'):
            profile = user.volunteer_profile
            v_data = dict(data.get('volunteer_profile') or {})
            for k in ['vehicle_type', 'vehicle_number', 'max_distance_km', 'is_available', 'address', 'emergency_contact']:
                if k in data and k not in v_data:
                    v_data[k] = data[k]
            p_serializer = VolunteerProfileSerializer(profile, data=v_data, partial=True)
            if p_serializer.is_valid():
                p_serializer.save()

        elif user.role == UserRole.NGO and hasattr(user, 'organization'):
            from organizations.serializers import OrganizationSerializer
            org = user.organization
            org_data = dict(data.get('organization') or {})
            for k in ['name', 'registration_number', 'capacity_kg', 'max_capacity_kg', 'address', 'phone', 'contact_email', 'accepts_cooked', 'accepts_raw', 'accepts_packaged']:
                if k in data and k not in org_data:
                    org_data[k] = data[k]
            if 'capacity_kg' in org_data and 'max_capacity_kg' not in org_data:
                org_data['max_capacity_kg'] = org_data['capacity_kg']
            o_serializer = OrganizationSerializer(org, data=org_data, partial=True)
            if o_serializer.is_valid():
                o_serializer.save()

        return Response(UserSerializer(user).data)


class AdminUsersListView(generics.ListAPIView):
    """
    GET /api/auth/users/
    Admin only: List all registered platform users with profile details. Filter by ?role=VOLUNTEER, ?search=
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not (user.is_staff or user.role == UserRole.ADMIN):
            return User.objects.none()

        queryset = User.objects.all().order_by('-created_at')
        role_param = self.request.query_params.get('role')
        if role_param:
            queryset = queryset.filter(role=role_param.upper())

        search_param = self.request.query_params.get('search')
        if search_param:
            queryset = queryset.filter(
                models.Q(username__icontains=search_param) |
                models.Q(email__icontains=search_param) |
                models.Q(phone_number__icontains=search_param)
            )

        return queryset

