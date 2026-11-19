import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { HowItWorks } from './pages/public/HowItWorks';
import { Impact } from './pages/public/Impact';
import { FoodSafety } from './pages/public/FoodSafety';
import { Contact } from './pages/public/Contact';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';

// Donor Portal
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonateFood } from './pages/donor/DonateFood';
import { MyDonations } from './pages/donor/MyDonations';
import { DonationDetails } from './pages/donor/DonationDetails';
import { PickupRequests } from './pages/donor/PickupRequests';
import { DonorProfile } from './pages/donor/DonorProfile';

// NGO Portal
import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { AvailableFood } from './pages/ngo/AvailableFood';
import { PriorityDonations } from './pages/ngo/PriorityDonations';
import { MyRequests } from './pages/ngo/MyRequests';
import { ActiveDeliveries } from './pages/ngo/ActiveDeliveries';
import { DonationHistory } from './pages/ngo/DonationHistory';
import { NgoProfile } from './pages/ngo/NgoProfile';

// Volunteer Portal
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';
import { AvailablePickups } from './pages/volunteer/AvailablePickups';
import { ActiveDelivery } from './pages/volunteer/ActiveDelivery';
import { CompletedTasks } from './pages/volunteer/CompletedTasks';
import { VolunteerProfile } from './pages/volunteer/VolunteerProfile';

// Admin Portal
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
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
              <Route path="notifications" element={<DonationDetails />} />
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
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
