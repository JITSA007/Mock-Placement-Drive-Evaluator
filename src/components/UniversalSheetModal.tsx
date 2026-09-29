import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Zap,
  RefreshCw,
  Sparkles,
  Database,
} from 'lucide-react';

interface UniversalSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterSheetConfig: {
    webhookUrl?: string;
    spreadsheetId?: string;
    ownerEmail?: string;
    lastSyncedAt?: string;
    syncCount?: number;
  };
  onSaveMasterSheetConfig: (config: { webhookUrl?: string; spreadsheetId?: string }) => Promise<void>;
  onForceSyncAll: () => Promise<void>;
  evaluationsCount: number;
  candidatesCount: number;
}

export const UniversalSheetModal: React.FC<UniversalSheetModalProps> = ({
  isOpen,
  onClose,
  masterSheetConfig,
  onSaveMasterSheetConfig,
  onForceSyncAll,
  evaluationsCount,
}) => {
  const [webhookUrlInput, setWebhookUrlInput] = useState(masterSheetConfig.webhookUrl || '');
  const [sheetIdInput, setSheetIdInput] = useState(masterSheetConfig.spreadsheetId || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const APPS_SCRIPT_CODE = `// ========================================================
// CAMPUS PLACEMENT DRIVE - UNIVERSAL MASTER SHEET SCRIPT
// Single sheet destination for all 6 evaluators
// ========================================================
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    
    // Action 1: Clear & Full Sync of all records
    if (payload.action === "clear_and_sync") {
      sheet.clearContents();
      sheet.appendRow(payload.headers);
      
      // Format Header Row
      var headerRange = sheet.getRange(1, 1, 1, payload.headers.length);
      headerRange.setBackground("#1b5e20").setFontColor("#ffffff").setFontWeight("bold");
      
      for (var i = 0; i < payload.rows.length; i++) {
        sheet.appendRow(payload.rows[i]);
      }
      return ContentService.createTextOutput("Synced " + payload.rows.length + " records successfully.");
    }
    
    // Action 2: Auto Append single evaluation from any interviewer
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Sr No", "Timestamp", "Roll No", "Student Name", "Degree", "Target Role", "Round", "Total Score (/50)", "Verdict", "Evaluator Name", "Custom Remarks", "AI Feedback"]);
      sheet.getRange(1, 1, 1, 12).setBackground("#1b5e20").setFontColor("#ffffff").setFontWeight("bold");
    }
    
    sheet.appendRow([
      payload.srNo || sheet.getLastRow(),
      payload.timestamp || new Date().toLocaleString(),
      payload.rollNo,
      payload.studentName,
      payload.degree,
      payload.targetRole,
      payload.evaluationType === "GD" ? "Group Discussion (50M)" : "Personal Interview (50M)",
      payload.totalScore + "/50",
      payload.verdict || "Evaluated",
      payload.interviewerName,
      payload.customFeedback || "",
      payload.aiFeedback || ""
    ]);
    
    return ContentService.createTextOutput("Success: Evaluation Recorded");
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString());
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await onSaveMasterSheetConfig({
        webhookUrl: webhookUrlInput.trim(),
        spreadsheetId: sheetIdInput.trim(),
      });
      setStatusMessage('Universal Master Google Sheet successfully connected!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage(err.message || 'Error saving configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFullSync = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      await onForceSyncAll();
      setStatusMessage(`Successfully synchronized all ${evaluationsCount} records to your Master Google Sheet!`);
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to sync to master sheet');
    } finally {
      setIsSyncing(false);
    }
  };

  const isConnected = !!masterSheetConfig.webhookUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 sm:p-6 flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-2xl text-emerald-300 shadow-md">
              <Database size={26} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Universal Master Google Sheet
                </h2>
                <span className="px-2 py-0.5 bg-emerald-700 text-emerald-200 text-[10px] rounded-full font-bold">
                  1 Central Destination
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Owned by <span className="font-bold underline text-white">jitsahere@gmail.com</span> • All 6 Evaluators reflect here
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-700/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className={`px-6 py-2.5 flex items-center justify-between text-xs border-b ${
          isConnected
            ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
            : 'bg-amber-50 text-amber-950 border-amber-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="font-bold">
              {isConnected
                ? 'Universal Sync Active: Evaluations from all interviewers flow into your single sheet'
                : 'Webhook not connected yet. Follow the 2-minute setup below.'}
            </span>
          </div>

          {masterSheetConfig.lastSyncedAt && (
            <span className="text-[11px] text-slate-500">
              Last synced: {masterSheetConfig.lastSyncedAt}
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
          {statusMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <Check size={16} className="text-emerald-700 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Explanation Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <Sparkles size={14} className="text-blue-600" />
              <span>How This Solves Multi-User Sync into a Single Sheet:</span>
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              When <strong>Sahin, Ashad, Harleen, Gunjan, Aditi, or Jitendra</strong> marks any candidate, the app automatically triggers your Google Sheet Webhook. Because the webhook runs under your account (<code className="font-mono text-blue-700">jitsahere@gmail.com</code>), <strong>the single master sheet updates immediately without other interviewers ever needing Google logins or permissions!</strong>
            </p>
          </div>

          {/* 3 Step Setup Guide */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              2-Minute Setup in your Google Sheet:
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px]">1</span>
                <span>Open your Google Sheet & Apps Script</span>
              </div>
              <p className="text-[11px] text-slate-600 pl-7">
                Open your Google Sheet on <span className="font-semibold text-slate-800">jitsahere@gmail.com</span>, then click <strong>Extensions ➔ Apps Script</strong> from the top menu.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px]">2</span>
                  <span>Paste this Ready-to-Use Script</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center space-x-1"
                >
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600 pl-7">
                Replace any existing code in the Apps Script editor with this code and click the 💾 <strong>Save</strong> icon.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px]">3</span>
                <span>Deploy as Web App & Paste URL below</span>
              </div>
              <p className="text-[11px] text-slate-600 pl-7 leading-relaxed">
                Click <strong>Deploy ➔ New deployment</strong>.<br />
                Select type: <strong>Web app</strong>.<br />
                Execute as: <strong>Me (jitsahere@gmail.com)</strong>.<br />
                Who has access: <strong>Anyone</strong>.<br />
                Click <strong>Deploy</strong> and copy the generated Web App URL.
              </p>
            </div>
          </div>

          {/* Webhook Configuration Form */}
          <form onSubmit={handleSave} className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1">
                Your Google Sheet Web App Webhook URL:
              </label>
              <input
                type="url"
                value={webhookUrlInput}
                onChange={(e) => setWebhookUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                required
                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-emerald-800 mt-1 block">
                Paste the URL copied from Step 3 here.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1">
                Optional: Google Sheet Link / ID (for quick "Open Sheet" button):
              </label>
              <input
                type="text"
                value={sheetIdInput}
                onChange={(e) => setSheetIdInput(e.target.value)}
                placeholder="Paste your Google Sheet URL (https://docs.google.com/spreadsheets/d/...)"
                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Zap size={13} />
                <span>{isSaving ? 'Connecting...' : 'Connect Universal Master Sheet'}</span>
              </button>

              {isConnected && (
                <button
                  type="button"
                  onClick={handleFullSync}
                  disabled={isSyncing}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center space-x-1.5"
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Writing all records...' : `Sync All Records (${evaluationsCount}) Now`}</span>
                </button>
              )}

              {sheetIdInput && (
                <a
                  href={sheetIdInput.startsWith('http') ? sheetIdInput : `https://docs.google.com/spreadsheets/d/${sheetIdInput}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-emerald-800 hover:text-emerald-950 text-xs font-bold flex items-center space-x-1 underline ml-auto"
                >
                  <span>Open Master Sheet</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-between items-center text-xs">
          <span className="text-[11px] text-slate-500">
            {isConnected ? '✓ All 6 evaluators writing to single sheet' : 'Not yet connected'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
