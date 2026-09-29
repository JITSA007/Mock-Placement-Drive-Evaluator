import React from 'react';
import {
  Briefcase,
  Database,
  Lock,
  ArrowRight,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface LoginGateProps {
  onLogin: () => void;
  onContinueAsGuest: () => void;
  isLoggingIn: boolean;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  onLogin,
  onContinueAsGuest,
  isLoggingIn,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans">
      <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-lg text-white">
            <Briefcase size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Mock Placement Drive Evaluator
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Secured Evaluation Portal • Google Sheets Database
            </p>
          </div>
        </div>

        {/* What does Login do? Clear visual guide */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
          <div className="flex items-center space-x-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
            <ShieldCheck size={16} />
            <span>Why Log In as an Interviewer?</span>
          </div>

          <div className="space-y-3 text-slate-300">
            <div className="flex items-start space-x-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg mt-0.5 shrink-0">
                <Database size={15} />
              </div>
              <div>
                <strong className="text-white block font-semibold">Google Sheets as your Live Database</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed">
                  The application connects to your Google Drive to create or update a dedicated spreadsheet (<code>Mock Placement Drive Database</code>). Every student evaluation is written directly as a row in your Google Sheet in real time.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg mt-0.5 shrink-0">
                <Lock size={15} />
              </div>
              <div>
                <strong className="text-white block font-semibold">Authenticated Evaluator Identity</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed">
                  Your Google identity is stamped onto every scorecard and feedback entry, maintaining audit integrity across panel rounds.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg mt-0.5 shrink-0">
                <Users size={15} />
              </div>
              <div>
                <strong className="text-white block font-semibold">Real-Time Multi-User Collaboration</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed">
                  Evaluators conducting parallel GD batches and PI rounds see candidate qualification statuses reflected dynamically across sessions.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action: Sign in with Google */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-3 hover:shadow-xl disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>{isLoggingIn ? 'Signing in with Google...' : 'Sign in with Google Account'}</span>
          </button>

          {/* Guest fallback for testing / offline preview */}
          <div className="text-center pt-2">
            <button
              onClick={onContinueAsGuest}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline font-medium inline-flex items-center space-x-1"
            >
              <span>Or explore in Demo Mode (without Google Sheets sync)</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
