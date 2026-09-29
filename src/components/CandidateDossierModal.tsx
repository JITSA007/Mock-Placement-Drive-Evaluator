import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Candidate, EvaluationRecord } from '../types';
import { ROLES_CONFIG } from '../data/sampleData';

interface CandidateDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  evaluations: EvaluationRecord[];
}

export const CandidateDossierModal: React.FC<CandidateDossierModalProps> = ({
  isOpen,
  onClose,
  candidate,
  evaluations,
}) => {
  if (!isOpen || !candidate) return null;

  const gdEval = evaluations.find(
    (e) => (e.candidateId === candidate.id || e.rollNo === candidate.rollNo) && e.evaluationType === 'GD'
  );
  const piEval = evaluations.find(
    (e) => (e.candidateId === candidate.id || e.rollNo === candidate.rollNo) && e.evaluationType === 'PI'
  );

  const gdScore = gdEval ? gdEval.totalScore : 0;
  const piScore = piEval ? piEval.totalScore : 0;
  const driveTotal = gdScore + piScore;
  const compositeScore = Math.round(driveTotal * 0.7 + (candidate.amcatScore / 1000) * 30 * 10) / 10;

  const roleMeta = ROLES_CONFIG[candidate.targetRole] || ROLES_CONFIG['Full Stack Developer'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:m-0 print:max-w-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Modal Bar */}
        <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-2">
            <FileText size={18} className="text-blue-400" />
            <span className="font-bold text-sm">Official Candidate Evaluation Dossier</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Printer size={13} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Assessment Sheet Content */}
        <div className="flex-1 overflow-auto p-6 sm:p-8 space-y-6 text-slate-800 text-xs">
          {/* Institutional Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <h1 className="text-lg font-black tracking-tight uppercase text-slate-900">
              Campus Placement Drive • Candidate Evaluation Dossier
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Academic Assessment & Placement Evaluation Board • Ahmedabad | Jaipur | Noida
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Candidate Name</span>
              <span className="text-sm font-black text-slate-900">{candidate.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Roll Number</span>
              <span className="font-mono text-sm font-bold text-blue-700">{candidate.rollNo}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Job Role</span>
              <span className="font-bold text-slate-900">{candidate.targetRole}</span>
              <div className="text-[10px] text-slate-500">{roleMeta.company}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Degree / Stream</span>
              <span className="font-bold text-slate-900">{candidate.degree}</span>
            </div>
          </div>

          {/* Composite Score & Verdict Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-[11px] font-bold text-blue-900 block">Overall Placement Benchmark</span>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-2xl font-black text-blue-950 font-mono">
                  {driveTotal} <span className="text-xs font-normal text-slate-500">/ 100 Drive Marks</span>
                </span>
                <span className="text-xs bg-white/80 px-2 py-0.5 rounded-lg border border-blue-200 text-blue-800 font-semibold font-mono">
                  AMCAT: {candidate.amcatScore} pts
                </span>
                <span className="text-xs bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 text-indigo-900 font-bold font-mono">
                  Composite Index: {compositeScore}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Final Status</span>
              <span
                className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase mt-0.5 ${
                  candidate.status === 'Selected'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : candidate.status === 'PI Shortlisted'
                    ? 'bg-purple-600 text-white'
                    : candidate.status === 'Eliminated'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {candidate.status}
              </span>
            </div>
          </div>

          {/* Section 1: GD Round Assessment */}
          <div className="space-y-2 border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-purple-950">
                Stage 1: Group Discussion (GD) Appraisal
              </h3>
              <span className="font-mono font-bold text-xs text-purple-700">
                {gdEval ? `${gdScore} / 50 Marks` : 'Pending'}
              </span>
            </div>

            {gdEval ? (
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {Object.entries(gdEval.scores).map(([crit, val]) => (
                    <div key={crit} className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[9px] text-slate-500 truncate" title={crit}>{crit}</div>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">{val}/10</div>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 text-[11px]">
                  <strong>Evaluator Remarks ({gdEval.interviewerName}):</strong>
                  <p className="text-slate-700 mt-0.5 italic">"{gdEval.interviewerRemarks}"</p>
                </div>

                {gdEval.aiFeedback && (
                  <div className="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-600">
                    <strong>AI Qualitative Analysis:</strong> {gdEval.aiFeedback}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic text-xs py-2">Group discussion has not been recorded yet.</p>
            )}
          </div>

          {/* Section 2: PI Round Assessment */}
          <div className="space-y-2 border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-950">
                Stage 2: Personal Interview (PI) Appraisal
              </h3>
              <span className="font-mono font-bold text-xs text-blue-700">
                {piEval ? `${piScore} / 50 Marks` : 'Pending'}
              </span>
            </div>

            {piEval ? (
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {Object.entries(piEval.scores).map(([crit, val]) => (
                    <div key={crit} className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[9px] text-slate-500 truncate" title={crit}>{crit}</div>
                      <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">{val}/10</div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-[11px]">
                  <strong>Evaluator Remarks ({piEval.interviewerName}):</strong>
                  <p className="text-slate-700 mt-0.5 italic">"{piEval.interviewerRemarks}"</p>
                </div>

                {piEval.aiFeedback && (
                  <div className="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-600">
                    <strong>AI Technical Feedback:</strong> {piEval.aiFeedback}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic text-xs py-2">Personal interview has not been conducted yet.</p>
            )}
          </div>

          {/* Signatures & Certification Area */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px] text-slate-500">
            <div>
              <div className="h-10 border-b border-slate-300 mb-1"></div>
              <span>Lead Evaluator Signature / Date</span>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-300 mb-1"></div>
              <span>Training & Placement Officer (TPO) Stamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
