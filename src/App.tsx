import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';

// Layout components
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Donor pages
import DonorDashboard from './pages/donor/DonorDashboard';
import BrowseRequests from './pages/donor/BrowseRequests';
import MyMatches from './pages/donor/MyMatches';
import DonationHistory from './pages/donor/DonationHistory';
import DonorProfile from './pages/donor/DonorProfile';

// Requester pages
import RequesterDashboard from './pages/requester/RequesterDashboard';
import CreateRequest from './pages/requester/CreateRequest';
import MyRequests from './pages/requester/MyRequests';
import RequestDetail from './pages/requester/RequestDetail';

// PMI pages
import PmiDashboard from './pages/pmi/PmiDashboard';
import DonationScreenings from './pages/pmi/DonationScreenings';
import PmiProfile from './pages/pmi/PmiProfile';

export default function App() {
  const { initSession } = useAuth();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    initSession();
  }, [initSession]);

  return (
    <BrowserRouter>
      {/* Toast provider with clean layout configurations */}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '0.875rem',
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '0.75rem 1rem',
            opacity: 1,
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
            style: {
              borderLeft: '4px solid #16a34a',
            },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
            style: {
              borderLeft: '4px solid #dc2626',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth redirection checks */}
        <Route 
          path="/login" 
          element={
            user && profile?.is_profile_complete ? (
              profile.role === 'donor' ? (
                <Navigate to="/donor" replace />
              ) : profile.role === 'pmi' ? (
                <Navigate to="/pmi" replace />
              ) : (
                <Navigate to="/requester" replace />
              )
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            user && profile?.is_profile_complete ? (
              profile.role === 'donor' ? (
                <Navigate to="/donor" replace />
              ) : profile.role === 'pmi' ? (
                <Navigate to="/pmi" replace />
              ) : (
                <Navigate to="/requester" replace />
              )
            ) : (
              <Register />
            )
          } 
        />



        {/* Guarded App Layout Group */}
        <Route element={<AppLayout />}>
          
          {/* Donor guarded endpoints */}
          <Route 
            path="/donor" 
            element={
              <ProtectedRoute allowedRole="donor">
                <DonorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/requests" 
            element={
              <ProtectedRoute allowedRole="donor">
                <BrowseRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/matches" 
            element={
              <ProtectedRoute allowedRole="donor">
                <MyMatches />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/history" 
            element={
              <ProtectedRoute allowedRole="donor">
                <DonationHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/profile" 
            element={
              <ProtectedRoute allowedRole="donor">
                <DonorProfile />
              </ProtectedRoute>
            } 
          />

          {/* Requester guarded endpoints */}
          <Route 
            path="/requester" 
            element={
              <ProtectedRoute allowedRole="requester">
                <RequesterDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/requester/create" 
            element={
              <ProtectedRoute allowedRole="requester">
                <CreateRequest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/requester/requests" 
            element={
              <ProtectedRoute allowedRole="requester">
                <MyRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/requester/requests/:id" 
            element={
              <ProtectedRoute allowedRole="requester">
                <RequestDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/requester/profile" 
            element={
              <ProtectedRoute allowedRole="requester">
                <DonorProfile />
              </ProtectedRoute>
            } 
          />

          {/* PMI Guarded Endpoints */}
          <Route 
            path="/pmi" 
            element={
              <ProtectedRoute allowedRole="pmi">
                <PmiDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pmi/screenings" 
            element={
              <ProtectedRoute allowedRole="pmi">
                <DonationScreenings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pmi/profile" 
            element={
              <ProtectedRoute allowedRole="pmi">
                <PmiProfile />
              </ProtectedRoute>
            } 
          />

        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
