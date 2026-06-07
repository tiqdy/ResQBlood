import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  Search, 
  HeartHandshake, 
  History, 
  User, 
  PlusCircle, 
  FileText,
  Droplet
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const { profile } = useAuthStore();
  if (!profile) return null;

  const donorLinks = [
    { to: '/donor', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/donor/requests', label: 'Browse Requests', icon: Search },
    { to: '/donor/matches', label: 'My Matches', icon: HeartHandshake },
    { to: '/donor/history', label: 'Donation History', icon: History },
    { to: '/donor/profile', label: 'My Profile', icon: User },
  ];

  const requesterLinks = [
    { to: '/requester', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/requester/create', label: 'Create Request', icon: PlusCircle },
    { to: '/requester/requests', label: 'My Requests', icon: FileText },
    { to: '/requester/profile', label: 'My Profile', icon: User },
  ];

  const pmiLinks = [
    { to: '/pmi', label: 'PMI Dashboard', icon: LayoutDashboard },
    { to: '/pmi/screenings', label: 'Donation Screenings', icon: HeartHandshake },
    { to: '/pmi/profile', label: 'PMI Profile', icon: User },
  ];

  const links = profile.role === 'donor' 
    ? donorLinks 
    : profile.role === 'pmi' 
    ? pmiLinks 
    : requesterLinks;

  const roleLabel = profile.role === 'donor' ? 'Donor Portal' : profile.role === 'pmi' ? 'PMI Portal' : 'Requester Portal';
  const roleDot = profile.role === 'donor' ? 'bg-green-500' : profile.role === 'pmi' ? 'bg-blue-500' : 'bg-orange-500';

  return (
    <aside className="h-full w-64 bg-white border-r border-gray-100 flex flex-col justify-between py-5 shadow-sm">
      <div className="flex flex-col gap-1.5">
        {/* Role Tag */}
        <div className="px-5 mb-3 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full shrink-0 ${roleDot}`} />
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate">
            {roleLabel}
          </p>
        </div>

        <nav className="flex flex-col gap-0.5 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/donor' || link.to === '/requester' || link.to === '/pmi'}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 px-3.5 h-11 rounded-xl text-sm font-medium transition-all select-none',
                  isActive
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active left bar indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-r-full" />
                  )}
                  <link.icon
                    className={cn(
                      'h-4.5 w-4.5 shrink-0 transition-colors',
                      isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom motivational banner */}
      <div className="px-4">
        <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100/60 p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-1.5">
            <Droplet className="h-4 w-4 text-red-600 fill-red-200" />
            <p className="text-xs font-bold text-red-800">Every Drop Counts</p>
          </div>
          <p className="text-[11px] text-red-600/80 leading-relaxed">
            Your donation can save up to 3 lives. Keep volunteering!
          </p>
        </div>
      </div>
    </aside>
  );
}
