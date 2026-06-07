import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import resqLogo from '../../assets/resqblood-logo.png';
import donorDarah from '../../assets/donor-darah.png';
import { Heart, Droplet, Shield, Users } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Logged in successfully! Welcome back.');
      const profile = res.profile;
      if (profile && !profile.is_profile_complete) {
        navigate(`/${profile.role}/profile`, { replace: true });
      } else if (profile) {
        if (profile.role === 'donor') {
          navigate('/donor', { replace: true });
        } else if (profile.role === 'pmi') {
          navigate('/pmi', { replace: true });
        } else {
          navigate('/requester', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    } else {
      toast.error(res.error || 'Incorrect email or password.');
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-900 relative overflow-hidden flex-col justify-between p-12 h-full">
        {/* Background decorative circles */}
        <div className="absolute -top-24 -left-24 h-96 w-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-0 h-64 w-64 bg-white/5 rounded-full translate-x-16 translate-y-16" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-white/3 rounded-full" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3.5 select-none">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-md p-1.5 shrink-0">
            <img src={resqLogo} alt="ResQBlood Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">ResQBlood</span>
        </Link>

        {/* Center illustration */}
        <div className="relative flex items-center justify-center flex-1 py-8">
          <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <img 
              src={donorDarah} 
              alt="Blood Donation" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Feature badges */}
        <div className="relative flex flex-col gap-3">
          <h2 className="text-white text-xl font-black mb-2">
            Welcome back to ResQBlood
          </h2>
          <div className="flex flex-col gap-2">
            {[
              { icon: Heart, text: 'Connect donors with those in need' },
              { icon: Shield, text: 'Verified PMI-backed donations' },
              { icon: Users, text: 'Community of life-savers' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="h-7 w-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50/50 h-full overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Mobile logo (only shows on small screens) */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2.5 mb-10 select-none">
            <img src={resqLogo} alt="ResQBlood Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-black text-gray-900">
              ResQ<span className="text-red-600">Blood</span>
            </span>
          </Link>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100 mb-4">
              <Droplet className="h-3 w-3 fill-red-500" />
              Voluntary Blood Donation Platform
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1.5">Sign in to continue your life-saving journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              id="login-email"
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              id="login-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-1 h-12 font-bold text-base shadow-lg shadow-red-600/20 rounded-xl"
              isLoading={loading}
              id="login-submit"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/register" className="font-bold text-red-600 hover:text-red-700 select-none transition-colors">
              Register Now
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to ResQBlood's platform terms.
          </p>
        </div>
      </div>
    </div>
  );
}
