import math
from django.utils import timezone
from organizations.models import Organization
from accounts.models import VolunteerProfile, VehicleType


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the earth in kilometers.
    """
    if lat1 == 0.0 and lon1 == 0.0 or lat2 == 0.0 and lon2 == 0.0:
        return 5.0  # Default fallback distance for dev/demo with unconfigured coordinates

    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


class PriorityEngine:
    """
    Computes priority scores according to FoodResQ specifications:
    - Expiry: 50%
    - Quantity: 30%
    - Distance: 20%

    Priority Levels:
    - 80-100: Critical
    - 60-79:  High
    - 40-59:  Medium
    - <40:    Normal
    """

    @classmethod
    def calculate_priority(cls, donation, reference_lat=None, reference_lon=None):
        hours_left = donation.hours_until_expiry
        qty = donation.quantity_kg

        # 1. Expiry Score (0 - 100) -> 50% weight
        if hours_left <= 1.5:       # 90 minutes
            expiry_raw = 100.0
        elif hours_left <= 3.0:     # 3 hours
            expiry_raw = 85.0
        elif hours_left <= 6.0:     # 6 hours
            expiry_raw = 70.0
        elif hours_left <= 12.0:    # 12 hours
            expiry_raw = 50.0
        elif hours_left <= 24.0:    # 24 hours
            expiry_raw = 30.0
        else:
            expiry_raw = 15.0
        expiry_weighted = expiry_raw * 0.50

        # 2. Quantity Score (0 - 100) -> 30% weight
        if qty >= 50.0:
            quantity_raw = 100.0
        elif qty >= 25.0:
            quantity_raw = 80.0
        elif qty >= 10.0:
            quantity_raw = 60.0
        elif qty >= 5.0:
            quantity_raw = 40.0
        else:
            quantity_raw = 20.0
        quantity_weighted = quantity_raw * 0.30

        # 3. Distance Score (0 - 100) -> 20% weight
        if reference_lat is not None and reference_lon is not None:
            min_distance = haversine_distance(donation.latitude, donation.longitude, reference_lat, reference_lon)
        else:
            # Find distance to closest verified NGO
            verified_ngos = Organization.objects.filter(is_verified=True)
            if verified_ngos.exists():
                distances = [
                    haversine_distance(donation.latitude, donation.longitude, ngo.latitude, ngo.longitude)
                    for ngo in verified_ngos
                ]
                min_distance = min(distances)
            else:
                min_distance = 5.0

        if min_distance <= 2.0:
            distance_raw = 100.0
        elif min_distance <= 5.0:
            distance_raw = 80.0
        elif min_distance <= 10.0:
            distance_raw = 60.0
        elif min_distance <= 20.0:
            distance_raw = 40.0
        else:
            distance_raw = 20.0
        distance_weighted = distance_raw * 0.20

        total_score = round(expiry_weighted + quantity_weighted + distance_weighted, 1)

        if total_score >= 80.0:
            priority_level = 'CRITICAL'
        elif total_score >= 60.0:
            priority_level = 'HIGH'
        elif total_score >= 40.0:
            priority_level = 'MEDIUM'
        else:
            priority_level = 'NORMAL'

        return {
            'priority_score': total_score,
            'priority_level': priority_level,
            'hours_remaining': round(hours_left, 1),
            'quantity_kg': qty,
            'closest_ngo_distance_km': min_distance,
            'breakdown': {
                'expiry_score': round(expiry_weighted, 1),
                'quantity_score': round(quantity_weighted, 1),
                'distance_score': round(distance_weighted, 1),
            }
        }


class SmartMatchingEngine:
    """
    Priority Engine that computes composite match scores between a FoodDonation and NGOs.
    Considers Expiry Urgency, Available Capacity, Geographic Distance, and Accepted Food Types.
    """

    @classmethod
    def rank_ngos_for_donation(cls, donation, max_results=10):
        ngos = Organization.objects.all()
        ranked_list = []

        hours_left = donation.hours_until_expiry
        donation_qty = donation.quantity_kg
        food_type = donation.food_type

        # 1. Expiry Urgency Score (0 - 30)
        if hours_left <= 3.0:
            expiry_score = 30.0
            urgency_level = 'CRITICAL'
        elif hours_left <= 6.0:
            expiry_score = 25.0
            urgency_level = 'HIGH'
        elif hours_left <= 12.0:
            expiry_score = 20.0
            urgency_level = 'MEDIUM'
        elif hours_left <= 24.0:
            expiry_score = 15.0
            urgency_level = 'MODERATE'
        else:
            expiry_score = 10.0
            urgency_level = 'LOW'

        for ngo in ngos:
            # Check basic eligibility
            distance_km = haversine_distance(
                donation.latitude, donation.longitude,
                ngo.latitude, ngo.longitude
            )

            # 2. Distance Score (0 - 30)
            if distance_km <= 2.0:
                distance_score = 30.0
            elif distance_km <= 5.0:
                distance_score = 25.0
            elif distance_km <= 10.0:
                distance_score = 20.0
            elif distance_km <= 20.0:
                distance_score = 12.0
            elif distance_km <= 35.0:
                distance_score = 6.0
            else:
                distance_score = 1.0

            # 3. Capacity Score (0 - 25)
            avail_cap = ngo.available_capacity_kg
            if avail_cap >= donation_qty:
                capacity_score = 25.0
                capacity_fit = True
            elif avail_cap >= donation_qty * 0.5:
                capacity_score = 10.0
                capacity_fit = False
            else:
                capacity_score = 0.0
                capacity_fit = False

            # 4. Accepted Food Types Match (0 - 15)
            types_accepted = ngo.accepted_food_types or []
            if food_type in types_accepted:
                food_type_score = 15.0
                type_match = True
            else:
                food_type_score = 0.0
                type_match = False

            # Verification Bonus
            verification_bonus = 10.0 if ngo.is_verified else 0.0

            total_score = min(
                100.0,
                round(expiry_score + distance_score + capacity_score + food_type_score + verification_bonus, 1)
            )

            ranked_list.append({
                'organization_id': str(ngo.id),
                'organization_name': ngo.name,
                'contact_email': ngo.contact_email,
                'phone': ngo.phone,
                'address': ngo.address,
                'distance_km': distance_km,
                'is_verified': ngo.is_verified,
                'available_capacity_kg': avail_cap,
                'beneficiary_count': ngo.beneficiary_count,
                'scores': {
                    'total_score': total_score,
                    'distance_score': distance_score,
                    'expiry_score': expiry_score,
                    'capacity_score': capacity_score,
                    'food_type_score': food_type_score,
                    'verification_bonus': verification_bonus,
                },
                'urgency_level': urgency_level,
                'capacity_fit': capacity_fit,
                'type_match': type_match,
            })

        # Sort descending by total match score
        ranked_list.sort(key=lambda x: x['scores']['total_score'], reverse=True)
        return ranked_list[:max_results]


class VolunteerMatchingEngine:
    """
    Ranks suitable available volunteers based on proximity, vehicle capacity, and rating.
    """

    @classmethod
    def rank_volunteers_for_pickup(cls, donation, max_results=5):
        volunteers = VolunteerProfile.objects.filter(is_available=True)
        ranked = []
        quantity = donation.quantity_kg

        for vol in volunteers:
            distance = haversine_distance(
                donation.latitude, donation.longitude,
                vol.current_latitude, vol.current_longitude
            )

            if distance > vol.max_distance_km:
                continue

            # Vehicle capability check
            vehicle = vol.vehicle_type
            if quantity > 100 and vehicle not in [VehicleType.VAN, VehicleType.CAR]:
                vehicle_fit = False
                vehicle_score = 5.0
            elif quantity > 30 and vehicle in [VehicleType.WALK, VehicleType.BIKE]:
                vehicle_fit = False
                vehicle_score = 10.0
            else:
                vehicle_fit = True
                vehicle_score = 25.0

            distance_score = max(0.0, 35.0 - (distance * 1.5))
            rating_score = (vol.rating / 5.0) * 20.0
            experience_score = min(20.0, vol.total_pickups_completed * 2.0)

            total_score = round(distance_score + vehicle_score + rating_score + experience_score, 1)

            ranked.append({
                'volunteer_id': str(vol.user.id),
                'name': vol.user.get_full_name() or vol.user.username,
                'phone': vol.user.phone_number,
                'vehicle_type': vol.vehicle_type,
                'distance_km': distance,
                'rating': vol.rating,
                'total_pickups_completed': vol.total_pickups_completed,
                'vehicle_fit': vehicle_fit,
                'match_score': total_score,
            })

        ranked.sort(key=lambda x: x['match_score'], reverse=True)
        return ranked[:max_results]
