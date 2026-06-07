import { Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import resqLogo from '../../assets/resqblood-logo.png';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { profile } = useAuthStore();
  const { signOut } = useAuth();

  const roleConfig = {
    donor: { label: 'Donor', bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    pmi: { label: 'PMI Staff', bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    requester: { label: 'Requester', bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  };

  const role = profile?.role as 'donor' | 'pmi' | 'requester' | undefined;
  const rc = role ? roleConfig[role] : { label: '', bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

  // Avatar initials fallback
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 select-none group">
          <img src={resqLogo} alt="ResQBlood" className="h-8 w-8 object-contain group-hover:scale-105 transition-transform" />
          <span className="font-bold text-lg text-gray-900 hidden sm:inline tracking-tight">
            ResQ<span className="text-red-600">Blood</span>
          </span>
        </Link>
      </div>

      {/* User profile actions */}
      {profile && (
        <div className="flex items-center gap-2">
          {/* Name + Role (hidden on mobile) */}
          <div className="hidden md:flex flex-col items-end leading-none gap-1 mr-1">
            <span className="text-sm font-semibold text-gray-800">{profile.full_name || 'User'}</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${rc.bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${rc.dot}`} />
                {rc.label}
              </span>
              {profile.blood_type && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                  {profile.blood_type}
                </span>
              )}
            </div>
          </div>
          
          {/* Avatar / Profile link */}
          <Link
            to={profile.role === 'donor' ? '/donor/profile' : profile.role === 'pmi' ? '/pmi/profile' : '/requester/profile'}
            className="h-9 w-9 rounded-full bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-200/60 flex items-center justify-center text-red-700 font-bold text-sm hover:border-red-400 hover:shadow-md hover:shadow-red-100 transition-all active:scale-95"
            title="Edit Profile"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="text-xs font-black">{initials}</span>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={signOut}
            className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors active:scale-95 group"
            title="Logout"
          >
            <LogOut className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}
    </header>
  );
}
