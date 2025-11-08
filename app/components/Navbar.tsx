'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Brain, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="w-8 h-8 text-emerald-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold text-black">
              TEA<span className="text-emerald-500">i</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/meetings"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Meetings
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Tasks
                </Link>
                <Link
                  href="/analytics"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Analytics
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    <span className="text-sm">{session.user?.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-sm text-black font-medium">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/settings"
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="#features"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="#integrations"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Integrations
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/meetings"
                  className="block text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Meetings
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className="block text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tasks
                </Link>
                <Link
                  href="/analytics"
                  className="block text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-6 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="#features"
                  className="block text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="block text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="#integrations"
                  className="block text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Integrations
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
