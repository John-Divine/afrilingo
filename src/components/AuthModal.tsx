import React, { useState } from 'react';
import { User, Mail, Lock, Sparkles, X, Globe, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { registerWithEmail, loginWithEmail, ensureAuth } from '../lib/firebase';
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
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
      if (code.includes('auth/email-already-in-use')) {
        setErrorMsg('This email is already registered. Please switch to Log In.');
      } else if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (code.includes('auth/weak-password')) {
        setErrorMsg('Password should be at least 6 characters.');
      } else if (code.includes('auth/invalid-email')) {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg('Unable to authenticate. Please check your network or try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#3C3C3C]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#AFAFAF] hover:text-[#3C3C3C] text-xl font-black p-1 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Duolingo Mascot Greeting */}
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
                ? 'Save your streak, earn badges, and connect with fellow learners!'
                : 'Log in to continue your Sagelo wisdom journey.'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-[#F7F7F7] p-1.5 rounded-2xl border-2 border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
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
          <div className="p-3.5 bg-[#FEF2F2] border-2 border-[#FECACA] rounded-2xl text-xs font-black text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-[#DCFCE7] border-2 border-[#86EFAC] rounded-2xl text-xs font-black text-[#166534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="e.g. Misaga Dienga (Sage Dienga)"
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#58CC02] focus:outline-hidden font-bold text-sm text-[#3C3C3C]"
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
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                      avatarKey === 'mwana'
                        ? 'border-[#58CC02] bg-[#58CC02]/10 ring-2 ring-[#58CC02]'
                        : 'border-[#E5E5E5] bg-[#F7F7F7] hover:bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">🧒🏾</div>
                    <div className="text-[11px] font-black text-[#3C3C3C]">Mwana</div>
                    <div className="text-[9px] font-bold text-[#AFAFAF]">Youth Sage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarKey('nyango')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                      avatarKey === 'nyango'
                        ? 'border-[#58CC02] bg-[#58CC02]/10 ring-2 ring-[#58CC02]'
                        : 'border-[#E5E5E5] bg-[#F7F7F7] hover:bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">👩🏾</div>
                    <div className="text-[11px] font-black text-[#3C3C3C]">Nyango</div>
                    <div className="text-[9px] font-bold text-[#AFAFAF]">Scholar</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarKey('mpaka')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                      avatarKey === 'mpaka'
                        ? 'border-[#58CC02] bg-[#58CC02]/10 ring-2 ring-[#58CC02]'
                        : 'border-[#E5E5E5] bg-[#F7F7F7] hover:bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">👴🏾</div>
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

          {/* 3D Action Button */}
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
              'Create Profile'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Security / Free Tier Note */}
        <div className="text-center pt-2 border-t-2 border-[#E5E5E5] flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#AFAFAF]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#58CC02]" />
          <span>Secured via Firebase Firestore & Authentication Free Tier</span>
        </div>
      </div>
    </div>
  );
};
