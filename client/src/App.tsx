import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { CitizenLayout } from './layouts/CitizenLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { SubmitComplaintPage } from './pages/citizen/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/citizen/MyComplaintsPage';
import { CitizenProfilePage } from './pages/citizen/CitizenProfilePage';

// Admin / Authority Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllComplaintsPage } from './pages/admin/AllComplaintsPage';
import { ComplaintDetailsPage } from './pages/admin/ComplaintDetailsPage';
import { LiveMapPage } from './pages/admin/LiveMapPage';
import { AIInsightsPage } from './pages/admin/AIInsightsPage';
import { DuplicatesPage } from './pages/admin/DuplicatesPage';
import { AssignmentsPage } from './pages/admin/AssignmentsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { DepartmentsPage } from './pages/admin/DepartmentsPage';
import { ActivityPage } from './pages/admin/ActivityPage';
import { SettingsPage } from './pages/admin/SettingsPage';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/track" element={<TrackComplaintPage />} />
              <Route path="/track/:complaintId" element={<TrackComplaintPage />} />
            </Route>

            {/* Citizen Portal (Protected) */}
            <Route path="/citizen" element={<CitizenLayout />}>
              <Route index element={<CitizenDashboard />} />
              <Route path="report" element={<SubmitComplaintPage />} />
              <Route path="my-complaints" element={<MyComplaintsPage />} />
              <Route path="track/:complaintId" element={<TrackComplaintPage />} />
              <Route path="profile" element={<CitizenProfilePage />} />
            </Route>

            {/* Authority Admin Portal (Protected) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="complaints" element={<AllComplaintsPage />} />
              <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
              <Route path="map" element={<LiveMapPage />} />
              <Route path="ai-insights" element={<AIInsightsPage />} />
              <Route path="duplicates" element={<DuplicatesPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
