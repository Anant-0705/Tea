'use client';

import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access was denied. You may not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or is invalid.';
      case 'Default':
      default:
        return 'An unexpected error occurred during authentication.';
    }
  };

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Please contact your administrator or try again later.';
      case 'AccessDenied':
        return 'Make sure you have the necessary permissions or contact support.';
      case 'Verification':
        return 'Please try signing in again.';
      case 'Default':
      default:
        return 'Please try signing in again. If the problem persists, contact support.';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Authentication Error
          </h1>
          
          <p className="text-zinc-400 mb-2">
            {getErrorMessage(error)}
          </p>
          
          <p className="text-zinc-500 text-sm mb-8">
            {getErrorDetails(error)}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-xs font-mono">
                Error Code: {error}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Try Signing In Again
            </Link>
            
            <Link
              href="/"
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </motion.div>

        <div className="mt-6 text-center text-sm text-zinc-500">
          <p>
            Need help? Contact{' '}
            <a href="mailto:support@autotrack.com" className="text-blue-400 hover:text-blue-300">
              support@autotrack.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}