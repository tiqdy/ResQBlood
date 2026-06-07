import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'donor' | 'requester' | 'pmi';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuthStore();
  const location = useLocation();

  // If check is in progress, show a premium clinical loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" className="border-brand-600" />
        <p className="text-gray-500 font-medium text-sm animate-pulse">Loading ResQBlood Session...</p>
      </div>
    );
  }

  // Case 1: Unauthenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 2: Profile setup not complete yet
  if (!profile?.is_profile_complete) {
    const role = profile?.role || 'donor';
    return <Navigate to={`/${role}/profile`} replace />;
  }

  // Case 3: Profile complete but checking role access
  if (allowedRole && profile.role !== allowedRole) {
    // Redirect wrong role to correct dashboard
    if (profile.role === 'donor') return <Navigate to="/donor" replace />;
    if (profile.role === 'pmi') return <Navigate to="/pmi" replace />;
    return <Navigate to="/requester" replace />;
  }

  return <>{children}</>;
}
