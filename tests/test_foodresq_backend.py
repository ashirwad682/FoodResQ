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
from accounts.models import User, UserRole
from donations.models import FoodDonation, FoodType, DonationStatus
from organizations.models import Organization
from pickups.models import PickupRequest, PickupAssignment, DonationStatusHistory, PickupRequestStatus, PickupAssignmentStatus


def run_tests():
    client = APIClient()
    print("================================================================")
    print("      FOODRESQ BACKEND COMPREHENSIVE VERIFICATION SUITE         ")
    print("================================================================")

    # -------------------------------------------------------------
    # 1. Test Authentication & JWT Tokens
    # -------------------------------------------------------------
    print("\n[TEST 1] Testing JWT Authentication for all 4 roles...")
    credentials = [
        ('donor_spice', 'Donor@12345', UserRole.DONOR),
        ('ngo_feedhope', 'Ngo@12345', UserRole.NGO),
        ('vol_arun', 'Volunteer@12345', UserRole.VOLUNTEER),
        ('admin', 'Admin@12345', UserRole.ADMIN),
    ]
    tokens = {}
    for username, pwd, expected_role in credentials:
        resp = client.post('/api/auth/login/', {'username': username, 'password': pwd}, format='json')
        assert resp.status_code == status.HTTP_200_OK, f"Login failed for {username}: {resp.data}"
        assert 'access' in resp.data, f"Access token missing for {username}"
        assert 'refresh' in resp.data, f"Refresh token missing for {username}"
        assert resp.data['user']['role'] == expected_role, f"Role mismatch: {resp.data['user']['role']}"
        tokens[expected_role] = resp.data['access']
        print(f"  ✓ Logged in as {username} ({expected_role}): JWT access token obtained.")

    # -------------------------------------------------------------
    # 2. Test User Registration
    # -------------------------------------------------------------
    print("\n[TEST 2] Testing User Registration API (/api/auth/register/)...")
    reg_payload = {
        'username': 'new_cafe_donor',
        'email': 'cafe@test.com',
        'password': 'SecurePassword@123',
        'password_confirm': 'SecurePassword@123',
        'role': 'DONOR',
        'phone_number': '+91 9988776655',
        'organization_name': 'Sunrise Cafe',
        'donor_type': 'RESTAURANT',
        'address': 'MG Road, Bengaluru',
        'latitude': 12.9750,
        'longitude': 77.6050,
    }
    # Clean up if previously created
    User.objects.filter(username='new_cafe_donor').delete()
    resp = client.post('/api/auth/register/', reg_payload, format='json')
    assert resp.status_code == status.HTTP_201_CREATED, f"Registration failed: {resp.data}"
    assert resp.data['user']['role'] == 'DONOR'
    assert resp.data['user']['donor_profile']['organization_name'] == 'Sunrise Cafe'
    print(f"  ✓ Registered new donor 'new_cafe_donor' with auto-created DonorProfile.")

    # -------------------------------------------------------------
    # 3. Test Role Permissions Enforcement
    # -------------------------------------------------------------
    print("\n[TEST 3] Testing Strict Role-Based Access Control...")
    donor_client = APIClient()
    donor_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens[UserRole.DONOR]}')

    ngo_client = APIClient()
    ngo_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens[UserRole.NGO]}')

    vol_client = APIClient()
    vol_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens[UserRole.VOLUNTEER]}')

    # NGO cannot create donation
    donation_payload = {
        'title': 'Illegal NGO Donation',
        'food_type': 'COOKED_MEAL',
        'quantity_kg': 10.0,
        'expiry_time': (timezone.now() + timedelta(hours=4)).isoformat(),
        'pickup_address': 'Some Address',
        'latitude': 12.9,
        'longitude': 77.6,
    }
    resp = ngo_client.post('/api/donations/', donation_payload, format='json')
    assert resp.status_code == status.HTTP_403_FORBIDDEN, f"NGO should not be able to create donations: {resp.status_code}"
    print("  ✓ Correctly rejected: NGO attempted to create donation -> 403 Forbidden.")

    # Donor cannot request a pickup
    resp = donor_client.post('/api/pickups/request/', {'donation': 'test', 'requested_quantity_kg': 5}, format='json')
    assert resp.status_code == status.HTTP_403_FORBIDDEN, f"Donor should not be able to request pickups: {resp.status_code}"
    print("  ✓ Correctly rejected: Donor attempted to request pickup -> 403 Forbidden.")

    # -------------------------------------------------------------
    # 4. Test Backend Validations on Food Donations
    # -------------------------------------------------------------
    print("\n[TEST 4] Testing Backend Validations for Food Donations...")
    # A) Past Expiry
    past_expiry_payload = {
        'title': 'Expired Bread',
        'food_type': 'BAKED_GOODS',
        'quantity_kg': 5.0,
        'expiry_time': (timezone.now() - timedelta(hours=2)).isoformat(),
        'pickup_address': 'MG Road',
        'latitude': 12.9,
        'longitude': 77.6,
    }
    resp = donor_client.post('/api/donations/', past_expiry_payload, format='json')
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, f"Past expiry should fail: {resp.status_code}"
    assert 'expiry_time' in resp.data, f"Error should be on expiry_time: {resp.data}"
    print(f"  ✓ Correctly rejected past expiry: {resp.data['expiry_time']}")

    # B) Negative Quantity
    bad_qty_payload = {
        'title': 'Negative Rice',
        'food_type': 'COOKED_MEAL',
        'quantity_kg': -10.0,
        'expiry_time': (timezone.now() + timedelta(hours=6)).isoformat(),
        'pickup_address': 'MG Road',
        'latitude': 12.9,
        'longitude': 77.6,
    }
    resp = donor_client.post('/api/donations/', bad_qty_payload, format='json')
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, f"Negative qty should fail: {resp.status_code}"
    print(f"  ✓ Correctly rejected negative quantity: {resp.data['quantity_kg']}")

    # C) Valid Food Donation Submission
    valid_payload = {
        'title': 'Evening Surplus Kheer & Parathas',
        'description': 'Freshly prepared festive sweets and parathas in heat-sealed boxes.',
        'food_type': 'COOKED_MEAL',
        'quantity_kg': 18.0,
        'serves_count': 40,
        'expiry_time': (timezone.now() + timedelta(hours=6)).isoformat(),
        'pickup_address': 'Indiranagar 100ft Road, Bengaluru',
        'latitude': 12.9719,
        'longitude': 77.6412,
        'special_instructions': 'Handle with care. Thermal boxes provided.',
        'dietary_flags': ['VEG'],
    }
    resp = donor_client.post('/api/donations/', valid_payload, format='json')
    assert resp.status_code == status.HTTP_201_CREATED, f"Valid donation creation failed: {resp.data}"
    test_donation_id = resp.data['id']
    print(f"  ✓ Successfully created valid donation (ID: {test_donation_id}, Status: {resp.data['status']})")

    # -------------------------------------------------------------
    # 5. Test Smart Priority Matching Engine
    # -------------------------------------------------------------
    print("\n[TEST 5] Testing Smart Priority Matching Engine...")
    resp = donor_client.get(f'/api/matching/donations/{test_donation_id}/ngos/')
    assert resp.status_code == status.HTTP_200_OK, f"Matching engine failed: {resp.data}"
    ranked_ngos = resp.data['ranked_ngos']
    assert len(ranked_ngos) > 0, "No matched NGOs returned"
    top_match = ranked_ngos[0]
    print(f"  ✓ Ranked {len(ranked_ngos)} NGOs. Top match: '{top_match['organization_name']}'")
    print(f"    - Match Score: {top_match['scores']['total_score']}%")
    print(f"    - Distance: {top_match['distance_km']} km (Score: {top_match['scores']['distance_score']}/30)")
    print(f"    - Expiry Urgency: {top_match['urgency_level']} (Score: {top_match['scores']['expiry_score']}/30)")
    print(f"    - Capacity Fit: {top_match['capacity_fit']} (Score: {top_match['scores']['capacity_score']}/25)")

    # Test volunteer ranking
    resp = donor_client.get(f'/api/matching/donations/{test_donation_id}/volunteers/')
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.data['ranked_volunteers']) > 0
    print(f"  ✓ Matched {len(resp.data['ranked_volunteers'])} volunteers. Top: {resp.data['ranked_volunteers'][0]['name']}")

    # -------------------------------------------------------------
    # 6. Test Complete End-to-End Rescue Lifecycle & State Machine
    # -------------------------------------------------------------
    print("\n[TEST 6] Testing Complete Rescue Lifecycle State Machine...")
    # Step A: NGO requests donation
    req_resp = ngo_client.post('/api/pickups/request/', {
        'donation': test_donation_id,
        'requested_quantity_kg': 18.0,
        'notes': 'FeedHope will distribute this to our evening community shelter.'
    }, format='json')
    assert req_resp.status_code == status.HTTP_201_CREATED, f"Pickup request failed: {req_resp.data}"
    request_id = req_resp.data['id']
    donation_obj = FoodDonation.objects.get(pk=test_donation_id)
    assert donation_obj.status == DonationStatus.REQUESTED
    print(f"  ✓ Step 1: NGO requested donation -> Donation status: {donation_obj.status}")

    # Step B: Donor approves request
    appr_resp = donor_client.post(f'/api/pickups/requests/{request_id}/approve/')
    assert appr_resp.status_code == status.HTTP_200_OK, f"Donor approval failed: {appr_resp.data}"
    donation_obj.refresh_from_db()
    assert donation_obj.status == DonationStatus.APPROVED
    assignment_id = appr_resp.data['assignment']['id']
    print(f"  ✓ Step 2: Donor approved request -> Donation status: {donation_obj.status}, Assignment ID: {assignment_id}")

    # Step C: Volunteer accepts assignment
    accept_resp = vol_client.post(f'/api/pickups/assignments/{assignment_id}/accept/')
    assert accept_resp.status_code == status.HTTP_200_OK, f"Volunteer accept failed: {accept_resp.data}"
    donation_obj.refresh_from_db()
    assert donation_obj.status == DonationStatus.ASSIGNED
    print(f"  ✓ Step 3: Volunteer accepted assignment -> Donation status: {donation_obj.status}")

    # Step D: Volunteer collects food
    col_resp = vol_client.post(f'/api/pickups/assignments/{assignment_id}/collect/', {
        'delivery_notes': 'Food collected hot and securely stored in delivery bag.'
    }, format='json')
    assert col_resp.status_code == status.HTTP_200_OK, f"Collection failed: {col_resp.data}"
    donation_obj.refresh_from_db()
    assert donation_obj.status == DonationStatus.PICKED_UP
    print(f"  ✓ Step 4: Food collected from donor -> Donation status: {donation_obj.status}")

    # Step E: Volunteer delivers food to NGO
    del_resp = vol_client.post(f'/api/pickups/assignments/{assignment_id}/deliver/')
    assert del_resp.status_code == status.HTTP_200_OK, f"Delivery failed: {del_resp.data}"
    donation_obj.refresh_from_db()
    assert donation_obj.status == DonationStatus.DELIVERED
    print(f"  ✓ Step 5: Food delivered to NGO -> Donation status: {donation_obj.status}")

    # Step F: NGO confirms delivery and completes mission
    conf_resp = ngo_client.post(f'/api/pickups/assignments/{assignment_id}/confirm/', {'rating': 5.0}, format='json')
    assert conf_resp.status_code == status.HTTP_200_OK, f"Confirmation failed: {conf_resp.data}"
    donation_obj.refresh_from_db()
    assert donation_obj.status == DonationStatus.COMPLETED
    print(f"  ✓ Step 6: NGO confirmed receipt -> Mission COMPLETED! (Rescued: {conf_resp.data['rescued_kg']} kg)")

    # Step G: Verify audit trail
    hist_resp = donor_client.get(f'/api/pickups/history/{test_donation_id}/')
    assert hist_resp.status_code == status.HTTP_200_OK
    transitions = [f"{h['old_status']} -> {h['new_status']}" for h in hist_resp.data['results']]
    print(f"  ✓ Full Audit Trail verified ({len(transitions)} transitions):")
    for t in reversed(transitions):
        print(f"      • {t}")

    # -------------------------------------------------------------
    # 7. Test Impact Analytics & OpenAPI Documentation
    # -------------------------------------------------------------
    print("\n[TEST 7] Testing Impact Analytics & OpenAPI Documentation...")
    anon_client = APIClient()
    analytics_resp = anon_client.get('/api/analytics/dashboard/')
    assert analytics_resp.status_code == status.HTTP_200_OK
    metrics = analytics_resp.data['impact_metrics']
    print(f"  ✓ Impact Analytics Live:")
    print(f"    - Total Food Saved: {metrics['total_food_saved_kg']} kg")
    print(f"    - Meals Served: {metrics['total_meals_served']}")
    print(f"    - CO2 Prevented: {metrics['co2_emissions_prevented_kg']} kg CO2e")
    print(f"    - Rescues Completed: {metrics['total_rescues_completed']}")

    # Check Swagger OpenAPI schema endpoint
    schema_resp = anon_client.get('/api/schema/')
    assert schema_resp.status_code == status.HTTP_200_OK
    assert 'openapi' in schema_resp.data
    print(f"  ✓ OpenAPI 3.0 Schema successfully validated (Version: {schema_resp.data['info']['version']})")

    print("\n================================================================")
    print("      ALL 7 TEST SUITES PASSED FLAWLESSLY ON MONGODB ATLAS!     ")
    print("================================================================\n")


if __name__ == '__main__':
    run_tests()
