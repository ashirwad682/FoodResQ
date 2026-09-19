# FoodResQ — Smart Food Rescue Platform (Backend & Core Engine)

Enterprise-grade Django backend for **FoodResQ**, connected directly to **MongoDB Atlas**.
Powers real-time surplus food rescue operations by bridging Donors (Restaurants, Supermarkets, Caterers), NGOs (Food Banks, Shelters), and Volunteers (Delivery Heroes) with a smart multi-factor priority matching engine.

---

## 🌟 Core Architecture & Technology Stack

- **Framework**: Django 6.1 (Python 3.14)
- **REST API**: Django REST Framework (DRF)
- **Database**: **MongoDB Atlas** via official `django-mongodb-backend` with `ObjectIdAutoField`
- **Authentication**: Stateless JSON Web Tokens (`djangorestframework-simplejwt`)
- **API Documentation**: OpenAPI 3.0 & Swagger UI via `drf-spectacular`
- **CORS**: Configured for React & mobile frontend clients (`django-cors-headers`)

```
foodresq/
├── manage.py                     # Django CLI
├── config/                       # Settings, root URLs, Mongo app configs
│   ├── settings.py               # MongoDB Atlas connection, SimpleJWT, CORS, DRF
│   ├── urls.py                   # Global routing + OpenAPI / Swagger
│   ├── apps.py                   # MongoAdminConfig, MongoAuthConfig, etc.
│   └── __init__.py               # DRF ObjectId serializer & JSONEncoder bindings
│
├── accounts/                     # Custom User, Roles & Profiles
│   ├── models.py                 # User, DonorProfile, VolunteerProfile
│   ├── permissions.py            # IsDonor, IsNGO, IsVolunteer, IsAdminUser
│   ├── serializers.py            # Registration, Login, Profile serializers
│   └── views.py                  # Register, Login, Logout, Profile
│
├── organizations/                # NGO Management
│   ├── models.py                 # Organization, capacity, operating hours
│   ├── serializers.py            # Capacity & contact serializers
│   └── views.py                  # Organization list, details, admin verification
│
├── donations/                    # Surplus Food Donations
│   ├── models.py                 # FoodDonation (status, expiry, coordinates)
│   ├── serializers.py            # Backend validations: quantity, expiry, food types
│   └── views.py                  # CRUD food donations with filters
│
├── pickups/                      # Workflow & State Machine
│   ├── models.py                 # PickupRequest, PickupAssignment, DonationStatusHistory
│   ├── serializers.py            # Request, assignment & audit trail serializers
│   └── views.py                  # Request, Approve, Accept, Collect, Deliver, Confirm
│
├── matching/                     # Smart Priority Matching Engine
│   ├── services.py               # Multi-factor scoring algorithm (0-100 pts)
│   └── views.py                  # Ranked NGOs & Volunteers, Auto-Match broadcast
│
├── notifications/                # In-App Alert System
│   ├── models.py                 # Notification (MATCH_FOUND, REQUEST_RECEIVED, etc.)
│   └── views.py                  # List notifications, mark as read
│
├── analytics/                    # Impact & Sustainability Metrics
│   └── views.py                  # Platform dashboard, Leaderboards, User Impact
│
└── mongo_migrations/             # Official MongoDB migration modules
```

---

## 🛡️ User Roles & Permission Matrix

| Role | Permissions & Capabilities |
|---|---|
| `DONOR` | Post surplus food donations, view matching NGOs, approve/reject pickup requests, view personal rescue impact. |
| `NGO` | Browse available food donations, submit pickup requests, receive priority matching alerts, confirm delivery receipt. |
| `VOLUNTEER` | View assigned/available pickups, claim rescue missions, update live GPS location, confirm collection & delivery. |
| `ADMIN` | Full system control: verify NGO accounts, inspect audit trails, manage users, platform-wide analytics. |

---

## 🔄 Food Rescue Lifecycle State Machine

```
   [ Donor Posts Food ]
            │
            ▼
       AVAILABLE  ──────────── (Expired timer) ────────────► EXPIRED
            │
    (NGO Requests)
            │
            ▼
        REQUESTED
       ┌────┴────┐
(Rejected)    (Donor Approves)
       │         │
       ▼         ▼
  AVAILABLE   APPROVED
                 │
      (Volunteer Accepts)
                 │
                 ▼
              ASSIGNED
                 │
      (Volunteer Collects)
                 │
                 ▼
             PICKED_UP
                 │
      (Volunteer Drops Off)
                 │
                 ▼
             DELIVERED
                 │
      (NGO Confirms Receipt)
                 │
                 ▼
             COMPLETED  ──► [ Impact Analytics: kg saved, meals served, CO2 avoided ]
```

Every single transition is permanently and immutably recorded in `DonationStatusHistory` with timestamp, user ID, and notes for complete chain-of-custody auditing.

---

## 🧠 Smart Matching Priority Engine

When surplus food is posted, the `SmartMatchingEngine` scores all eligible NGOs on a **0 – 100 point scale**:

$$\text{Total Match Score} = S_{\text{expiry}} + S_{\text{distance}} + S_{\text{capacity}} + S_{\text{dietary}} + S_{\text{verified}}$$

1. **Expiry Urgency ($S_{\text{expiry}}$, 0–30 pts)**:
   - $\le 3$ hours left: **30 pts** (CRITICAL Emergency Rescue)
   - $\le 6$ hours left: **25 pts** (HIGH)
   - $\le 12$ hours left: **20 pts** (MEDIUM)
   - $\le 24$ hours left: **15 pts** (MODERATE)
   - $> 24$ hours left: **10 pts** (LOW)
2. **Geographic Distance ($S_{\text{distance}}$, 0–30 pts)** via Haversine great-circle formula:
   - $\le 2\text{ km}$: **30 pts** | $\le 5\text{ km}$: **25 pts** | $\le 10\text{ km}$: **20 pts** | $\le 20\text{ km}$: **12 pts**
3. **Storage Capacity Fit ($S_{\text{capacity}}$, 0–25 pts)**:
   - Full capacity available for batch: **25 pts**
   - Partial capacity ($\ge 50\%$): **10 pts**
   - Insufficient capacity: **0 pts**
4. **Food Type & Dietary Match ($S_{\text{dietary}}$, 0–15 pts)**:
   - Matched accepted category (e.g. Cooked Meals, Baked Goods): **15 pts**
5. **Verified NGO Bonus ($S_{\text{verified}}$, 10 pts)**:
   - Administrative verification badge: **+10 pts**

---

## 🚀 Quick Start Guide

### 1. Activate Environment & Database
The project is already pre-configured to point directly to your MongoDB Atlas cluster:
```bash
source ./venv/bin/activate
```

### 2. Apply Migrations & Seed Sample Data
```bash
python manage.py migrate
python manage.py seed_data
```

### 3. Start Local Development Server
```bash
python manage.py runserver 8000
```
- **Interactive Swagger UI**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
- **ReDoc Documentation**: [http://127.0.0.1:8000/api/redoc/](http://127.0.0.1:8000/api/redoc/)
- **Raw OpenAPI 3 Schema**: [http://127.0.0.1:8000/api/schema/](http://127.0.0.1:8000/api/schema/)

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Username | Password | Organization / Notes |
|---|---|---|---|
| **Admin** | `admin` | `Admin@12345` | Superuser / Platform Admin |
| **Donor (Restaurant)** | `donor_spice` | `Donor@12345` | The Spice Garden Restaurant |
| **Donor (Bakery)** | `donor_bake` | `Donor@12345` | Golden Crust Artisan Bakery |
| **NGO (Food Bank)** | `ngo_feedhope` | `Ngo@12345` | FeedHope Community Foundation (Verified) |
| **NGO (Shelter)** | `ngo_citycare` | `Ngo@12345` | CityCare Relief Shelter (Verified) |
| **Volunteer (Bike)** | `vol_arun` | `Volunteer@12345` | Arun Kumar (KA-03-HA-4321) |
| **Volunteer (Car)** | `vol_priya` | `Volunteer@12345` | Priya Sharma (KA-01-MJ-8899) |

---

## 📡 API Reference Summary

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` — Register new user with specific role (auto-creates profile)
- `POST /api/auth/login/` — Authenticate and receive JWT access + refresh tokens
- `POST /api/auth/logout/` — Discard authentication session
- `POST /api/auth/refresh/` — Refresh expired JWT access token
- `GET  /api/auth/profile/` — Fetch current user profile & role details
- `PATCH /api/auth/profile/` — Update user & profile fields

### Food Donations (`/api/donations/`)
- `GET    /api/donations/` — List donations (filter by `?status=AVAILABLE`, `?food_type=COOKED_MEAL`, `?my_donations=true`)
- `POST   /api/donations/` — Create donation (Donor only; validates quantity > 0, future expiry, coordinates)
- `GET    /api/donations/{id}/` — Donation details
- `PATCH  /api/donations/{id}/` — Edit donation (Owner donor only; restricted to `AVAILABLE` status)
- `DELETE /api/donations/{id}/` — Delete donation (Owner donor only; restricted to `AVAILABLE` status)

### Pickup Workflow & State Machine (`/api/pickups/`)
- `POST /api/pickups/request/` — NGO requests an available donation
- `GET  /api/pickups/requests/` — List incoming requests (for donors) or sent requests (for NGOs)
- `POST /api/pickups/requests/{id}/approve/` — Donor approves NGO request (auto-dispatches volunteer assignment)
- `POST /api/pickups/requests/{id}/reject/` — Donor rejects NGO request
- `GET  /api/pickups/assignments/` — List volunteer assignments (`?filter=mine` or `?filter=available`)
- `POST /api/pickups/assignments/{id}/accept/` — Volunteer claims pickup mission
- `POST /api/pickups/assignments/{id}/collect/` — Volunteer confirms food collected from donor
- `POST /api/pickups/assignments/{id}/deliver/` — Volunteer confirms food drop-off at NGO
- `POST /api/pickups/assignments/{id}/confirm/` — NGO verifies and confirms delivery -> marks `COMPLETED`
- `GET  /api/pickups/history/{donation_id}/` — Audit log of all status transitions for a donation

### Priority Matching Engine (`/api/matching/`)
- `GET  /api/matching/donations/{id}/ngos/` — Returns ranked NGOs with multi-factor match score breakdown
- `GET  /api/matching/donations/{id}/volunteers/` — Returns ranked volunteers based on proximity and vehicle capability
- `POST /api/matching/donations/{id}/auto-match/` — Broadcasts urgent in-app alert notifications to top 3 matched NGOs

### NGO Organizations (`/api/organizations/`)
- `GET   /api/organizations/` — List registered NGOs (`?verified=true`)
- `GET   /api/organizations/{id}/` — Organization details & available storage capacity
- `PATCH /api/organizations/{id}/` — Update NGO capacity or operating hours
- `POST  /api/organizations/{id}/verify/` — Admin-only verification toggle

### Volunteers Network (`/api/volunteers/`)
- `GET   /api/volunteers/` — List volunteers (`?available=true`)
- `PATCH /api/volunteers/status/` — Volunteer updates live GPS coordinates or availability toggle
- `GET   /api/volunteers/active-assignment/` — Current in-flight rescue mission

### In-App Notifications (`/api/notifications/`)
- `GET   /api/notifications/` — List user notifications (`?unread_only=true`)
- `PATCH /api/notifications/{id}/read/` — Mark notification read
- `POST  /api/notifications/mark-all-read/` — Mark all notifications read

### Impact Analytics (`/api/analytics/`)
- `GET /api/analytics/dashboard/` — Platform stats: kg rescued, meals provided, CO2 avoided
- `GET /api/analytics/leaderboard/` — Top Donors, Top NGOs, and Top Volunteers
- `GET /api/analytics/my-impact/` — Personalized impact card for authenticated user
