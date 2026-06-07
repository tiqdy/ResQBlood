import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AnimatePresence, motion } from 'framer-motion';

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Navbar — fixed height h-16 */}
      <TopBar onMenuToggle={toggleMobileMenu} />

      {/* Body row — fills remaining height, each column scrolls independently */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop Sidebar — fixed height, scrolls its own content */}
        <div className="hidden lg:flex shrink-0 h-full overflow-y-auto">
          <Sidebar />
        </div>

        {/* Mobile Sidebar drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden flex">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
                className="relative z-10 h-full w-64 bg-white flex flex-col shadow-2xl"
              >
                <Sidebar onItemClick={closeMobileMenu} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main content — scrolls independently */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 max-w-5xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
