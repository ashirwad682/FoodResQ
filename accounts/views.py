from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
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
            p_serializer = DonorProfileSerializer(profile, data=data.get('donor_profile', data), partial=True)
            if p_serializer.is_valid():
                p_serializer.save()

        elif user.role == UserRole.VOLUNTEER and hasattr(user, 'volunteer_profile'):
            profile = user.volunteer_profile
            p_serializer = VolunteerProfileSerializer(profile, data=data.get('volunteer_profile', data), partial=True)
            if p_serializer.is_valid():
                p_serializer.save()

        elif user.role == UserRole.NGO and hasattr(user, 'organization'):
            from organizations.serializers import OrganizationSerializer
            org = user.organization
            o_serializer = OrganizationSerializer(org, data=data.get('organization', data), partial=True)
            if o_serializer.is_valid():
                o_serializer.save()

        return Response(UserSerializer(user).data)
