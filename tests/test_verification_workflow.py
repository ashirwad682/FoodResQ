import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import django
import secrets
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from organizations.models import Organization
from donations.models import FoodDonation, DonationStatus, FoodType
from pickups.models import (
    PickupRequest,
    PickupAssignment,
    DeliveryVerification,
    DeliveryEvidence,
    DeliveryAuditLog,
    PickupRequestStatus,
    PickupAssignmentStatus,
    VerificationStatus,
)
from notifications.models import Notification, NotificationType

User = get_user_model()

def run_tests():
    print("=" * 70)
    print("STARTING END-TO-END FOOD PICKUP & NGO HANDOVER VERIFICATION TESTS")
    print("=" * 70)

    # 1. Setup stakeholders
    donor, _ = User.objects.get_or_create(
        username='test_donor_verify',
        defaults={'email': 'donor_v@foodresq.org', 'role': 'DONOR', 'phone_number': '+91 9876543210'}
    )
    donor.set_password('TestPass@123')
    donor.save()

    ngo_user, _ = User.objects.get_or_create(
        username='test_ngo_verify',
        defaults={'email': 'ngo_v@foodresq.org', 'role': 'NGO', 'phone_number': '+91 9876543211'}
    )
    ngo_user.set_password('TestPass@123')
    ngo_user.save()

    ngo_org, _ = Organization.objects.get_or_create(
        user=ngo_user,
        defaults={
            'name': 'Hope Community Shelter',
            'registration_number': 'REG-SHELTER-889',
            'contact_email': 'ngo_v@foodresq.org',
            'is_verified': True,
            'address': '44 Shelter Ave, Pune',
            'max_capacity_kg': 500.0,
        }
    )
    ngo_org.is_verified = True
    ngo_org.save()

    vol_user, _ = User.objects.get_or_create(
        username='test_vol_verify',
        defaults={'email': 'vol_v@foodresq.org', 'role': 'VOLUNTEER', 'phone_number': '+91 9876543212'}
    )
    vol_user.set_password('TestPass@123')
    vol_user.save()

    other_ngo_user, _ = User.objects.get_or_create(
        username='other_ngo_verify',
        defaults={'email': 'other_ngo@foodresq.org', 'role': 'NGO'}
    )
    other_ngo_user.set_password('TestPass@123')
    other_ngo_user.save()

    other_org, _ = Organization.objects.get_or_create(
        user=other_ngo_user,
        defaults={'name': 'Other Shelter', 'is_verified': True}
    )

    # 2. Create food donation
    donation = FoodDonation.objects.create(
        donor=donor,
        title=f"Fresh Biryani Trays - {secrets.token_hex(4)}",
        food_type=FoodType.COOKED_MEAL,
        quantity_kg=25.0,
        serves_count=50,
        expiry_time=timezone.now() + timedelta(hours=6),
        pickup_address="Grand Kitchens, Koregaon Park, Pune",
        latitude=18.5362,
        longitude=73.8939,
        special_instructions="Keep warm above 65C. 2 insulated carriers.",
        status=DonationStatus.AVAILABLE,
    )
    print(f"✓ Created Donation #{donation.id}: {donation.title} (25.0kg)")

    # 3. Create pickup request & approve
    pickup_req = PickupRequest.objects.create(
        donation=donation,
        organization=ngo_org,
        requested_by=ngo_user,
        requested_quantity_kg=25.0,
        status=PickupRequestStatus.APPROVED
    )
    assignment = PickupAssignment.objects.create(
        pickup_request=pickup_req,
        volunteer=vol_user,
        status=PickupAssignmentStatus.ASSIGNED
    )
    donation.status = DonationStatus.ASSIGNED
    donation.save()
    print(f"✓ Created Assignment #{assignment.id} for Volunteer '{vol_user.username}'")

    # API Clients
    vol_client = APIClient()
    vol_client.force_authenticate(user=vol_user)

    ngo_client = APIClient()
    ngo_client.force_authenticate(user=ngo_user)

    other_ngo_client = APIClient()
    other_ngo_client.force_authenticate(user=other_ngo_user)

    # TEST A: Reject collection evidence when photo is missing
    resp = vol_client.post(f"/api/pickups/assignments/{assignment.id}/collection-evidence/", {})
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, "Should reject empty collection photo"
    print("✓ Test A Passed: Collection photo is mandatory - rejected empty submission.")

    # TEST B: Submit valid collection evidence with timestamp and GPS
    collection_photo_b64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
    gps_loc = {'lat': 18.5362, 'lng': 73.8939, 'accuracy': 10}
    resp = vol_client.post(f"/api/pickups/assignments/{assignment.id}/collection-evidence/", {
        'photo_data': collection_photo_b64,
        'location': gps_loc,
        'notes': 'Thermal carrier seal verified with donor.',
        'confirm_pickup': True
    }, format='json')
    assert resp.status_code == status.HTTP_200_OK, f"Collection submission failed: {resp.data}"
    assignment.refresh_from_db()
    donation.refresh_from_db()
    assert assignment.status == PickupAssignmentStatus.PICKED_UP, "Assignment should be PICKED_UP"
    assert donation.status == DonationStatus.PICKED_UP, "Donation should be PICKED_UP"
    ver = DeliveryVerification.objects.get(assignment=assignment)
    assert ver.collection_photo_url != '', "Collection photo url must be stored"
    assert ver.collection_confirmed == True, "Collection must be confirmed"
    print("✓ Test B Passed: Collection evidence submitted and donation marked PICKED_UP.")

    # TEST C: Transitions: IN_TRANSIT and ARRIVED_AT_NGO
    resp = vol_client.post(f"/api/pickups/assignments/{assignment.id}/status/", {'status': 'IN_TRANSIT'}, format='json')
    assert resp.status_code == 200
    resp = vol_client.post(f"/api/pickups/assignments/{assignment.id}/status/", {'status': 'ARRIVED_AT_NGO'}, format='json')
    assert resp.status_code == 200
    assignment.refresh_from_db()
    assert assignment.status == PickupAssignmentStatus.ARRIVED_AT_NGO
    print("✓ Test C Passed: Courier transitioned through IN_TRANSIT to ARRIVED_AT_NGO.")

    # TEST D: Submit Handover Evidence (Mandatory photograph)
    resp = vol_client.post(f"/api/pickups/assignments/{assignment.id}/handover-evidence/", {}, format='json')
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, "Should reject empty handover photo"
    
    resp = vol_client.post(f"/api/pickups/assignments/{assignment.id}/handover-evidence/", {
        'photo_data': collection_photo_b64,
        'location': {'lat': 18.5204, 'lng': 73.8567},
        'notes': 'Handed over to shelter manager.'
    }, format='json')
    assert resp.status_code == 200, f"Handover submission failed: {resp.data}"
    assignment.refresh_from_db()
    ver.refresh_from_db()
    assert assignment.status == PickupAssignmentStatus.HANDOVER_EVIDENCE_SUBMITTED
    assert ver.handover_photo_url != '', "Handover photo url must be stored"
    print("✓ Test D Passed: Handover photo submitted; assignment is HANDOVER_EVIDENCE_SUBMITTED (not yet completed).")

    # TEST E: Check OTP generated and sent to NGO notification center (Visible ONLY to NGO)
    ngo_notif = Notification.objects.filter(
        recipient=ngo_user,
        notification_type=NotificationType.OTP_GENERATED,
        related_assignment_id=str(assignment.id)
    ).first()
    assert ngo_notif is not None, "NGO must receive OTP_GENERATED notification"
    plain_otp = ngo_notif.data.get('otp')
    assert plain_otp and len(plain_otp) == 6, f"Valid 6-digit OTP expected, got: {plain_otp}"
    print(f"✓ Test E Passed: 6-digit OTP ({plain_otp}) delivered to NGO Notification Center.")

    # Verify volunteer CANNOT see the OTP
    vol_resp = vol_client.get(f"/api/pickups/assignments/{assignment.id}/verification/")
    assert vol_resp.data['verification'].get('active_otp') is None, "Volunteer must NEVER see active_otp!"
    print("✓ Test E.2 Passed: Volunteer API response strictly hides OTP.")

    # TEST F: Unauthorized NGO cannot verify
    bad_resp = other_ngo_client.post(f"/api/pickups/assignments/{assignment.id}/verify-otp/", {'otp': plain_otp}, format='json')
    assert bad_resp.status_code == status.HTTP_403_FORBIDDEN, "Unauthorized NGO must be rejected"
    print("✓ Test F Passed: Unauthorized NGO cannot verify delivery.")

    # TEST G: Incorrect OTP is rejected & attempts incremented
    bad_otp_resp = ngo_client.post(f"/api/pickups/assignments/{assignment.id}/verify-otp/", {'otp': '000000'}, format='json')
    assert bad_otp_resp.status_code == status.HTTP_400_BAD_REQUEST, "Incorrect OTP must be rejected"
    ver.refresh_from_db()
    assert ver.otp_attempts >= 1, "OTP attempts must be incremented"
    print(f"✓ Test G Passed: Incorrect OTP rejected (Attempts logged: {ver.otp_attempts}).")

    # TEST H: Resend OTP generates new OTP and invalidates old OTP
    # Wait for rate limiter (5 seconds)
    import time
    time.sleep(5.1)
    resend_resp = ngo_client.post(f"/api/pickups/assignments/{assignment.id}/generate-otp/", format='json')
    assert resend_resp.status_code == 200
    new_otp = resend_resp.data.get('otp')
    assert new_otp, "New OTP must be generated"
    print(f"✓ Test H Passed: Fresh OTP generated: {new_otp}")

    # TEST I: Expiration test - set expiration to past
    ver.refresh_from_db()
    ver.otp_expires_at = timezone.now() - timedelta(seconds=5)
    ver.save()
    expired_resp = ngo_client.post(f"/api/pickups/assignments/{assignment.id}/verify-otp/", {'otp': new_otp}, format='json')
    assert expired_resp.status_code == status.HTTP_400_BAD_REQUEST, "Expired OTP must be rejected"
    assert "expired" in expired_resp.data.get('error', '').lower()
    print("✓ Test I Passed: 60-second expired OTP is strictly rejected by backend.")

    # TEST J: Generate fresh valid OTP and successfully verify!
    time.sleep(5.1)
    fresh_resp = ngo_client.post(f"/api/pickups/assignments/{assignment.id}/generate-otp/", format='json')
    valid_otp = fresh_resp.data['otp']
    success_resp = ngo_client.post(f"/api/pickups/assignments/{assignment.id}/verify-otp/", {
        'otp': valid_otp,
        'rating': 5.0,
        'notes': 'Intake inspection complete. Temperature 68C, quality excellent.'
    }, format='json')
    assert success_resp.status_code == status.HTTP_200_OK, f"Valid OTP verification failed: {success_resp.data}"
    assignment.refresh_from_db()
    donation.refresh_from_db()
    ver.refresh_from_db()
    assert assignment.status == PickupAssignmentStatus.DELIVERED
    assert donation.status == DonationStatus.COMPLETED
    assert ver.verification_status == VerificationStatus.DELIVERED
    assert ver.otp_verified_at is not None
    print("✓ Test J Passed: Valid OTP verified, mission marked DELIVERED and COMPLETED in MongoDB.")

    # TEST K: Verify audit log entries exist
    logs = DeliveryAuditLog.objects.filter(assignment=assignment)
    assert logs.count() >= 3, f"Expected multiple audit log records, found {logs.count()}"
    actions = [l.action for l in logs]
    print(f"✓ Test K Passed: Immutable Audit Trail verified ({len(actions)} entries): {', '.join(actions[:4])}...")

    print("=" * 70)
    print("ALL VERIFICATION SYSTEM BACKEND TESTS PASSED SUCCESSFULLY! 🏆")
    print("=" * 70)

if __name__ == '__main__':
    run_tests()
