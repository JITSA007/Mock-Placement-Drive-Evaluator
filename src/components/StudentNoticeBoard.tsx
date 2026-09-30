import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  CheckCircle,
  Clock,
  Lock,
  Sparkles,
  FileText,
  TrendingUp,
  Award,
  BookOpen,
} from 'lucide-react';
import { Candidate, EvaluationRecord } from '../types';
import { StudentReportModal } from './StudentReportModal';

interface StudentNoticeBoardProps {
  candidates: Candidate[];
  evaluations: EvaluationRecord[];
  onGoToLogin: () => void;
  connectedUsers: number;
}

export const StudentNoticeBoard: React.FC<StudentNoticeBoardProps> = ({
  candidates,
  evaluations,
  onGoToLogin,
  connectedUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeViewMode, setActiveViewMode] = useState<'cards' | 'table'>('cards');

  // Selected candidate for viewing/printing PDF Report
  const [reportModalCandidate, setReportModalCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || c.targetRole === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'selected' && c.status === 'Selected') ||
      (filterStatus === 'shortlisted' && c.status === 'PI Shortlisted') ||
      (filterStatus === 'evaluated' && evaluations.some((e) => e.candidateId === c.id || e.rollNo.toLowerCase() === c.rollNo.toLowerCase()));

    return matchesSearch && matchesRole && matchesStatus;
  });

  const shortlistedCount = candidates.filter((c) => c.status === 'PI Shortlisted').length;
  const selectedCount = candidates.filter((c) => c.status === 'Selected').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* 1. Top Banner */}
      <header className="bg-slate-950/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Campus Placement Drive • Student Live Performance Portal
                </h1>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] rounded-full font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Sync ({connectedUsers} Panels Online)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Real-Time GD & PI Evaluation Scorecards, Evaluator Feedback & Printable PDF Reports
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Lock size={13} />
              <span>Interviewer & Faculty Login →</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6">
        {/* Notice & Feature Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-purple-950/70 border border-blue-800/60 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-300 rounded-2xl shrink-0 mt-0.5 border border-blue-500/30">
              <Award size={22} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>Student Performance Feedback & PDF Reports</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-mono">
                  Official Release
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                Search your college roll number below to view your <strong>Round 1 (GD) Comments</strong>, <strong>Round 2 (PI) Comments</strong>, detailed rubric scores out of 50/100, and customized <strong>"What Should I Work On"</strong> development recommendations. You can also print your official PDF placement report.
              </p>
            </div>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 sm:p-5 rounded-2xl flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-base sm:text-lg">
              {candidates.length}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">Total Pool</div>
              <div className="text-sm sm:text-base font-black text-white">Registered</div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-purple-500/30 p-4 sm:p-5 rounded-2xl flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-base sm:text-lg">
              {shortlistedCount}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-purple-300 font-semibold uppercase">Qualified GD</div>
              <div className="text-sm sm:text-base font-black text-white">Shortlisted</div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-blue-500/30 p-4 sm:p-5 rounded-2xl flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-base sm:text-lg">
              {evaluations.length}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-blue-300 font-semibold uppercase">Evaluations</div>
              <div className="text-sm sm:text-base font-black text-white">Recorded</div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-base sm:text-lg">
              {selectedCount}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-emerald-300 font-semibold uppercase">Offers</div>
              <div className="text-sm sm:text-base font-black text-white">Selected</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-3xl flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 shadow-lg">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your Roll Number (e.g. 21BTECH042) or Full Name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Candidates</option>
              <option value="evaluated">Evaluated Only (GD/PI)</option>
              <option value="shortlisted">GD Qualified / Shortlisted</option>
              <option value="selected">Selected / Hired</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Target Roles</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Tech Sales">Tech Sales</option>
              <option value="General">General</option>
            </select>

            {/* View Switch */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeViewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cards View
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeViewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {/* 3. CANDIDATES PERFORMANCE ROSTER */}
        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-800/80 border border-slate-700 rounded-3xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-700/60 flex items-center justify-center text-slate-400">
              <Search size={22} />
            </div>
            <p className="text-sm font-bold text-white">No candidate matching criteria</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Check that you have typed your complete college roll number correctly.
            </p>
          </div>
        ) : activeViewMode === 'cards' ? (
          /* A. DETAILED CANDIDATE PERFORMANCE CARDS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map((cand) => {
              const gdEval = evaluations.find(
                (e) =>
                  (e.candidateId === cand.id || e.rollNo.toLowerCase() === cand.rollNo.toLowerCase()) &&
                  e.evaluationType === 'GD'
              );
              const piEval = evaluations.find(
                (e) =>
                  (e.candidateId === cand.id || e.rollNo.toLowerCase() === cand.rollNo.toLowerCase()) &&
                  e.evaluationType === 'PI'
              );

              const totalScore = (gdEval ? gdEval.totalScore : 0) + (piEval ? piEval.totalScore : 0);
              const maxScore = (gdEval ? 50 : 0) + (piEval ? 50 : 0) || 100;

              // Consolidated Growth areas
              const growthAreas = [
                ...(gdEval?.automatedReview?.growthAreas || []),
                ...(piEval?.automatedReview?.growthAreas || []),
              ];

              return (
                <div
                  key={cand.id}
                  className="bg-slate-800/90 border border-slate-700/90 rounded-3xl p-5 sm:p-6 shadow-md hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Student Header */}
                  <div className="flex justify-between items-start pb-3 border-b border-slate-700/80">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-white">{cand.name}</h3>
                        <div className="text-xs font-mono text-blue-400">{cand.rollNo}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {cand.degree} • <span className="text-slate-300 font-semibold">{cand.targetRole}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {cand.status === 'Selected' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle size={12} />
                          <span>Selected</span>
                        </span>
                      ) : cand.status === 'PI Shortlisted' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
                          <Sparkles size={12} />
                          <span>GD Qualified</span>
                        </span>
                      ) : cand.status === 'Eliminated' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-700 text-slate-300">
                          GD Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <Clock size={11} />
                          <span>Pending</span>
                        </span>
                      )}

                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Total: <span className="font-bold text-white">{totalScore}/{maxScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* ROUND COMMENTS & EVALUATIONS */}
                  <div className="space-y-3 text-xs">
                    {/* Round 1 (GD) Comments */}
                    <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-purple-200">
                        <span className="font-bold flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">1</span>
                          <span>Round 1: Group Discussion (GD)</span>
                        </span>
                        <span className="font-bold font-mono text-purple-300">
                          {gdEval ? `${gdEval.totalScore}/50` : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 italic leading-relaxed pt-0.5">
                        {gdEval
                          ? `"${gdEval.customFeedback || gdEval.interviewerRemarks || gdEval.aiFeedback || 'Active participation and good peer dynamic.'}"`
                          : 'Awaiting Group Discussion evaluation...'}
                      </p>
                      {gdEval && (
                        <div className="text-[10px] text-purple-400 font-mono">
                          Evaluator: {gdEval.interviewerName}
                        </div>
                      )}
                    </div>

                    {/* Round 2 (PI) Comments */}
                    <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-blue-200">
                        <span className="font-bold flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">2</span>
                          <span>Round 2: Personal Interview (PI)</span>
                        </span>
                        <span className="font-bold font-mono text-blue-300">
                          {piEval ? `${piEval.totalScore}/50` : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-200/90 italic leading-relaxed pt-0.5">
                        {piEval
                          ? `"${piEval.customFeedback || piEval.interviewerRemarks || piEval.aiFeedback || 'Strong problem solving and structured communication.'}"`
                          : 'Awaiting Personal Interview evaluation...'}
                      </p>
                      {piEval && (
                        <div className="text-[10px] text-blue-400 font-mono">
                          Evaluator: {piEval.interviewerName}
                        </div>
                      )}
                    </div>

                    {/* What to work on (Development Roadmap Preview) */}
                    {growthAreas.length > 0 && (
                      <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-2xl space-y-1">
                        <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-[11px]">
                          <TrendingUp size={13} />
                          <span>What to Work On:</span>
                        </div>
                        <ul className="text-[11px] text-amber-200/90 space-y-0.5 pl-1">
                          {Array.from(new Set(growthAreas)).slice(0, 2).map((area, i) => (
                            <li key={i} className="flex items-start space-x-1">
                              <span className="text-amber-500 font-bold">•</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions: View Report & PDF */}
                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      AMCAT: <span className="text-amber-400 font-bold">{cand.amcatScore || 'N/A'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setReportModalCandidate(cand)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all transform active:scale-95"
                    >
                      <FileText size={14} />
                      <span>View Report & PDF →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* B. TABLE VIEW WITH ALL COMMENTS & SCORES */
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-3">Role</th>
                    <th className="py-3.5 px-3 text-center">Round 1 (GD)</th>
                    <th className="py-3.5 px-4 min-w-[200px]">GD Comments</th>
                    <th className="py-3.5 px-3 text-center">Round 2 (PI)</th>
                    <th className="py-3.5 px-4 min-w-[200px]">PI Comments</th>
                    <th className="py-3.5 px-3 text-center">Total /100</th>
                    <th className="py-3.5 px-4 text-right">PDF Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredCandidates.map((cand) => {
                    const gdEval = evaluations.find(
                      (e) =>
                        (e.candidateId === cand.id || e.rollNo.toLowerCase() === cand.rollNo.toLowerCase()) &&
                        e.evaluationType === 'GD'
                    );
                    const piEval = evaluations.find(
                      (e) =>
                        (e.candidateId === cand.id || e.rollNo.toLowerCase() === cand.rollNo.toLowerCase()) &&
                        e.evaluationType === 'PI'
                    );

                    const totalScore = (gdEval ? gdEval.totalScore : 0) + (piEval ? piEval.totalScore : 0);

                    return (
                      <tr key={cand.id} className="hover:bg-slate-700/30 transition-colors">
                        {/* Student */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{cand.name}</div>
                          <div className="text-[11px] font-mono text-blue-400">{cand.rollNo}</div>
                          <div className="text-[10px] text-slate-400">{cand.degree}</div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-3">
                          <div className="text-slate-300 font-medium">{cand.targetRole}</div>
                        </td>

                        {/* GD Score */}
                        <td className="py-3.5 px-3 text-center">
                          {gdEval ? (
                            <span className="font-mono font-bold text-purple-300 text-sm">
                              {gdEval.totalScore}/50
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono">—</span>
                          )}
                        </td>

                        {/* GD Comments */}
                        <td className="py-3.5 px-4">
                          <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                            {gdEval
                              ? `"${gdEval.customFeedback || gdEval.interviewerRemarks || gdEval.aiFeedback || 'Evaluated'}"`
                              : 'Pending'}
                          </p>
                        </td>

                        {/* PI Score */}
                        <td className="py-3.5 px-3 text-center">
                          {piEval ? (
                            <span className="font-mono font-bold text-blue-300 text-sm">
                              {piEval.totalScore}/50
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono">—</span>
                          )}
                        </td>

                        {/* PI Comments */}
                        <td className="py-3.5 px-4">
                          <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                            {piEval
                              ? `"${piEval.customFeedback || piEval.interviewerRemarks || piEval.aiFeedback || 'Evaluated'}"`
                              : 'Pending'}
                          </p>
                        </td>

                        {/* Total Score */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-mono font-black text-emerald-400 text-base">
                            {totalScore}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setReportModalCandidate(cand)}
                            className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1"
                          >
                            <FileText size={13} />
                            <span>Report & PDF</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Guidelines / Tips */}
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-3xl text-xs space-y-2 text-slate-400">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-2">
            <BookOpen size={14} className="text-blue-400" />
            <span>Placement Preparation & Feedback Guidelines</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
            <li>Click <strong>"View Report & PDF"</strong> on your profile card to generate and print your official Placement Assessment Report.</li>
            <li>Carefully review the <strong>"What to Work On"</strong> section for prioritized growth items before appearing in company drives.</li>
            <li>Candidates qualified for Round 2 (Personal Interview) must report to their assigned panel room with 2 copies of their resume.</li>
          </ul>
        </div>
      </main>

      {/* 4. Detailed Student Report & PDF Modal */}
      {reportModalCandidate && (
        <StudentReportModal
          candidate={reportModalCandidate}
          evaluations={evaluations}
          onClose={() => setReportModalCandidate(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center text-[11px] text-slate-500">
        Placement Evaluation Board System • Protected Multi-User Architecture
      </footer>
    </div>
  );
};
