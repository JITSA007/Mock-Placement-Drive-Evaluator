import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  CheckCircle,
  Clock,
  Lock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Candidate, EvaluationRecord } from '../types';

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

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || c.targetRole === filterRole;
    return matchesSearch && matchesRole;
  });

  const shortlistedCount = candidates.filter((c) => c.status === 'PI Shortlisted').length;
  const selectedCount = candidates.filter((c) => c.status === 'Selected').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Banner */}
      <header className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Campus Placement Drive • Student Live Notice Board
                </h1>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] rounded-full font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Updates ({connectedUsers} Panels Online)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Real-Time Shortlist & Interview Schedule • Read-Only Student Portal
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

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6">
        {/* Security / Student Protection Advisory */}
        <div className="p-4 bg-blue-950/50 border border-blue-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-xl text-blue-400 shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <span className="font-bold text-white">Student Read-Only Mode:</span> Candidate evaluations, marks, and interviewer scorecards are strictly secured behind evaluator passwords.
              <div className="text-[11px] text-blue-300 mt-0.5">
                Check your Roll Number below to see if you have qualified Step 1 (GD) and your scheduled interview slot.
              </div>
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
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
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

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter Role:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Tech Sales">Tech Sales</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        {/* Candidates Table (Read-Only) */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 px-6 border-b border-slate-700 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Placement Drive Candidates ({filteredCandidates.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Auto-updating via live server sync
            </span>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-700/60 flex items-center justify-center text-slate-400">
                <Search size={22} />
              </div>
              <p className="text-sm font-bold text-white">No candidate matching criteria</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Check that you have typed your complete college roll number correctly.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                    <th className="py-3 px-4 sm:px-6">Roll Number</th>
                    <th className="py-3 px-4 sm:px-6">Candidate Name</th>
                    <th className="py-3 px-4 sm:px-6">Target Role & Degree</th>
                    <th className="py-3 px-4 sm:px-6">Stage 1: GD Status</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Interview Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredCandidates.map((cand) => {
                    return (
                      <tr key={cand.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-blue-400">
                          {cand.rollNo}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-white">
                          {cand.name}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-slate-300">
                          <div>{cand.targetRole}</div>
                          <div className="text-[10px] text-slate-500">{cand.degree}</div>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6">
                          {cand.status === 'Selected' ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle size={12} />
                              <span>Selected / Hired</span>
                            </span>
                          ) : cand.status === 'PI Shortlisted' ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
                              <Sparkles size={12} />
                              <span>Qualified GD ➔ Shortlisted for PI</span>
                            </span>
                          ) : cand.status === 'Eliminated' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-700 text-slate-400">
                              GD Round Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              <Clock size={11} />
                              <span>GD Evaluation In Progress</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          {cand.status === 'PI Shortlisted' ? (
                            <span className="text-[11px] font-semibold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/80 inline-block">
                              Report to Personal Interview Room
                            </span>
                          ) : cand.status === 'Selected' ? (
                            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/80 inline-block">
                              Contact Placement Cell for Offer Letter
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              Stay seated in holding area
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student Instructions Footer */}
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl text-xs space-y-2 text-slate-400">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Important Placement Drive Instructions:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
            <li>Students qualified for Step 2 (Personal Interview) must report to their assigned panel room with updated resume copies.</li>
            <li>Maintain formal dress code and keep your college ID cards visibly worn.</li>
            <li>Evaluation marks and detailed evaluator comments are confidential and accessible only to authorized college faculty.</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center text-[11px] text-slate-500">
        Placement Evaluation Board System • Protected Multi-User Architecture
      </footer>
    </div>
  );
};
