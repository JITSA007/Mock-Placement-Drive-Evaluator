import React from 'react';
import { User } from 'firebase/auth';
import { LogOut, ExternalLink, RefreshCw, Database } from 'lucide-react';

interface InterviewerLoginBarProps {
  currentUser: User | null;
  spreadsheetId: string | null;
  isLoggingIn: boolean;
  isSyncingSheets: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onManualSync: () => void;
}

export const InterviewerLoginBar: React.FC<InterviewerLoginBarProps> = ({
  currentUser,
  spreadsheetId,
  isLoggingIn,
  isSyncingSheets,
  onLogin,
  onLogout,
  onManualSync,
}) => {
  return (
    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
        {/* Left side: Database Status */}
        <div className="flex items-center space-x-2">
          <Database size={15} className="text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-700">Google Sheets Database:</span>
          {currentUser && spreadsheetId ? (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active & Synced</span>
              </span>
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 underline text-[11px]"
                title="Open live Google Sheets database file in a new tab"
              >
                <span>Open in Google Sheets</span>
                <ExternalLink size={11} />
              </a>
            </div>
          ) : (
            <span className="text-slate-500 text-[11px]">
              {currentUser ? 'Connecting to spreadsheet...' : 'Sign in below to link live Google Sheet'}
            </span>
          )}
        </div>

        {/* Right side: Interviewer User Login controls */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {currentUser ? (
            <div className="flex items-center space-x-2.5">
              {spreadsheetId && (
                <button
                  onClick={onManualSync}
                  disabled={isSyncingSheets}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors flex items-center space-x-1 disabled:opacity-50"
                  title="Push latest evaluations to Google Sheets"
                >
                  <RefreshCw size={11} className={isSyncingSheets ? 'animate-spin' : ''} />
                  <span>{isSyncingSheets ? 'Syncing...' : 'Sync to Sheets'}</span>
                </button>
              )}

              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Interviewer'}
                    className="w-6 h-6 rounded-full border border-slate-300"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
                  </div>
                )}
                <div className="text-left">
                  <div className="font-bold text-slate-900 leading-tight">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none">Interviewer Logged In</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Sign out of Google"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            /* Official Google Sign-in button */
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all hover:border-slate-400"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>{isLoggingIn ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
