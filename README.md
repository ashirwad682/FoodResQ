# ResQFood — Smart Food Rescue Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-rose.svg)](https://opensource.org/licenses/MIT)
[![Django](https://img.shields.io/badge/Django-6.1-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg)](https://vite.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Cloud-brightgreen.svg)](https://www.mongodb.com/atlas)

**ResQFood** is an autonomous, closed-loop food recovery infrastructure uniting commercial kitchens, certified NGOs, and volunteer logistics networks in real-time. It pairs an enterprise-grade **Django + MongoDB Atlas** backend with a high-performance **React 19 (Vite)** frontend featuring a signature **Rose Coral & Warm Silk Cream** glassmorphism design system.

---

## 🌟 Core Architecture & Technology Stack

```
FoodResQ/
├── manage.py                          # Django CLI entrypoint
├── requirements.txt                   # Backend dependencies
├── .env                               # Environment configurations & MongoDB URI
├── config/                            # Django project settings & URL routing
│   ├── settings.py                    # MongoDB Atlas, SimpleJWT, CORS, DRF config
│   ├── urls.py                        # Root API router & Swagger/ReDoc docs
│   └── apps.py                        # MongoDB application configurations
├── accounts/                          # Custom User, authentication, and profiles
├── organizations/                     # NGO capacity and verification management
├── donations/                         # Food surplus logging and lifecycle models
├── pickups/                           # State machine & assignment workflow
├── matching/                          # 0-100 pts multi-factor smart matching engine
├── notifications/                     # In-app real-time notification alerts
├── analytics/                         # Environmental impact and sustainability metrics
├── tests/                             # Full database and API integration test suite
│
└── frontend/                          # React + Vite Single-Page Application
    ├── package.json                   # Dependencies (React 19, Lucide, Axios, Router)
    ├── vite.config.js                 # Dev server (port 3005) & API proxy (port 8004)
    ├── public/images/                 # Brand emblems, logos, and high-res visuals
    └── src/
        ├── components/                # BrandLogo, DonationCard, StatCard, ErrorBoundary
        ├── context/                   # AuthContext, NotificationContext
        ├── layouts/                   # MainLayout (glass island nav), DashboardLayout
        ├── pages/
        │   ├── public/                # Home, About, HowItWorks, Impact, FoodSafety, Contact, Login, Register
        │   ├── donor/                 # DonorDashboard, DonateFood, MyDonations, PickupRequests
        │   ├── ngo/                   # NgoDashboard, AvailableFood, PriorityDonations, ActiveDeliveries
        │   ├── volunteer/             # VolunteerDashboard, AvailablePickups, ActiveDelivery, CompletedTasks
        │   └── admin/                 # AdminDashboard (system metrics, verification, user control)
        └── services/                  # Axios HTTP client with JWT interceptors
```

### Backend Stack
- **Framework**: Django 6.1 (Python 3.14) & Django REST Framework (DRF)
- **Database**: **MongoDB Atlas** via official `django-mongodb-backend` with `ObjectIdAutoField`
- **Authentication**: Stateless JSON Web Tokens (`djangorestframework-simplejwt`)
- **API Documentation**: OpenAPI 3.0 & Swagger UI via `drf-spectacular`
- **CORS**: Configured for local & production cross-origin clients (`django-cors-headers`)

### Frontend Stack
- **Runtime**: React 19 & Vite 8.3
- **Navigation**: React Router v7
- **Styling**: Modern Glassmorphism Design System with responsive mobile island header
- **Icons**: Lucide React
- **Theme**: Rose Coral (`#fb7185` / `#f43f5e`) & Warm Silk Cream (`#fdf5ee` / `#fbede4`)

---

## 🛡️ User Roles & Permission Matrix

| Role | Portals & Capabilities |
|---|---|
| `DONOR` | Commercial kitchens, restaurants, bakeries. Post surplus donations, monitor real-time matching, approve/reject pickup requests, view personal carbon/meal impact. |
| `NGO` | Verified food banks and shelters. Browse available food, trigger requests, receive priority matching alerts, inspect food safety records, confirm receipt. |
| `VOLUNTEER` | Delivery drivers and couriers. Claim rescue missions, track transit routes, update live status (Accepted $\to$ Collected $\to$ Delivered). |
| `ADMIN` | Superusers and platform moderators. Verify NGO credentials, monitor platform-wide analytics, audit donation state machines, manage users. |

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

Every transition is recorded in `DonationStatusHistory` with timestamp, user ID, and notes for complete chain-of-custody tracking.

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
2. **Geographic Proximity ($S_{\text{distance}}$, 0–30 pts)** via Haversine great-circle formula:
   - $\le 2\text{ km}$: **30 pts** | $\le 5\text{ km}$: **25 pts** | $\le 10\text{ km}$: **20 pts** | $\le 20\text{ km}$: **12 pts**
3. **Storage Capacity Fit ($S_{\text{capacity}}$, 0–25 pts)**:
   - Full capacity available for batch: **25 pts**
   - Partial capacity ($\ge 50\%$): **10 pts**
   - Insufficient capacity: **0 pts**
4. **Food Type & Dietary Match ($S_{\text{dietary}}$, 0–15 pts)**:
   - Matched accepted category (e.g., Cooked Meals, Bakery, Produce): **15 pts**
5. **Verified NGO Bonus ($S_{\text{verified}}$, 10 pts)**:
   - Verified administrative badge: **+10 pts**

---

## 📱 Mobile Responsiveness & Glass Island UI

The frontend includes a custom glassmorphism island navbar with responsive mobile optimization:
- **Floating Island Header**: Backdrop blur with Rose Coral ambient glow and high-contrast accessibility.
- **Adaptive Breakpoints**:
  - `> 900px`: Full navigation pill, direct portal buttons, brand wordmark, and tagline.
  - `≤ 768px`: Subtitles and text labels automatically hide to preserve clean spacing; icon-only actions with touch-friendly 36px/40px targets.
  - `≤ 640px`: Full slide-over mobile drawer for comprehensive navigation without screen clutter.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.14 (or 3.11+)
- Node.js 18+ & npm
- MongoDB Atlas cluster or local MongoDB instance

### 2. Backend Setup

```bash
# Navigate to project root
cd "/path/to/food"

# Activate Python virtual environment
source venv/bin/activate

# Install requirements (if needed)
pip install -r requirements.txt

# Configure your MongoDB URI in .env
# MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/foodresq_db?retryWrites=true&w=majority"

# Run migrations
python manage.py migrate

# Seed sample data (optional demo users & donations)
python manage.py seed_data

# Start Django Backend Server on Port 8004
python manage.py runserver 8004
```

### 3. Frontend Setup

```bash
# In a new terminal tab, navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Start Vite Dev Server on Port 3005
npm run dev
```

### 4. Access the Application

| Service | URL | Description |
|---|---|---|
| **Web Application** | [http://localhost:3005](http://localhost:3005) | React 19 Frontend |
| **Django Backend API** | [http://127.0.0.1:8004](http://127.0.0.1:8004) | REST API Root |
| **Interactive Swagger UI** | [http://127.0.0.1:8004/api/docs/](http://127.0.0.1:8004/api/docs/) | OpenAPI Documentation |
| **ReDoc Interface** | [http://127.0.0.1:8004/api/redoc/](http://127.0.0.1:8004/api/redoc/) | Alternative API Documentation |
| **Django Admin** | [http://127.0.0.1:8004/admin/](http://127.0.0.1:8004/admin/) | Database Administration |

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Username | Password | Organization / Details |
|---|---|---|---|
| **Admin** | `admin` | `Admin@12345` | System Superuser |
| **Donor (Kitchen)** | `donor_spice` | `Donor@12345` | The Spice Garden Restaurant |
| **Donor (Bakery)** | `donor_bake` | `Donor@12345` | Golden Crust Artisan Bakery |
| **NGO (Food Bank)** | `ngo_feedhope` | `Ngo@12345` | FeedHope Community Foundation (Verified) |
| **NGO (Shelter)** | `ngo_citycare` | `Ngo@12345` | CityCare Relief Shelter (Verified) |
| **Volunteer (Bike)** | `vol_arun` | `Volunteer@12345` | Arun Kumar (KA-03-HA-4321) |
| **Volunteer (Car)** | `vol_priya` | `Volunteer@12345` | Priya Sharma (KA-01-MJ-8899) |

---

## 📡 API Reference Summary

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` — Register a new user with specific role (auto-provisions profile)
- `POST /api/auth/login/` — Authenticate and receive JWT access + refresh tokens
- `POST /api/auth/logout/` — Invalidate user session
- `POST /api/auth/refresh/` — Refresh expired JWT token
- `GET  /api/auth/profile/` — Fetch authenticated profile
- `PATCH /api/auth/profile/` — Update user details

### Food Donations (`/api/donations/`)
- `GET    /api/donations/` — List active donations (`?status=AVAILABLE`, `?my_donations=true`)
- `POST   /api/donations/` — Create surplus food batch (quantity, shelf-life, location)
- `GET    /api/donations/{id}/` — Specific donation details
- `PATCH  /api/donations/{id}/` — Update available donation listing
- `DELETE /api/donations/{id}/` — Cancel listing

### Pickup Workflow (`/api/pickups/`)
- `POST /api/pickups/request/` — NGO requests an available food donation
- `GET  /api/pickups/requests/` — List incoming requests (for donors) or outbound (for NGOs)
- `POST /api/pickups/requests/{id}/approve/` — Donor approves request (dispatches to volunteers)
- `POST /api/pickups/requests/{id}/reject/` — Donor rejects request
- `GET  /api/pickups/assignments/` — Available volunteer missions
- `POST /api/pickups/assignments/{id}/accept/` — Volunteer claims pickup
- `POST /api/pickups/assignments/{id}/collect/` — Volunteer marks collected from donor
- `POST /api/pickups/assignments/{id}/deliver/` — Volunteer marks delivered to NGO
- `POST /api/pickups/assignments/{id}/confirm/` — NGO confirms receipt (`COMPLETED`)
- `GET  /api/pickups/history/{donation_id}/` — Immutable status audit trail

### Smart Matching (`/api/matching/`)
- `GET  /api/matching/donations/{id}/ngos/` — Ranked NGOs with match breakdown
- `GET  /api/matching/donations/{id}/volunteers/` — Ranked nearby volunteers
- `POST /api/matching/donations/{id}/auto-match/` — Broadcast alert to top 3 matched NGOs

### Analytics & Impact (`/api/analytics/`)
- `GET /api/analytics/dashboard/` — Overall metrics: kg rescued, meals served, CO2 avoided
- `GET /api/analytics/leaderboard/` — Top Donors, NGOs, and Volunteers
- `GET /api/analytics/my-impact/` — Personal authenticated user metrics

---

## 🧪 Testing

Execute the comprehensive database and end-to-end integration test suite:

```bash
source venv/bin/activate
python tests/test_full_database_integration.py
```

---

## 👥 Authors & Attribution

- **Backend & System Architecture**: Ashirwad Kumar
- **UI & Frontend Design**: Ayush Kumar
