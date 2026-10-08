import React, { useState } from 'react';
import { User, Mail, Lock, Sparkles, X, Globe, AlertCircle, CheckCircle2, ShieldCheck, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { registerWithEmail, loginWithEmail, loginWithGoogle } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import type { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onAuthSuccess: (updatedAccount: Partial<UserAccount>) => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  defaultMode = 'signup',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(currentUser.name || '');
  const [sageloName, setSageloName] = useState(currentUser.sageloName || '');
  const [region, setRegion] = useState(currentUser.region || 'Cameroon');
  const [avatarKey, setAvatarKey] = useState<'mpaka' | 'nyango' | 'mwana'>(currentUser.avatarKey || 'mwana');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showConsoleGuide, setShowConsoleGuide] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const user = await loginWithGoogle();
      setSuccessMsg('Signed in with Google successfully!');
      onAuthSuccess({
        id: user.uid,
        name: user.displayName || displayName.trim() || 'Sagelo Learner',
        email: user.email || '',
        sageloName: sageloName.trim() || `Misaga ${user.displayName || 'Learner'}`,
        region: region.trim() || 'Africa',
        avatarKey,
      });

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      console.error('Google Auth error:', err);
      const code = err instanceof Error ? err.message : String(err);
      if (code.includes('auth/popup-closed-by-user')) {
        setErrorMsg('Sign-in popup was closed before completion. Please try again.');
      } else if (code.includes('auth/cancelled-popup-request')) {
        setErrorMsg('Sign-in cancelled. Please try again.');
      } else if (code.includes('auth/operation-not-allowed')) {
        setErrorMsg('Google Sign-In is not enabled on this Firebase project yet.');
        setShowConsoleGuide(true);
      } else {
        setErrorMsg('Could not complete Google Sign-In. You can continue as a Guest Learner below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSave = () => {
    const finalName = displayName.trim() || currentUser.name || 'Sagelo Learner';
    onAuthSuccess({
      name: finalName,
      sageloName: sageloName.trim() || `Misaga ${finalName}`,
      region: region.trim() || currentUser.region || 'Cameroon',
      avatarKey,
    });
    setSuccessMsg('Profile saved to local device!');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowConsoleGuide(false);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Please enter both email and password.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        const user = await registerWithEmail(
          email.trim(),
          password,
          displayName.trim() || 'Sagelo Learner'
        );

        setSuccessMsg('Account created successfully!');
        onAuthSuccess({
          id: user.uid,
          name: displayName.trim() || user.displayName || 'Sagelo Learner',
          email: user.email || email.trim(),
          sageloName: sageloName.trim() || `Misaga ${displayName.trim() || 'Learner'}`,
          region: region.trim() || 'Africa',
          avatarKey,
        });

        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        // Login mode
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Please enter both email and password.');
          setLoading(false);
          return;
        }

        const user = await loginWithEmail(email.trim(), password);
        setSuccessMsg('Logged in successfully!');
        onAuthSuccess({
          id: user.uid,
          email: user.email || email.trim(),
          name: user.displayName || displayName || 'Sagelo Learner',
        });

        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const code = err instanceof Error ? err.message : String(err);
      if (code.includes('auth/operation-not-allowed')) {
        setErrorMsg(
          'Email/Password sign-in is not enabled on this Firebase project yet. Use "Continue with Google" above, or enable Email/Password in your Firebase Console.'
        );
        setShowConsoleGuide(true);
      } else if (code.includes('auth/email-already-in-use')) {
        setErrorMsg('This email is already registered. Please switch to Sign In.');
      } else if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (code.includes('auth/weak-password')) {
        setErrorMsg('Password should be at least 6 characters.');
      } else if (code.includes('auth/invalid-email')) {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg('Unable to authenticate. Please check your network or try Google Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  const consoleUrl = firebaseConfig.projectId
    ? `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`
    : 'https://console.firebase.google.com';

  return (
    <div className="fixed inset-0 z-50 bg-[#3C3C3C]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#AFAFAF] hover:text-[#3C3C3C] text-xl font-black p-1 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Mascot Greeting */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] text-white flex items-center justify-center text-3xl shrink-0 shadow-sm">
            🦜
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#3C3C3C] tracking-tight">
              {mode === 'signup' ? 'Create Your Profile' : 'Welcome Back!'}
            </h3>
            <p className="text-xs font-bold text-[#777777]">
              {mode === 'signup'
                ? 'Save your streak, earn badges, and sync your wisdom progress!'
                : 'Sign in to sync your Sagelo wisdom journey.'}
            </p>
          </div>
        </div>

        {/* Primary Recommended: Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white hover:bg-[#F7F7F7] active:bg-[#EEEEEE] text-[#3C3C3C] font-black text-sm rounded-2xl border-2 border-b-4 border-[#E5E5E5] hover:border-[#CCCCCC] transition-all flex items-center justify-center gap-3 shadow-xs active:translate-y-0.5 disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-0.5 bg-[#E5E5E5]" />
          <span className="text-[11px] font-black text-[#AFAFAF] uppercase tracking-wider">or with email</span>
          <div className="flex-1 h-0.5 bg-[#E5E5E5]" />
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-[#F7F7F7] p-1.5 rounded-2xl border-2 border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setShowConsoleGuide(false);
            }}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#58CC02] shadow-xs border-2 border-[#58CC02]/30'
                : 'text-[#777777] hover:text-[#3C3C3C]'
            }`}
          >
            Create Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setShowConsoleGuide(false);
            }}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-[#1CB0F6] shadow-xs border-2 border-[#1CB0F6]/30'
                : 'text-[#777777] hover:text-[#3C3C3C]'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="p-3.5 bg-[#FEF2F2] border-2 border-[#FECACA] rounded-2xl text-xs font-bold text-[#DC2626] space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>

            {showConsoleGuide && (
              <div className="pt-2 border-t border-[#FECACA]/60">
                <button
                  type="button"
                  onClick={() => setShowConsoleGuide(!showConsoleGuide)}
                  className="flex items-center gap-1.5 text-[11px] font-black text-[#B91C1C] hover:underline"
                >
                  <span>How to enable Email/Password in Firebase</span>
                  {showConsoleGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <div className="mt-2 text-[11px] space-y-1.5 text-[#7F1D1D] bg-white/70 p-2.5 rounded-xl border border-[#FECACA]">
                  <p>1. Open your Firebase project console:</p>
                  <a
                    href={consoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#2563EB] font-bold hover:underline"
                  >
                    <span>Firebase Auth Sign-in Providers</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p>2. Select <strong>Email/Password</strong> and toggle to <strong>Enable</strong>.</p>
                  <p>3. Click <strong>Save</strong>. You can then sign up with email and password!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-[#DCFCE7] border-2 border-[#86EFAC] rounded-2xl text-xs font-black text-[#166534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[#777777] tracking-wider">
                  Full Name / Learner Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-3 text-[#AFAFAF]" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dienga John"
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#58CC02] focus:outline-hidden font-bold text-sm text-[#3C3C3C]"
                  />
                </div>
              </div>

              {/* Sagelo Moniker */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[#777777] tracking-wider">
                  Sagelo Chosen Title / Clan Moniker
                </label>
                <div className="relative">
                  <Sparkles className="w-5 h-5 absolute left-3.5 top-3 text-[#AFAFAF]" />
                  <input
                    type="text"
                    value={sageloName}
                    onChange={(e) => setSageloName(e.target.value)}
                    placeholder="e.g. Misaga Dienga"
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-[#58CC02]/50 focus:border-[#58CC02] focus:outline-hidden font-bold text-sm text-[#3C3C3C]"
                  />
                </div>
              </div>

              {/* Avatar Character Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-[#777777] tracking-wider">
                  Choose Avatar Persona
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAvatarKey('mwana')}
                    className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                      avatarKey === 'mwana'
                        ? 'border-[#58CC02] bg-[#58CC02]/10 ring-2 ring-[#58CC02]'
                        : 'border-[#E5E5E5] bg-[#F7F7F7] hover:bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-0.5">🧒🏾</div>
                    <div className="text-[11px] font-black text-[#3C3C3C]">Mwana</div>
                    <div className="text-[9px] font-bold text-[#AFAFAF]">Youth Sage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarKey('nyango')}
                    className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                      avatarKey === 'nyango'
                        ? 'border-[#58CC02] bg-[#58CC02]/10 ring-2 ring-[#58CC02]'
                        : 'border-[#E5E5E5] bg-[#F7F7F7] hover:bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-0.5">👩🏾</div>
                    <div className="text-[11px] font-black text-[#3C3C3C]">Nyango</div>
                    <div className="text-[9px] font-bold text-[#AFAFAF]">Scholar</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarKey('mpaka')}
                    className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                      avatarKey === 'mpaka'
                        ? 'border-[#58CC02] bg-[#58CC02]/10 ring-2 ring-[#58CC02]'
                        : 'border-[#E5E5E5] bg-[#F7F7F7] hover:bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-0.5">👴🏾</div>
                    <div className="text-[11px] font-black text-[#3C3C3C]">Mpaka</div>
                    <div className="text-[9px] font-bold text-[#AFAFAF]">Elder Guide</div>
                  </button>
                </div>
              </div>

              {/* Region */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[#777777] tracking-wider">
                  Region / Homeland
                </label>
                <div className="relative">
                  <Globe className="w-5 h-5 absolute left-3.5 top-3 text-[#AFAFAF]" />
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Buea, Cameroon"
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#58CC02] focus:outline-hidden font-bold text-sm text-[#3C3C3C]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-[#777777] tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-[#AFAFAF]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#58CC02] focus:outline-hidden font-bold text-sm text-[#3C3C3C]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-[#777777] tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-[#AFAFAF]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#58CC02] focus:outline-hidden font-bold text-sm text-[#3C3C3C]"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-black uppercase text-sm tracking-wider text-white transition-all active:translate-y-1 shadow-md ${
              mode === 'signup'
                ? 'bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302]'
                : 'bg-[#1CB0F6] hover:bg-[#24B8FB] border-b-4 border-[#1899D6]'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : mode === 'signup' ? (
              'Create Profile with Email'
            ) : (
              'Sign In with Email'
            )}
          </button>
        </form>

        {/* Guest / Offline Profile Option */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGuestSave}
            className="w-full py-2.5 text-xs font-black text-[#777777] hover:text-[#3C3C3C] hover:bg-[#F7F7F7] rounded-xl border border-dashed border-[#E5E5E5] transition-colors flex items-center justify-center gap-2"
          >
            <span>Save Profile Locally as Guest (No Account Required)</span>
          </button>
        </div>

        {/* Security / Free Tier Note */}
        <div className="text-center pt-2 border-t-2 border-[#E5E5E5] flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#AFAFAF]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#58CC02]" />
          <span>Secured via Firebase Firestore & Authentication Free Tier</span>
        </div>
      </div>
    </div>
  );
};
