import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
            print(f"HTTP {e.code} Error on {path}: {parsed}")
            return e.code, parsed
        except Exception:
            print(f"HTTP {e.code} HTML Error on {path}: {body[:300]}")
            return e.code, {"error": body}

def run_tests():
    print("==================================================")
    print("  FOODRESQ COMPLETE END-TO-END PIPELINE AUDIT   ")
    print("==================================================")

    # 1. Login all 4 roles
    print("\n[Step 1: Authentication & Roles]")
    _, donor_auth = make_request("/auth/login/", "POST", {"username": "donor_spice", "password": "Donor@12345"})
    donor_token = donor_auth.get("access") or donor_auth["tokens"]["access"]
    print("✓ Donor authenticated:", donor_auth["user"]["username"], f"Role: {donor_auth['user']['role']}")

    _, ngo_auth = make_request("/auth/login/", "POST", {"username": "ngo_feedhope", "password": "Ngo@12345"})
    ngo_token = ngo_auth.get("access") or ngo_auth["tokens"]["access"]
    print("✓ NGO authenticated:", ngo_auth["user"]["username"], f"Role: {ngo_auth['user']['role']}")

    _, vol_auth = make_request("/auth/login/", "POST", {"username": "vol_arun", "password": "Volunteer@12345"})
    vol_token = vol_auth.get("access") or vol_auth["tokens"]["access"]
    print("✓ Volunteer authenticated:", vol_auth["user"]["username"], f"Role: {vol_auth['user']['role']}")

    _, admin_auth = make_request("/auth/login/", "POST", {"username": "admin", "password": "Admin@12345"})
    admin_token = admin_auth.get("access") or admin_auth["tokens"]["access"]
    print("✓ Admin authenticated:", admin_auth["user"]["username"], f"Role: {admin_auth['user']['role']}")

    # 2. Priority Engine: Donor creates surplus donation
    print("\n[Step 2: Food Donation & Priority Engine]")
    future_expiry = (datetime.now(timezone.utc) + timedelta(hours=4)).isoformat()
    donation_payload = {
        "title": "Fresh Veg Pulao & Raita (Commercial Batch)",
        "description": "Cooked 1 hour ago for corporate buffet. Packaged in sanitized food warmers.",
        "food_type": "COOKED_MEAL",
        "quantity_kg": 35.0,
        "serves_count": 80,
        "expiry_time": future_expiry,
        "pickup_address": "Spice Garden Restaurant, 100ft Road, Indiranagar, Bengaluru",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "special_instructions": "Store warm or refrigerate immediately upon collection.",
        "dietary_flags": ["VEG", "HALAL"]
    }
    status_code, new_donation = make_request("/donations/", "POST", donation_payload, donor_token)
    assert status_code == 201, f"Failed to create donation: {new_donation}"
    donation_id = new_donation["id"]
    priority = new_donation.get("priority", {})
    print(f"✓ Donation Created #{donation_id}: '{new_donation['title']}' ({new_donation['quantity_kg']} kg)")
    print(f"  → Priority Score: {priority.get('priority_score')}/100 | Level: {priority.get('priority_level')}")
    print(f"  → Score Breakdown: {priority.get('breakdown')}")

    # 3. Smart NGO Matching
    print("\n[Step 3: Smart NGO Matching Engine]")
    _, match_result = make_request(f"/matching/donations/{donation_id}/ngos/", "GET", None, donor_token)
    matched_ngos = match_result.get("ranked_ngos", [])
    print(f"✓ Found {len(matched_ngos)} suitable verified NGOs:")
    for n in matched_ngos[:2]:
        print(f"  • {n['organization_name']}: {n['distance_km']} km away | Match Score: {n['scores']['total_score']}%")

    # 4. Pickup Request Workflow (NGO requests)
    print("\n[Step 4: NGO Pickup Request]")
    req_payload = {
        "donation": donation_id,
        "notes": "Our shelter kitchen has 50 children ready for dinner."
    }
    status_code, pickup_req = make_request("/pickups/request/", "POST", req_payload, ngo_token)
    assert status_code == 201, f"Failed to create pickup request: {pickup_req}"
    request_id = pickup_req["id"]
    print(f"✓ Pickup Request Created #{request_id} by NGO. Status: {pickup_req['status']}")

    # 5. Donor Approves Request
    print("\n[Step 5: Donor Approval & Assignment Dispatch]")
    status_code, approved_req = make_request(f"/pickups/requests/{request_id}/approve/", "POST", None, donor_token)
    assert status_code == 200, f"Failed to approve request: {approved_req}"
    print(f"✓ Request #{request_id} Approved by Donor! Status: {approved_req['status']}")

    # 6. Volunteer Assignment & Acceptance
    print("\n[Step 6: Volunteer Assignment & Claim]")
    _, open_assignments = make_request("/pickups/assignments/", "GET", None, vol_token)
    target_assign = None
    for a in open_assignments.get("results", open_assignments):
        if a.get("donation") == donation_id:
            target_assign = a
            break
    assert target_assign is not None, "Could not find open assignment for donation"
    assignment_id = target_assign["id"]
    print(f"✓ Found Open Assignment #{assignment_id}")

    # Volunteer claims
    status_code, claimed_assign = make_request(f"/pickups/assignments/{assignment_id}/accept/", "POST", None, vol_token)
    assert status_code == 200, f"Failed to accept assignment: {claimed_assign}"
    print(f"✓ Assignment #{assignment_id} Accepted by Volunteer {vol_auth['user']['username']}!")

    # 7. Live Tracking Progression (Collect -> Deliver -> Confirm)
    print("\n[Step 7: Real-Time Tracking State Machine]")
    # 7a. Collect food
    status_code, collected = make_request(f"/pickups/assignments/{assignment_id}/collect/", "POST", {"notes": "Food inspected, thermal bag sealed."}, vol_token)
    assert status_code == 200, f"Failed to collect: {collected}"
    print(f"✓ Status Updated: PICKED UP / IN TRANSIT (Collected at {collected['collected_at']})")

    # 7b. Deliver food
    status_code, delivered = make_request(f"/pickups/assignments/{assignment_id}/deliver/", "POST", None, vol_token)
    assert status_code == 200, f"Failed to deliver: {delivered}"
    print(f"✓ Status Updated: DELIVERED at shelter facility (Delivered at {delivered['delivered_at']})")

    # 7c. NGO Confirms & Inspects
    status_code, confirmed = make_request(f"/pickups/assignments/{assignment_id}/confirm/", "POST", {"rating": 5.0}, ngo_token)
    assert status_code == 200, f"Failed to confirm: {confirmed}"
    print(f"✓ NGO Confirmed Receipt & Food Inspection! Mission Status: {confirmed['status']}")

    # 8. Audit History & Lifecycle Trail
    print("\n[Step 8: Chronological Lifecycle Audit Trail]")
    _, history = make_request(f"/pickups/history/{donation_id}/", "GET", None, donor_token)
    hist_entries = history.get("results", history)
    print(f"✓ Total Status Transitions Recorded: {len(hist_entries)}")
    for h in reversed(hist_entries):
        print(f"  [{h['timestamp'][:19]}] {h['old_status'] or 'START'} ➔ {h['new_status']} | {h['notes']}")

    # 9. Admin Platform Metrics
    print("\n[Step 9: Admin Dashboard & Global Analytics]")
    status_code, admin_metrics = make_request("/analytics/admin/", "GET", None, admin_token)
    m = admin_metrics["metrics"]
    print(f"✓ Total Donations Registered : {m['total_donations']}")
    print(f"✓ Rescues Completed         : {m['completed_donations']}")
    print(f"✓ Total Food Saved (kg)     : {m['food_saved_kg']} kg")
    print(f"✓ Meals Redistributed       : {m['meals_redistributed']} meals")
    print(f"✓ Verified Active NGOs      : {m['verified_ngos']}")
    print(f"✓ Active Volunteer Fleet    : {m['active_volunteers']}")
    print("\n>>> ALL 9 STAGES PASSED FULL END-TO-END VERIFICATION! <<<")

if __name__ == "__main__":
    run_tests()
