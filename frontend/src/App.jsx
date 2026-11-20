import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Pages (Lazy Loaded for Optimal Initial Load Performance)
const Home = lazy(() => import('./pages/public/Home').then((m) => ({ default: m.Home })));
const About = lazy(() => import('./pages/public/About').then((m) => ({ default: m.About })));
const HowItWorks = lazy(() => import('./pages/public/HowItWorks').then((m) => ({ default: m.HowItWorks })));
const Impact = lazy(() => import('./pages/public/Impact').then((m) => ({ default: m.Impact })));
const FoodSafety = lazy(() => import('./pages/public/FoodSafety').then((m) => ({ default: m.FoodSafety })));
const Contact = lazy(() => import('./pages/public/Contact').then((m) => ({ default: m.Contact })));
const Login = lazy(() => import('./pages/public/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/public/Register').then((m) => ({ default: m.Register })));

// Common Pages
const NotificationsPage = lazy(() =>
  import('./pages/common/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);

// Donor Portal
const DonorDashboard = lazy(() =>
  import('./pages/donor/DonorDashboard').then((m) => ({ default: m.DonorDashboard }))
);
const DonateFood = lazy(() => import('./pages/donor/DonateFood').then((m) => ({ default: m.DonateFood })));
const MyDonations = lazy(() => import('./pages/donor/MyDonations').then((m) => ({ default: m.MyDonations })));
const DonationDetails = lazy(() =>
  import('./pages/donor/DonationDetails').then((m) => ({ default: m.DonationDetails }))
);
const PickupRequests = lazy(() =>
  import('./pages/donor/PickupRequests').then((m) => ({ default: m.PickupRequests }))
);
const DonorProfile = lazy(() =>
  import('./pages/donor/DonorProfile').then((m) => ({ default: m.DonorProfile }))
);

// NGO Portal
const NgoDashboard = lazy(() => import('./pages/ngo/NgoDashboard').then((m) => ({ default: m.NgoDashboard })));
const AvailableFood = lazy(() =>
  import('./pages/ngo/AvailableFood').then((m) => ({ default: m.AvailableFood }))
);
const PriorityDonations = lazy(() =>
  import('./pages/ngo/PriorityDonations').then((m) => ({ default: m.PriorityDonations }))
);
const MyRequests = lazy(() => import('./pages/ngo/MyRequests').then((m) => ({ default: m.MyRequests })));
const ActiveDeliveries = lazy(() =>
  import('./pages/ngo/ActiveDeliveries').then((m) => ({ default: m.ActiveDeliveries }))
);
const DonationHistory = lazy(() =>
  import('./pages/ngo/DonationHistory').then((m) => ({ default: m.DonationHistory }))
);
const NgoProfile = lazy(() => import('./pages/ngo/NgoProfile').then((m) => ({ default: m.NgoProfile })));

// Volunteer Portal
const VolunteerDashboard = lazy(() =>
  import('./pages/volunteer/VolunteerDashboard').then((m) => ({ default: m.VolunteerDashboard }))
);
const AvailablePickups = lazy(() =>
  import('./pages/volunteer/AvailablePickups').then((m) => ({ default: m.AvailablePickups }))
);
const ActiveDelivery = lazy(() =>
  import('./pages/volunteer/ActiveDelivery').then((m) => ({ default: m.ActiveDelivery }))
);
const CompletedTasks = lazy(() =>
  import('./pages/volunteer/CompletedTasks').then((m) => ({ default: m.CompletedTasks }))
);
const VolunteerProfile = lazy(() =>
  import('./pages/volunteer/VolunteerProfile').then((m) => ({ default: m.VolunteerProfile }))
);

// Admin Portal
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

// High-Performance Rose Coral & Silk Cream Loading Fallback
const PageFallback = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '3px solid rgba(251, 113, 133, 0.2)',
        borderTopColor: '#fb7185',
        animation: 'spin 0.75s linear infinite',
      }}
    />
    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)' }}>
      Loading ResQFood Network...
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Layout */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/impact" element={<Impact />} />
                  <Route path="/food-safety" element={<FoodSafety />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Donor Portal (Protected) */}
                <Route
                  path="/donor"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/donor/dashboard" replace />} />
                  <Route path="dashboard" element={<DonorDashboard />} />
                  <Route path="donate" element={<DonateFood />} />
                  <Route path="donations" element={<MyDonations />} />
                  <Route path="donations/:id" element={<DonationDetails />} />
                  <Route path="requests" element={<PickupRequests />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<DonorProfile />} />
                </Route>

                {/* NGO Portal (Protected) */}
                <Route
                  path="/ngo"
                  element={
                    <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/ngo/dashboard" replace />} />
                  <Route path="dashboard" element={<NgoDashboard />} />
                  <Route path="available-food" element={<AvailableFood />} />
                  <Route path="priority-donations" element={<PriorityDonations />} />
                  <Route path="my-requests" element={<MyRequests />} />
                  <Route path="active-deliveries" element={<ActiveDeliveries />} />
                  <Route path="history" element={<DonationHistory />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<NgoProfile />} />
                </Route>

                {/* Volunteer Portal (Protected) */}
                <Route
                  path="/volunteer"
                  element={
                    <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
                  <Route path="dashboard" element={<VolunteerDashboard />} />
                  <Route path="pickups" element={<AvailablePickups />} />
                  <Route path="active-delivery" element={<ActiveDelivery />} />
                  <Route path="completed" element={<CompletedTasks />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<VolunteerProfile />} />
                </Route>

                {/* Admin Portal (Protected) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
