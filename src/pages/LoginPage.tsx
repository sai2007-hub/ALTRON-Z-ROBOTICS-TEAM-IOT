import React, { useState } from 'react';
import { PageView } from '../components/layout/Navbar';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { AltronzLogo } from '../components/common/AltronzLogo';

interface LoginPageProps {
  setCurrentView: (view: PageView) => void;
  onOpenRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentView, onOpenRegister }) => {
  const { loginWithGoogle, loginWithEmail, isAdmin, currentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated as admin, allow quick continue
  React.useEffect(() => {
    if (isAdmin) {
      setCurrentView('admin');
    }
  }, [isAdmin, setCurrentView]);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const result = await loginWithGoogle();
    setIsSubmitting(false);

    if (result.success) {
      setCurrentView('admin');
    } else {
      setErrorMsg(result.error || 'Failed to authenticate via Firebase Google Auth.');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = await loginWithEmail(email, password);
    setIsSubmitting(false);

    if (result.success) {
      setCurrentView('admin');
    } else {
      setErrorMsg(
        result.error ||
          'Invalid Firebase administrative credentials. Ensure email/password provider is enabled in Firebase Console or sign in with Google.'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-[#0C0F17] border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Red accent glow top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-700"></div>

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <AltronzLogo size="md" showSubtitle={false} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Authentication</h1>
          <p className="text-xs text-zinc-400">
            Secure Firebase Authentication for ALTRON&apos;Z ROBOTICS TEAM &amp; IOT operations staff.
          </p>
        </div>

        {/* Security Notice regarding public vs admin */}
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Role-Based Access Control:</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Admin privileges are strictly evaluated against authorized administrator credentials and verified Cloud Firestore security rules. Public student registrations never grant administrative rights.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Method: Google Sign-In with Firebase Auth */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-zinc-100 disabled:opacity-50 text-zinc-900 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2.5 shadow-md focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google Admin Account</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-3 text-[11px] text-zinc-500 font-mono">OR EMAIL AUTH</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Secondary Method: Email & Password */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="ssmssai2007@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#07090D] border border-zinc-800 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#07090D] border border-zinc-800 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
              />
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Verifying with Firebase...' : 'Sign In with Email'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Public registration fallback */}
        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-800/80">
          Are you a student registering for events?{' '}
          <button
            onClick={onOpenRegister}
            className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2 ml-1"
          >
            Open Public Registration Portal
          </button>
        </div>
      </div>
    </div>
  );
};
