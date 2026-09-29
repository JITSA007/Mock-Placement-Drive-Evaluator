import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ExternalLink,
  Cloud,
} from 'lucide-react';
import { EvaluationRecord, Candidate } from '../types';
import { exportEvaluationsToExcel, exportEvaluationsToCSV } from '../utils/excelUtils';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluations: EvaluationRecord[];
  candidates: Candidate[];
  onSignInGoogle?: () => void;
  isGoogleConnected: boolean;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
  evaluations,
  candidates,
  onSignInGoogle,
  isGoogleConnected,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate Tab-Separated Values (TSV) which pastes cleanly into any Google Sheet
  const generateTSV = () => {
    const headers = [
      'Sr No',
      'Timestamp',
      'Roll Number',
      'Student Name',
      'Target Role',
      'Degree',
      'Round Type',
      'Total Score (/50)',
      'Verdict',
      'Evaluator Name',
      'Evaluator Remarks',
      'AI Feedback',
    ];

    const rows = evaluations.map((e) => [
      e.srNo,
      e.timestamp,
      e.rollNo,
      e.studentName,
      e.targetRole,
      e.degree,
      e.evaluationType === 'GD' ? 'Group Discussion' : 'Personal Interview',
      `${e.totalScore}/50`,
      e.automatedReview?.verdict || 'Recorded',
      e.interviewerName,
      `"${(e.customFeedback || e.interviewerRemarks || '').replace(/"/g, '""')}"`,
      `"${(e.aiFeedback || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
  };

  const handleCopyAndOpenGoogleSheets = () => {
    const tsv = generateTSV();
    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
      window.open('https://sheets.new', '_blank');
    });
  };

  const handleCopyOnly = () => {
    const tsv = generateTSV();
    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 sm:p-6 flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-md">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Export to Google Sheets & Excel
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                {evaluations.length} evaluation{evaluations.length === 1 ? '' : 's'} recorded across {candidates.length} candidate{candidates.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Options */}
        <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
          {/* Method 1: Instant Google Sheets Open */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-bold text-[10px] uppercase tracking-wider">
                  Recommended for Vercel
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">
                  1-Click Open in Google Sheets
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Copies all {evaluations.length} student scores to your clipboard and opens a fresh Google Sheet. Just press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800">Ctrl+V</kbd> (or <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800">Cmd+V</kbd>) to paste!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleCopyAndOpenGoogleSheets}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition-colors text-xs"
              >
                {copied ? <Check size={14} /> : <ExternalLink size={14} />}
                <span>{copied ? 'Copied! Opening Google Sheets...' : 'Copy & Open in Google Sheets'}</span>
              </button>

              <button
                onClick={handleCopyOnly}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors text-xs"
              >
                <Copy size={13} />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Data Only'}</span>
              </button>
            </div>
          </div>

          {/* Method 2: Direct File Downloads (Excel .xlsx & CSV) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Download Offline Spreadsheets:
            </h3>
            <p className="text-[11px] text-slate-500">
              True native Microsoft Excel workbook or standard comma-separated file for university archives.
            </p>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => exportEvaluationsToExcel(evaluations)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-xs transition-colors text-xs"
              >
                <Download size={13} />
                <span>Download Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => exportEvaluationsToCSV(evaluations)}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors text-xs"
              >
                <Download size={13} />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          {/* Method 3: Optional Google OAuth Cloud Sync */}
          {!isGoogleConnected && onSignInGoogle && (
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-blue-950">
                <Cloud size={16} className="text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold">Want automatic cloud sync in the background?</span>
                  <div className="text-[11px] text-blue-700">
                    Sign in with Google to auto-write each evaluation as a row to your Google Drive.
                  </div>
                </div>
              </div>

              <button
                onClick={onSignInGoogle}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shrink-0 shadow-2xs"
              >
                Sign in with Google
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
