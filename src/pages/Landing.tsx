import { Link, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Heart, Droplet, Users, ShieldCheck, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import resqLogo from '../assets/resqblood-logo.png';
import donorDarah from '../assets/donor-darah.png';
import news1 from '../assets/News 1.jpeg';
import news2 from '../assets/News 2.jpg';
import news3 from '../assets/News 3.jpg';

// ── News Data ──
const newsItems = [
  {
    id: 1,
    image: news1,
    title: 'Indonesia Faces a Critical Blood Supply Shortage',
    body: "Indonesia's blood supply situation remains concerning and poses a significant public health challenge. The World Health Organization (WHO) recommends that every country maintain a blood supply equivalent to at least 2% of its population. With Indonesia's population reaching approximately 282 million people in the first half of 2024, the country ideally requires around 5.6 million units of blood annually. However, Indonesia continues to experience a significant shortfall in meeting this target, with the national blood supply falling short of the recommended levels. This gap underscores the urgent need for increased voluntary blood donation campaigns and public awareness efforts.",
    date: 'June 2024',
  },
  {
    id: 2,
    image: news2,
    title: 'Blood Demand Continues to Outpace Supply',
    body: "Hospitals across Indonesia are reporting growing concerns over persistent blood shortages, with demand continuing to outpace the available supply. Medical facilities, particularly those handling emergency cases and patients with chronic conditions such as thalassemia, are among the most severely impacted. Health authorities are calling on the public to step up voluntary blood donations to help bridge the growing gap. Experts emphasize that regular, voluntary blood donations remain the most reliable and safest source of blood for patients in need, and urge all eligible citizens to contribute to saving lives through this simple yet vital act.",
    date: 'May 2024',
  },
  {
    id: 3,
    image: news3,
    title: 'Blood Stocks Can Reach Critical Levels During Holidays',
    body: "Blood banks across Indonesia often face critically low stock levels during national holidays and long weekends, as the number of voluntary donors drops significantly during these periods. Meanwhile, the need for blood in hospitals does not decrease — emergency cases, surgeries, and patients requiring routine transfusions continue throughout the holiday season. Health officials and blood bank administrators are urging the public to schedule blood donations before major holidays to help maintain adequate reserves. Community organizations and corporate groups are also being encouraged to organize blood donation drives in anticipation of these predictable shortage periods.",
    date: 'April 2024',
  },
];

// ── News Carousel Component ──
function NewsCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  };

  const next = () => goTo((current + 1) % newsItems.length);
  const prev = () => goTo((current - 1 + newsItems.length) % newsItems.length);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 8000);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % newsItems.length);
    }, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const item = newsItems[current];

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 mb-4">
            <Droplet className="h-3.5 w-3.5 fill-red-600" />
            Blood Donation News
          </span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Latest News & Updates</h2>
          <p className="text-gray-500 text-sm mt-2">Stay informed about blood donation needs in Indonesia</p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-opacity duration-300"
            style={{ opacity: animating ? 0 : 1 }}
          >
            <div className="flex flex-col md:flex-row min-h-[340px]">
              {/* Image */}
              <div className="md:w-2/5 h-56 md:h-auto relative flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </div>

              {/* Content */}
              <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                      <Droplet className="h-3 w-3 fill-red-500" />
                      Health News
                    </span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-4">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-5">
                    {item.body}
                  </p>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center gap-3 mt-6">
                  {newsItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { goTo(i); resetInterval(); }}
                      className={`h-2 rounded-full transition-all duration-300 ${i === current
                        ? 'w-8 bg-red-600'
                        : 'w-2 bg-gray-200 hover:bg-gray-400'
                        }`}
                      aria-label={`Go to news ${i + 1}`}
                    />
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => { prev(); resetInterval(); }}
                      className="h-8 w-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                      aria-label="Previous news"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { next(); resetInterval(); }}
                      className="h-8 w-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                      aria-label="Next news"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide counter */}
          <p className="text-center text-xs text-gray-400 mt-4 font-medium">
            {current + 1} / {newsItems.length}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const { user, profile } = useAuthStore();

  if (user && profile?.is_profile_complete) {
    return <Navigate to={profile.role === 'donor' ? '/donor' : '/requester'} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 select-none">
            <img src={resqLogo} alt="ResQBlood Logo" className="h-9 w-9 object-contain" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              ResQ<span className="text-red-600">Blood</span>
            </span>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to={profile?.role === 'donor' ? '/donor' : '/requester'}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Register Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="bg-white overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
        <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-stretch lg:min-h-[calc(100vh-4rem)]">

            {/* Left — text content */}
            <div className="flex-1 flex flex-col justify-center gap-8 py-12 lg:py-16 text-center lg:text-left items-center lg:items-start pr-0 lg:pr-16">
              <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-sm font-extrabold px-4 py-2 rounded-full border border-red-200">
                <Droplet className="h-4 w-4 fill-red-600" />
                Voluntary Blood Donation Platform
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
                Donate Blood,<br />
                <span className="text-red-600">Save a Life Today</span>
              </h1>

              <p className="text-gray-600 text-lg sm:text-xl leading-relaxed max-w-xl">
                ResQBlood connects voluntary blood donors with patients in need — matched by blood type and city location. Fast, safe, and community-driven.
              </p>

              <ul className="flex flex-col gap-3 text-base font-semibold text-gray-700">
                {["Free to register, no hidden fees", "Matched by blood type & city", "Track your donation history"].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-base px-8 py-4 rounded-xl shadow-md shadow-red-600/20 transition-all hover:-translate-y-0.5"
                >
                  <Heart className="h-5 w-5 fill-white" /> Register as Donor
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-base px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5"
                >
                  I Need Blood
                </Link>
              </div>
            </div>

            {/* Right — full-panel image with feature pills overlaid */}
            <div className="relative lg:w-[48%] flex-shrink-0 min-h-[350px] lg:min-h-0 py-8 lg:py-12">
              {/* Rounded panel behind image */}
              <div className="absolute inset-y-8 inset-x-0 lg:inset-y-12 lg:inset-x-0 rounded-3xl lg:rounded-[40px] bg-red-50 overflow-hidden shadow-2xl">
                <img
                  src={donorDarah}
                  alt="Donor Darah"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── NEWS CAROUSEL (replaces stats strip) ── */}
      <NewsCarousel />

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">How ResQBlood Works</h2>
            <p className="text-gray-500 text-sm mt-3">Three simple steps to help someone survive.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                color: 'bg-blue-50 text-blue-600',
                step: '01',
                title: 'Register & Set Profile',
                desc: 'Sign up as a Donor or Requester. Fill in your blood type, city, and medical details to get started.',
              },
              {
                icon: Heart,
                color: 'bg-red-50 text-red-600',
                step: '02',
                title: 'Smart Blood Type Matching',
                desc: 'Our system matches open blood requests with compatible donors nearby — automatically and in real time.',
              },
              {
                icon: ShieldCheck,
                color: 'bg-green-50 text-green-600',
                step: '03',
                title: 'Donate & Save a Life',
                desc: 'Accept the match, head to the hospital, and complete the donation. Your history is recorded automatically.',
              },
            ].map(({ icon: Icon, color, step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-black text-gray-100">{step}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-red-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Ready to Make a Difference?
          </h2>
          <p className="text-red-100 text-sm sm:text-base max-w-xl leading-relaxed">
            Join ResQBlood today and become part of a life-saving community. It costs nothing but your willingness to help.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-red-600 font-bold text-sm px-8 py-3.5 rounded-lg shadow-lg hover:bg-red-50 transition-colors"
          >
            <Heart className="h-4 w-4 fill-red-600" /> Join Now — It's Free
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={resqLogo} alt="ResQBlood" className="h-6 w-6 object-contain" />
            <span className="text-sm font-bold text-gray-700">ResQBlood</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} ResQBlood Indonesia
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link to="/login" className="hover:text-gray-600 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-gray-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
