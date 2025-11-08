'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Show navbar only on landing page
  const showNavbar = pathname === '/';
  // Show sidebar on all pages except landing page and auth pages
  const showSidebar = pathname !== '/' && !pathname.startsWith('/auth/');

  // Landing page layout
  if (pathname === '/') {
    return (
      <>
        <Navbar />
        {children}
      </>
    );
  }

  // Auth pages layout
  if (pathname.startsWith('/auth/')) {
    return <>{children}</>;
  }

  // Dashboard/app pages layout
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && showSidebar && <Sidebar />}
      
      {/* Main Content Area */}
      <div className={isMobile || !showSidebar ? '' : 'pl-64'}>
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}