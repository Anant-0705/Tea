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
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-black mb-4">
            Authentication Error
          </h1>
          
          <p className="text-gray-600 mb-2">
            {getErrorMessage(error)}
          </p>
          
          <p className="text-gray-500 text-sm mb-8">
            {getErrorDetails(error)}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs font-mono">
                Error Code: {error}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Try Signing In Again
            </Link>
            
            <Link
              href="/"
              className="px-6 py-3 bg-gray-100 text-black rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2 border border-gray-200"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </motion.div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Need help? Contact{' '}
            <a href="mailto:support@teai.com" className="text-emerald-500 hover:text-emerald-600">
              support@teai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}