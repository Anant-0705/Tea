'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings,
  Phone,
  Clock,
  Video,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: string | number;
  children?: SidebarItem[];
}

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Sidebar navigation items
  const navigationItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard'
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: Video,
      href: '/dashboard/meet',
    
      children: [
        {
          id: 'all-meetings',
          label: 'All Meetings',
          icon: Calendar,
          href: '/dashboard/meet'
        },
        {
          id: 'create-meeting',
          label: 'Create Meeting',
          icon: Clock,
          href: '/schedule'
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics'
    },
    {
      id: 'schedule',
      label: 'Schedule Meeting',
      icon: Calendar,
      href: '/schedule'
    }
  ];



  const bottomItems: SidebarItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings'
    }
  ];

  // Check if current path matches item
  const isActiveItem = (item: SidebarItem): boolean => {
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.href === pathname);
    }
    return pathname.startsWith(item.href) && item.href !== '/';
  };

  // Toggle dropdown
  const toggleDropdown = (itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Render sidebar item
  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = isActiveItem(item);
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownOpen = activeDropdown === item.id;

    return (
      <div key={item.id} className={level > 0 ? 'ml-4' : ''}>
        <motion.div
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleDropdown(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isDropdownOpen ? 'rotate-90' : ''
                    }`}
                  />
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )}
        </motion.div>

        {/* Dropdown children */}
        <AnimatePresence>
          {hasChildren && isDropdownOpen && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 ml-6 space-y-1"
            >
              {item.children?.map(child => renderSidebarItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Don't show sidebar on landing page or auth pages, or on mobile
  if (pathname === '/' || pathname.startsWith('/auth/')) {
    return null;
  }

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 hidden md:block ${
        isCollapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 ${className} shadow-sm`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="w-6 h-6 text-emerald-500" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <span className="text-lg font-bold text-black">
                TEA<span className="text-emerald-500">i</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-black transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main
              </h3>
            )}
            {navigationItems.map(item => renderSidebarItem(item))}
          </div>
        </div>

        {/* User Profile & Bottom Items */}
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Bottom Navigation */}
          <div className="space-y-1">
            {bottomItems.map(item => renderSidebarItem(item))}
          </div>

          {/* User Profile */}
          {session && (
            <div className={`flex items-center gap-3 p-3 rounded-lg bg-gray-50 ${
              isCollapsed ? 'justify-center' : ''
            }`}>
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
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user?.email}
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600 hover:text-black transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tooltip for collapsed items */}
      {isCollapsed && (
        <div className="absolute left-full top-0 h-full pointer-events-none">
          {/* Tooltips will be handled by individual items when hovered */}
        </div>
      )}
    </motion.div>
  );
}