import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Trophy,
  Eye,
  Trash2,
  Layers,
  Database,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Candidate, EvaluationRecord } from '../types';
import { exportEvaluationsToExcel, exportEvaluationsToCSV } from '../utils/excelUtils';

interface SpreadsheetViewProps {
  evaluations: EvaluationRecord[];
  candidates: Candidate[];
  onDeleteRecord: (id: string) => void;
  onViewReview: (record: EvaluationRecord) => void;
  onEditAmcat?: (candidate: Candidate) => void;
  spreadsheetId?: string | null;
  onManualSync?: () => void;
  isSyncingSheets?: boolean;
  onOpenUniversalSheetModal?: () => void;
  isMasterSheetConnected?: boolean;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  evaluations,
  candidates,
  onDeleteRecord,
  onViewReview,
  onEditAmcat,
  spreadsheetId,
  onManualSync,
  isSyncingSheets,
  onOpenUniversalSheetModal,
  isMasterSheetConnected = false,
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<'evaluations' | 'leaderboard'>('evaluations');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Filtered evaluations
  const filteredEvaluations = evaluations.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.interviewerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.evaluationType === typeFilter;
    const matchesRole = roleFilter === 'all' || item.targetRole === roleFilter;
    return matchesSearch && matchesType && matchesRole;
  });

  // Combined Leaderboard calculations (from PDF Page 1 & 2: GD 50 + PI 50 = 100 Marks + AMCAT score)
  const leaderboardData = candidates.map((cand) => {
    const gdEval = evaluations.find(
      (e) => (e.candidateId === cand.id || e.rollNo === cand.rollNo) && e.evaluationType === 'GD'
    );
    const piEval = evaluations.find(
      (e) => (e.candidateId === cand.id || e.rollNo === cand.rollNo) && e.evaluationType === 'PI'
    );

    const gdScore = gdEval ? gdEval.totalScore : 0;
    const piScore = piEval ? piEval.totalScore : 0;
    const driveTotal = gdScore + piScore; // Out of 100
    const compositeScore = Math.round(driveTotal * 0.7 + (cand.amcatScore / 900) * 30); // 70% drive + 30% AMCAT

    return {
      candidate: cand,
      gdEval,
      piEval,
      gdScore,
      piScore,
      driveTotal,
      compositeScore,
      hasCompletedGD: !!gdEval,
      hasCompletedPI: !!piEval,
    };
  }).sort((a, b) => b.compositeScore - a.compositeScore);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[750px]">
      {/* Top Google Sheets Brand Bar */}
      <div className="bg-emerald-800 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <FileSpreadsheet size={24} className="text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold">Placement Drive Master Google Sheet</h2>
              <span className="px-2 py-0.5 bg-emerald-700 text-emerald-200 text-[10px] rounded-md border border-emerald-600/50 uppercase tracking-wider font-semibold">
                Live Data Synchronized
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Reflects Group Discussion (50M), Personal Interview (50M) & AMCAT Leaderboard
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={() => exportEvaluationsToExcel(evaluations)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
            title="Download true .xlsx Excel file"
          >
            <Download size={14} />
            <span>Export to Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => exportEvaluationsToCSV(evaluations)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium flex items-center space-x-1 transition-all"
          >
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Database Status Banner */}
      <div className="bg-emerald-50/90 border-b border-emerald-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-emerald-950">
        <div className="flex items-center space-x-2">
          <Database size={16} className="text-emerald-700 shrink-0" />
          <div>
            <div className="font-bold flex items-center space-x-1.5">
              <span>Universal Master Google Sheet (jitsahere@gmail.com):</span>
              {isMasterSheetConnected ? (
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-bold text-[11px] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Active & Auto-Syncing</span>
                </span>
              ) : (
                <span className="text-amber-800 font-semibold">
                  (Click to link your single master sheet)
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-800">
              {isMasterSheetConnected
                ? 'All evaluations submitted by any of the 6 interviewers automatically write to your single sheet.'
                : 'Connect your Google Sheet Webhook once so all evaluators write to your single sheet without Google logins.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto flex-wrap">
          {onManualSync && (
            <button
              onClick={onManualSync}
              disabled={isSyncingSheets}
              className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold shadow-2xs flex items-center space-x-1 transition-colors disabled:opacity-50"
              title="Sync or export all evaluations to Google Sheets / Excel"
            >
              <RefreshCw size={12} className={isSyncingSheets ? 'animate-spin' : ''} />
              <span>{isSyncingSheets ? 'Syncing...' : 'Export / Sync'}</span>
            </button>
          )}

          {onOpenUniversalSheetModal && (
            <button
              onClick={onOpenUniversalSheetModal}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center space-x-1 transition-colors"
            >
              <span>{isMasterSheetConnected ? 'Manage Master Sheet ⚙' : '⚡ Connect Universal Sheet'}</span>
            </button>
          )}

          {spreadsheetId && (
            <a
              href={spreadsheetId.startsWith('http') ? spreadsheetId : `https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold shadow-2xs flex items-center space-x-1 transition-colors"
            >
              <span>Open Sheet</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="bg-gray-100 border-b border-gray-200 px-6 pt-3 flex space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSheetTab('evaluations')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeSheetTab === 'evaluations'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers size={14} />
          <span>Evaluation Records ({evaluations.length} entries)</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('leaderboard')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeSheetTab === 'leaderboard'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Trophy size={14} className="text-amber-500" />
          <span>AMCAT & Drive Leaderboard (100 Marks)</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, roll no, or interviewer..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-medium hidden sm:inline">Filters:</span>
          {activeSheetTab === 'evaluations' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-xs"
            >
              <option value="all">All Rounds</option>
              <option value="GD">GD Round (50M)</option>
              <option value="PI">PI Round (50M)</option>
            </select>
          )}

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-xs"
          >
            <option value="all">All Roles</option>
            <option value="Full Stack Developer">Full Stack</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="Tech Sales">Tech Sales</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        {activeSheetTab === 'evaluations' ? (
          <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-100/90 text-gray-700 sticky top-0 border-b border-gray-200 shadow-xs">
              <tr>
                <th className="py-2.5 px-3 border-r border-gray-200 font-bold w-12 text-center">Sr</th>
                <th className="py-2.5 px-3 border-r border-gray-200 font-semibold whitespace-nowrap">Timestamp</th>
                <th className="py-2.5 px-3 border-r border-gray-200 font-semibold whitespace-nowrap">Student Name</th>
                <th className="py-2.5 px-3 border-r border-gray-200 font-semibold whitespace-nowrap">Roll No</th>
                <th className="py-2.5 px-3 border-r border-gray-200 font-semibold whitespace-nowrap">Target Role</th>
                <th className="py-2.5 px-3 border-r border-gray-200 font-semibold text-center whitespace-nowrap">Round</th>
                <th className="py-2.5 px-3 border-r border-gray-200 font-semibold text-center whitespace-nowrap">Total / 50</th>
                <th className="py-2.5 px-3 border-r border-gray-200 font-semibold text-center whitespace-nowrap">Verdict</th>
                <th className="py-2.5 px-3 border-r border-gray-200 font-semibold whitespace-nowrap">Interviewer</th>
                <th className="py-2.5 px-3 border-r border-gray-200 font-semibold min-w-[200px]">Remarks / Feedback</th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">
                    No evaluation entries found. Conduct an interview or GD scoring above.
                  </td>
                </tr>
              ) : (
                filteredEvaluations.map((row) => (
                  <tr key={row.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-2.5 px-3 border-r border-gray-200 text-center font-mono text-gray-500">
                      {row.srNo}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap text-gray-500 text-[11px]">
                      {row.timestamp}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 font-bold text-gray-900 whitespace-nowrap">
                      {row.studentName}
                      <span className="ml-1.5 px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[10px] font-normal">
                        {row.degree}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 font-mono text-gray-700 whitespace-nowrap">
                      {row.rollNo}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.targetRole === 'Full Stack Developer'
                            ? 'bg-blue-100 text-blue-800'
                            : row.targetRole === 'Data Analyst'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.targetRole === 'Tech Sales'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {row.targetRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.evaluationType === 'GD'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {row.evaluationType} (50M)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-center font-bold text-sm whitespace-nowrap">
                      <span
                        className={`${
                          row.totalScore >= 40
                            ? 'text-emerald-600'
                            : row.totalScore >= 30
                            ? 'text-blue-600'
                            : row.totalScore >= 25
                            ? 'text-amber-600'
                            : 'text-red-500'
                        }`}
                      >
                        {row.totalScore}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">/50</span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.automatedReview.verdict === 'Strong Shortlist'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : row.automatedReview.verdict === 'Recommended'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : row.automatedReview.verdict === 'Borderline'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {row.automatedReview.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 whitespace-nowrap">
                      <div className="font-medium">{row.interviewerName}</div>
                      <div className="text-[10px] text-gray-400">{row.interviewerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-700 text-xs">
                      <p className="line-clamp-2">{row.interviewerRemarks || row.automatedReview.summary}</p>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap space-x-1">
                      <button
                        onClick={() => onViewReview(row)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                        title="View Full Automated Review"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteRecord(row.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* LEADERBOARD VIEW */
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead className="bg-gray-100 text-gray-700 sticky top-0 border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3 font-bold w-14 text-center">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Student Name</th>
                <th className="py-2.5 px-3 font-semibold">Roll No</th>
                <th className="py-2.5 px-3 font-semibold">Role & Degree</th>
                <th className="py-2.5 px-3 font-semibold text-center">GD Score (50M)</th>
                <th className="py-2.5 px-3 font-semibold text-center">PI Score (50M)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Drive Total (100M)</th>
                <th className="py-2.5 px-3 font-semibold text-center">AMCAT (900M)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Composite Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaderboardData.map((item, index) => (
                <tr
                  key={item.candidate.id}
                  className={`hover:bg-amber-50/30 transition-colors ${
                    index < 3 ? 'bg-amber-50/20 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center">
                    {index === 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-400 text-amber-900 rounded-full font-bold text-xs shadow-xs">
                        1
                      </span>
                    ) : index === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-300 text-slate-800 rounded-full font-bold text-xs">
                        2
                      </span>
                    ) : index === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-600/30 text-amber-900 rounded-full font-bold text-xs">
                        3
                      </span>
                    ) : (
                      <span className="text-gray-500 font-mono">#{index + 1}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-gray-900">{item.candidate.name}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-600">{item.candidate.rollNo}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-gray-800 font-medium">{item.candidate.targetRole}</span>
                    <span className="text-gray-400 text-[10px] ml-1">({item.candidate.degree})</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.hasCompletedGD ? (
                      <span className="font-bold text-purple-700">{item.gdScore}/50</span>
                    ) : (
                      <span className="text-gray-400 italic">Pending</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.hasCompletedPI ? (
                      <span className="font-bold text-blue-700">{item.piScore}/50</span>
                    ) : (
                      <span className="text-gray-400 italic">Pending</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-sm text-emerald-700">
                    {item.driveTotal} <span className="text-[10px] text-gray-400 font-normal">/100</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {onEditAmcat ? (
                      <button
                        onClick={() => onEditAmcat(item.candidate)}
                        className="font-mono font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors border border-amber-200 text-xs"
                        title="Click to view & edit category-wise AMCAT marks"
                      >
                        {item.candidate.amcatScore} pts ✎
                      </button>
                    ) : (
                      <span className="font-mono font-medium text-gray-700">{item.candidate.amcatScore}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-indigo-700 bg-indigo-50/50">
                    {item.compositeScore} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
