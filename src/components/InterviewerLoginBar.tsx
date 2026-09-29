import React from 'react';
import { LogOut, ExternalLink, RefreshCw, Database, Users, FileSpreadsheet } from 'lucide-react';

interface InterviewerLoginBarProps {
  currentInterviewer: {
    name: string;
    username?: string;
    role?: string;
    panel?: string;
    email?: string;
    photoURL?: string;
  } | null;
  spreadsheetId: string | null;
  isSyncingSheets: boolean;
  onLogout: () => void;
  onManualSync: () => void;
  onOpenUserManagement: () => void;
  onOpenUniversalSheetModal?: () => void;
  isMasterSheetConnected?: boolean;
}

export const InterviewerLoginBar: React.FC<InterviewerLoginBarProps> = ({
  currentInterviewer,
  spreadsheetId,
  isSyncingSheets,
  onLogout,
  onManualSync,
  onOpenUserManagement,
  onOpenUniversalSheetModal,
  isMasterSheetConnected = false,
}) => {
  const getSheetLink = () => {
    if (!spreadsheetId) return null;
    if (spreadsheetId.startsWith('http')) return spreadsheetId;
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  };

  const sheetLink = getSheetLink();

  return (
    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
        {/* Left side: Database Status */}
        <div className="flex items-center space-x-2 flex-wrap">
          <Database size={15} className="text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-700">Universal Master Sheet:</span>

          {isMasterSheetConnected ? (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                <span>Active • Auto-Syncing all 6 Evaluators</span>
              </span>
              {sheetLink && (
                <a
                  href={sheetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 underline text-[11px]"
                  title="Open live Google Sheets database file in a new tab"
                >
                  <span>Open Sheet</span>
                  <ExternalLink size={11} />
                </a>
              )}
              {onOpenUniversalSheetModal && (
                <button
                  onClick={onOpenUniversalSheetModal}
                  className="text-emerald-800 hover:text-emerald-950 font-semibold underline text-[11px]"
                >
                  Manage Sheet ⚙
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 text-[11px]">
                Internal Server Storage Active
              </span>
              {onOpenUniversalSheetModal && (
                <button
                  onClick={onOpenUniversalSheetModal}
                  className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-colors"
                  title="Connect a single Google Sheet for all 6 evaluators"
                >
                  <span>⚡ Link Universal Sheet (jitsahere@gmail.com)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right side: Interviewer User Login controls */}
        <div className="flex items-center space-x-2.5 self-end sm:self-auto flex-wrap">
          {/* Manage Users Table Button */}
          <button
            onClick={onOpenUserManagement}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200"
            title="Manage Interviewers and set passwords table"
          >
            <Users size={12} className="text-blue-600" />
            <span>Manage Logins Table</span>
          </button>

          {/* Export / Sync to Sheets Button */}
          <button
            onClick={onManualSync}
            disabled={isSyncingSheets}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-semibold transition-colors flex items-center space-x-1 disabled:opacity-50"
            title="Export or sync evaluations to Google Sheets / Excel"
          >
            {isSyncingSheets ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={12} className="text-emerald-700" />
            )}
            <span>{isSyncingSheets ? 'Syncing...' : 'Export to Sheets'}</span>
          </button>

          {currentInterviewer && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                {currentInterviewer.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 leading-tight">
                  {currentInterviewer.name}
                </div>
                <div className="text-[10px] text-slate-400 leading-none">
                  {currentInterviewer.panel?.split(' - ')[0] || currentInterviewer.role || 'Evaluator Logged In'}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-[11px] font-bold transition-colors ml-1 flex items-center space-x-1 shadow-2xs"
                title="Lock evaluation portal and return to login page"
              >
                <LogOut size={12} />
                <span>Lock & Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

