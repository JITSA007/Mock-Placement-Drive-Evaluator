import React, { useState } from 'react';
import {
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { AppUser } from '../types';

interface LoginGateProps {
  onLoginWithCredentials: (username: string, password: string) => boolean;
  onLoginWithGoogle: () => void;
  onGoToStudentBoard: () => void;
  isLoggingIn: boolean;
  users: AppUser[];
}

export const LoginGate: React.FC<LoginGateProps> = ({
  onLoginWithCredentials,
  onLoginWithGoogle,
  onGoToStudentBoard,
  isLoggingIn,
  users,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }

    const success = onLoginWithCredentials(usernameInput.trim(), passwordInput.trim());
    if (!success) {
      setLoginError('Invalid username or password. Please re-check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between items-center p-4 sm:p-6 text-slate-100 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner Navigation */}
      <div className="w-full max-w-4xl flex justify-between items-center py-2 z-10">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <ShieldCheck size={16} className="text-blue-500" />
          <span>Official Evaluator Security Gate</span>
        </div>

        {/* Link for students to view public board */}
        <button
          onClick={onGoToStudentBoard}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
        >
          <span>Student Shortlist Board (Read-Only)</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Central Login Card */}
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl text-white">
            <Lock size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Interviewer Portal Login
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted to authorized campus drive evaluators & coordinators
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {loginError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2 text-xs text-red-400 animate-in fade-in">
            <AlertCircle size={15} className="shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Evaluator Username
            </label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. sahin, ashad, harleen, gunjan, aditi, jitendra"
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono lowercase"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                Forgot / Panel Help?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter your evaluator password"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Key size={14} />
            <span>Unlock & Access Evaluation Suite</span>
          </button>
        </form>

        {/* Panel Help Drawer */}
        {showHelp && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-2 animate-in fade-in">
            <div className="font-bold text-slate-300 flex items-center space-x-1.5 text-[11px]">
              <HelpCircle size={13} className="text-amber-400" />
              <span>Assigned Evaluator Usernames:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setUsernameInput(u.username);
                    setPasswordInput(u.password);
                  }}
                  className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 hover:border-blue-500/50 cursor-pointer flex justify-between"
                  title="Click to fill username"
                >
                  <span className="font-semibold text-white">{u.name}</span>
                  <span className="font-mono text-slate-400">@{u.username}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic pt-1">
              Initial password format is: [name]@123 (e.g., sahin@123). You can update your password once logged in.
            </p>
          </div>
        )}

        {/* Optional Google Login */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            onClick={onLoginWithGoogle}
            disabled={isLoggingIn}
            className="text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center space-x-1.5 text-[11px]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.27C.46 8.2.01 10.04.01 12s.45 3.8 1.26 5.42l4.01-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.27 6.58l4.01 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Or Sign in with Authorized Google Account</span>
          </button>
        </div>
      </div>

      {/* Bottom Switch to Student Notice Board */}
      <div className="w-full max-w-md text-center py-4 z-10">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-400">
          <span>Are you a student attending this placement drive?</span>
          <button
            type="button"
            onClick={onGoToStudentBoard}
            className="block w-full text-center text-blue-400 hover:text-blue-300 font-bold mt-1 text-xs"
          >
            Go to Student Live Notice Board & Shortlist Tracker →
          </button>
        </div>
      </div>
    </div>
  );
};
