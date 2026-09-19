from rest_framework import permissions
from .models import UserRole


class IsDonor(permissions.BasePermission):
    """Allows access only to users with DONOR role or Admins."""
    message = "Only registered Donors have permission to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == UserRole.DONOR or request.user.role == UserRole.ADMIN or request.user.is_superuser)
        )


class IsNGO(permissions.BasePermission):
    """Allows access only to users with NGO role or Admins."""
    message = "Only registered NGOs/Food Banks have permission to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == UserRole.NGO or request.user.role == UserRole.ADMIN or request.user.is_superuser)
        )


class IsVolunteer(permissions.BasePermission):
    """Allows access only to users with VOLUNTEER role or Admins."""
    message = "Only registered Volunteers have permission to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == UserRole.VOLUNTEER or request.user.role == UserRole.ADMIN or request.user.is_superuser)
        )


class IsAdminUser(permissions.BasePermission):
    """Allows access only to platform administrators."""
    message = "Platform Administrator privileges are required for this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == UserRole.ADMIN or request.user.is_staff or request.user.is_superuser)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Object-level permission to allow only owners of an object or admins to edit/delete."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.ADMIN or request.user.is_superuser:
            return True
        # Check user, donor, volunteer, or organization ownership
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'donor'):
            return obj.donor == request.user
        if hasattr(obj, 'volunteer'):
            return obj.volunteer == request.user
        return False
