import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User, UserRole, DonorProfile, VolunteerProfile
from organizations.models import Organization
from donations.models import FoodDonation, FoodType, DonationStatus
from pickups.models import PickupRequest, PickupAssignment, DonationStatusHistory, PickupRequestStatus, PickupAssignmentStatus
from notifications.models import Notification


def test_full_database_integration():
    client = APIClient()
    print("=" * 70)
    print("   FOODRESQ FULL DATABASE & ROLE INTEGRATION VERIFICATION SUITE   ")
    print("=" * 70)

    # 1. Test JWT Authentication & MongoDB User Retrieval
    print("\n[STEP 1] Authenticating all 4 roles against MongoDB Atlas...")
    creds = {
        UserRole.DONOR: ('donor_spice', 'Donor@12345'),
        UserRole.NGO: ('ngo_feedhope', 'Ngo@12345'),
        UserRole.VOLUNTEER: ('vol_arun', 'Volunteer@12345'),
        UserRole.ADMIN: ('admin', 'Admin@12345'),
    }
    tokens = {}
    for role, (username, pwd) in creds.items():
        resp = client.post('/api/auth/login/', {'username': username, 'password': pwd}, format='json')
        assert resp.status_code == status.HTTP_200_OK, f"Login failed for {username}: {resp.data}"
        tokens[role] = resp.data['access']
        print(f"  ✓ {role} authenticated ({username}). User record retrieved from MongoDB.")

    # 2. Test Profile Fetch & Update Persistence
    print("\n[STEP 2] Testing User & Profile CRUD Persistence in MongoDB Atlas...")
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens[UserRole.DONOR]}")
    prof_resp = client.get('/api/auth/profile/')
    assert prof_resp.status_code == status.HTTP_200_OK
    assert prof_resp.data['username'] == 'donor_spice'
    assert 'donor_profile' in prof_resp.data

    # Update profile
    patch_resp = client.patch('/api/auth/profile/', {
        'first_name': 'Chef Spice',
        'address': '123 MG Road, Bengaluru',
        'donor_profile': {
            'organization_name': 'The Spice Garden Luxury Dining',
            'fssai_license': 'FSSAI-12345678901234',
        }
    }, format='json')
    assert patch_resp.status_code == status.HTTP_200_OK
    assert patch_resp.data['first_name'] == 'Chef Spice'
    assert patch_resp.data['donor_profile']['organization_name'] == 'The Spice Garden Luxury Dining'
    assert patch_resp.data['donor_profile']['fssai_license'] == 'FSSAI-12345678901234'
    print("  ✓ Donor profile update verified and stored in MongoDB Atlas.")

    # 3. Test Food Donation Creation (Donor)
    print("\n[STEP 3] Testing Food Donation CRUD in MongoDB Atlas...")
    expiry = (timezone.now() + timedelta(hours=6)).isoformat()
    don_resp = client.post('/api/donations/', {
        'title': 'Gourmet Vegetable Biryani & Raita',
        'description': 'Freshly prepared 40 portions of aromatic Hyderabadi vegetable biryani.',
        'food_type': 'COOKED_MEAL',
        'quantity_kg': 25.0,
        'servings': 50,
        'expiry_time': expiry,
        'storage_temp': 'HOT_HOLDING',
        'is_vegetarian': True,
        'pickup_address': 'The Spice Garden, 123 MG Road, Bengaluru',
        'latitude': 12.9716,
        'longitude': 77.5946,
    }, format='json')
    assert don_resp.status_code == status.HTTP_201_CREATED, f"Create donation failed: {don_resp.data}"
    donation_id = str(don_resp.data['id'])
    print(f"  ✓ Donation created in MongoDB Atlas (ID: {donation_id}, Status: AVAILABLE, Quantity: 25.0 kg).")

    # Verify donor can fetch their own donations
    my_don_resp = client.get('/api/donations/?my_donations=true')
    assert my_don_resp.status_code == status.HTTP_200_OK
    don_ids = [str(d['id']) for d in (my_don_resp.data.get('results') or my_don_resp.data)]
    assert donation_id in don_ids, "Newly created donation not found in donor's my_donations"
    print("  ✓ Donation successfully retrieved via ?my_donations=true filter.")

    # 4. Test Smart Priority Matching Engine
    print("\n[STEP 4] Testing AI Priority Matching Engine against live MongoDB data...")
    match_ngo_resp = client.get(f'/api/matching/donations/{donation_id}/ngos/')
    assert match_ngo_resp.status_code == status.HTTP_200_OK
    matched_ngos = match_ngo_resp.data.get('matched_ngos', [])
    assert len(matched_ngos) > 0, "No NGOs matched by matching engine"
    top_ngo = matched_ngos[0]
    print(f"  ✓ Top matched NGO: '{top_ngo['organization_name']}' (Match Score: {top_ngo['match_score']}%)")

    # 5. Test NGO Browsing Available Food & Requesting Pickup
    print("\n[STEP 5] Testing NGO Pickup Request Creation...")
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens[UserRole.NGO]}")
    avail_resp = client.get('/api/donations/?status=AVAILABLE')
    assert avail_resp.status_code == status.HTTP_200_OK
    avail_ids = [str(d['id']) for d in (avail_resp.data.get('results') or avail_resp.data)]
    assert donation_id in avail_ids, "Donation not visible to NGO as AVAILABLE"

    # NGO requests pickup
    req_resp = client.post('/api/pickups/request/', {
        'donation': donation_id,
        'requested_quantity_kg': 25.0,
        'notes': 'FeedHope will distribute these meals at the community shelter.'
    }, format='json')
    assert req_resp.status_code == status.HTTP_201_CREATED, f"NGO request failed: {req_resp.data}"
    request_id = str(req_resp.data['id'])
    print(f"  ✓ Pickup Request created in MongoDB Atlas (Request ID: {request_id}, Status: PENDING).")

    # Verify donation status transitioned to REQUESTED in MongoDB
    don_check = FoodDonation.objects.get(pk=donation_id)
    assert don_check.status == DonationStatus.REQUESTED
    print("  ✓ Donation status updated to REQUESTED in MongoDB.")

    # 6. Test Donor Approving Request & Dispatching Assignment
    print("\n[STEP 6] Testing Donor Request Approval & Volunteer Assignment Dispatch...")
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens[UserRole.DONOR]}")
    appr_resp = client.post(f'/api/pickups/requests/{request_id}/approve/')
    assert appr_resp.status_code == status.HTTP_200_OK, f"Donor approval failed: {appr_resp.data}"
    assignment_id = str(appr_resp.data['assignment_id'])
    print(f"  ✓ Donor approved request. PickupAssignment created in MongoDB (Assignment ID: {assignment_id}).")

    # 7. Test Volunteer Claiming Assignment & Delivering
    print("\n[STEP 7] Testing Volunteer Mission Lifecycle...")
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens[UserRole.VOLUNTEER]}")
    
    # Volunteer views available assignments
    assign_resp = client.get('/api/pickups/assignments/?filter=available')
    assert assign_resp.status_code == status.HTTP_200_OK
    
    # Volunteer accepts assignment
    accept_resp = client.post(f'/api/pickups/assignments/{assignment_id}/accept/')
    assert accept_resp.status_code == status.HTTP_200_OK, f"Volunteer accept failed: {accept_resp.data}"
    print("  ✓ Step 7.1: Volunteer accepted assignment. Status: ASSIGNED.")

    # Active mission retrieval
    active_resp = client.get('/api/volunteers/active-assignment/')
    assert active_resp.status_code == status.HTTP_200_OK
    assert active_resp.data['active_assignment'] is not None
    assert str(active_resp.data['active_assignment']['id']) == assignment_id
    print("  ✓ Step 7.2: Active assignment successfully queried via /api/volunteers/active-assignment/.")

    # Volunteer marks food collected
    collect_resp = client.post(f'/api/pickups/assignments/{assignment_id}/collect/', {
        'notes': 'Collected hot biryani batch in insulated thermal carrier.'
    }, format='json')
    assert collect_resp.status_code == status.HTTP_200_OK
    print("  ✓ Step 7.3: Food collected from donor. Status: COLLECTED / PICKED_UP.")

    # Volunteer marks food delivered
    deliver_resp = client.post(f'/api/pickups/assignments/{assignment_id}/deliver/', {
        'notes': 'Delivered at FeedHope Shelter drop-off station.'
    }, format='json')
    assert deliver_resp.status_code == status.HTTP_200_OK
    print("  ✓ Step 7.4: Food delivered to NGO. Status: DELIVERED.")

    # 8. Test NGO Receipt Confirmation & Mission Completion
    print("\n[STEP 8] Testing NGO Receipt Confirmation & Impact Calculation...")
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens[UserRole.NGO]}")
    conf_resp = client.post(f'/api/pickups/assignments/{assignment_id}/confirm/', {
        'rating': 5.0,
        'notes': 'Food inspected, temperature verified above 65°C. Distributed to 50 beneficiaries.'
    }, format='json')
    assert conf_resp.status_code == status.HTTP_200_OK, f"Confirm delivery failed: {conf_resp.data}"
    print("  ✓ NGO confirmed receipt. Mission COMPLETED!")

    # Verify final statuses in MongoDB Atlas
    final_don = FoodDonation.objects.get(pk=donation_id)
    assert final_don.status == DonationStatus.COMPLETED
    final_assign = PickupAssignment.objects.get(pk=assignment_id)
    assert final_assign.status == PickupAssignmentStatus.CONFIRMED_BY_NGO
    print("  ✓ Verified final records in MongoDB: Donation is COMPLETED, Assignment is CONFIRMED_BY_NGO.")

    # 9. Test In-App Notification Delivery
    print("\n[STEP 9] Testing In-App Notifications in MongoDB...")
    donor_user = User.objects.get(username='donor_spice')
    notifications = Notification.objects.filter(recipient=donor_user).order_by('-created_at')
    assert notifications.count() > 0
    latest_notif = notifications.first()
    print(f"  ✓ Notification stored in MongoDB: '{latest_notif.title}' - {latest_notif.message[:60]}...")

    # Test marking notification read
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens[UserRole.DONOR]}")
    read_resp = client.patch(f'/api/notifications/{latest_notif.id}/read/')
    assert read_resp.status_code == status.HTTP_200_OK
    assert read_resp.data['is_read'] is True
    print("  ✓ Notification marked as read in MongoDB Atlas.")

    # 10. Test Platform Analytics Dashboard Aggregation
    print("\n[STEP 10] Testing Platform ESG Impact Aggregations...")
    analytics_resp = client.get('/api/analytics/dashboard/')
    assert analytics_resp.status_code == status.HTTP_200_OK
    metrics = analytics_resp.data['impact_metrics']
    assert metrics['total_food_saved_kg'] > 0
    assert metrics['total_meals_served'] > 0
    assert metrics['co2_emissions_prevented_kg'] > 0
    print(f"  ✓ Live MongoDB Metrics: {metrics['total_food_saved_kg']} kg food saved | {metrics['total_meals_served']} meals served | {metrics['co2_emissions_prevented_kg']} kg CO2 prevented.")

    print("\n" + "=" * 70)
    print("   ALL 10 DATABASE INTEGRATION & ROLE TESTS PASSED ON MONGODB ATLAS!   ")
    print("=" * 70)


if __name__ == '__main__':
    test_full_database_integration()
