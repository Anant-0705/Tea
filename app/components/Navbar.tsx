'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
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
          ? 'bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Phone className="w-8 h-8 text-zinc-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold text-white">
              Auto<span className="text-zinc-400">Track</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/meetings"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Meetings
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Tasks
                </Link>
                <Link
                  href="/analytics"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Analytics
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-sm">{session.user?.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg">
                      <div className="p-3 border-b border-zinc-800">
                        <p className="text-sm text-white font-medium">{session.user?.name}</p>
                        <p className="text-xs text-zinc-400">{session.user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/settings"
                          className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
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
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="#integrations"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Integrations
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all hover:shadow-lg hover:shadow-emerald-600/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/meetings"
                  className="block text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Meetings
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className="block text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tasks
                </Link>
                <Link
                  href="/analytics"
                  className="block text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="#features"
                  className="block text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="block text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="#integrations"
                  className="block text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Integrations
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all text-center"
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
