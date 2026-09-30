import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  TrendingUp,
  FileText,
  Calendar,
} from 'lucide-react';
import { Candidate, EvaluationRecord } from '../types';
import { GD_CRITERIA, PI_CRITERIA } from '../data/sampleData';

interface StudentReportModalProps {
  candidate: Candidate;
  evaluations: EvaluationRecord[];
  onClose: () => void;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  candidate,
  evaluations,
  onClose,
}) => {
  // Find GD Evaluation
  const gdEval = evaluations.find(
    (e) =>
      (e.candidateId === candidate.id || e.rollNo.toLowerCase() === candidate.rollNo.toLowerCase()) &&
      e.evaluationType === 'GD'
  );

  // Find PI Evaluation
  const piEval = evaluations.find(
    (e) =>
      (e.candidateId === candidate.id || e.rollNo.toLowerCase() === candidate.rollNo.toLowerCase()) &&
      e.evaluationType === 'PI'
  );

  const gdScore = gdEval ? gdEval.totalScore : 0;
  const piScore = piEval ? piEval.totalScore : 0;
  const totalPlacementScore = gdScore + piScore;
  const maxPossibleScore = (gdEval ? 50 : 0) + (piEval ? 50 : 0) || 100;
  const compositePercentage = Math.round((totalPlacementScore / maxPossibleScore) * 100);

  // Collect consolidated strengths
  const allStrengths = [
    ...(gdEval?.automatedReview?.strengths || []),
    ...(piEval?.automatedReview?.strengths || []),
  ];

  // Collect consolidated growth areas / "What they should work on"
  const allGrowthAreas = [
    ...(gdEval?.automatedReview?.growthAreas || []),
    ...(piEval?.automatedReview?.growthAreas || []),
  ];

  // If no automated growth areas exist yet, generate contextual recommendations
  const fallbackGrowthAreas: string[] = [];
  if (gdEval) {
    if (gdEval.scores['Content Knowledge'] < 7) {
      fallbackGrowthAreas.push('Read current tech trends, business news, and case studies to cite richer facts in GD.');
    }
    if (gdEval.scores['Leadership / Initiative'] < 7) {
      fallbackGrowthAreas.push('Practice taking initiative early in discussions and summarizing points when discussions diverge.');
    }
    if (gdEval.scores['Communication Skills'] < 7) {
      fallbackGrowthAreas.push('Focus on speaking with steady voice modulation and concise, jargon-free explanations.');
    }
    if (gdEval.scores['Body Language'] < 7) {
      fallbackGrowthAreas.push('Maintain open posture, composed eye contact with all participants, and avoid fidgeting.');
    }
  }
  if (piEval) {
    if (piEval.scores['Technical Knowledge'] < 7) {
      fallbackGrowthAreas.push('Deepen fundamental concepts in Core CS/Engineering subjects and role-specific tech stack.');
    }
    if (piEval.scores['Problem Solving'] < 7) {
      fallbackGrowthAreas.push('Practice thinking aloud while solving algorithmic problems and breaking down edge cases.');
    }
    if (piEval.scores['Projects & Resume Depth'] < 7) {
      fallbackGrowthAreas.push('Be ready to defend architectural decisions, scalability trade-offs, and metrics for every project on your resume.');
    }
    if (piEval.scores['Behavioral & Culture Fit'] < 7) {
      fallbackGrowthAreas.push('Structure behavioral answers using the STAR method (Situation, Task, Action, Result).');
    }
  }

  const finalGrowthAreas =
    allGrowthAreas.length > 0 ? Array.from(new Set(allGrowthAreas)) : fallbackGrowthAreas;

  // Print function
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-h-none print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Modal Top Header (Hidden in Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Student Placement Assessment & Growth Report</h2>
              <p className="text-xs text-slate-400">
                Official Report Card for {candidate.name} ({candidate.rollNo})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT BODY */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-800 print:overflow-visible print:p-8 print:text-black">
          {/* 1. Official Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 font-black text-[10px] tracking-wider uppercase rounded-md border border-blue-200">
                  Campus Placement Drive 2026
                </span>
                <span className="text-xs font-bold text-slate-500">Official Candidate Scorecard</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                Placement Evaluation & Career Growth Report
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Comprehensive performance metrics, round-wise evaluator comments, and tailored development recommendations.
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 bg-slate-50 print:bg-transparent p-3 rounded-2xl border border-slate-200 print:border-none">
              <div className="font-bold text-slate-900 flex items-center sm:justify-end space-x-1">
                <Calendar size={13} className="text-blue-600" />
                <span>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Mock Placement Assessment Cell</div>
              <div className="text-[10px] font-mono text-emerald-700 font-bold mt-0.5">Verified Document ID: MPC-{candidate.rollNo.replace(/[^a-zA-Z0-9]/g, '')}</div>
            </div>
          </div>

          {/* 2. Candidate Information Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Candidate Name</span>
              <span className="font-black text-sm text-slate-900">{candidate.name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Roll Number</span>
              <span className="font-bold font-mono text-sm text-blue-700">{candidate.rollNo}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Target Role & Degree</span>
              <span className="font-bold text-slate-900">
                {candidate.targetRole} <span className="text-slate-500 font-normal">({candidate.degree})</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Overall Status</span>
              <span
                className={`inline-block font-black px-2.5 py-0.5 rounded-md text-xs mt-0.5 ${
                  candidate.status === 'Selected'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : candidate.status === 'PI Shortlisted'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {candidate.status === 'Selected'
                  ? 'Selected / Recommended'
                  : candidate.status === 'PI Shortlisted'
                  ? 'GD Qualified (PI Shortlist)'
                  : candidate.status === 'Eliminated'
                  ? 'GD Completed'
                  : 'Assessment In Progress'}
              </span>
            </div>
          </div>

          {/* 3. Composite Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Round 1: GD Score</span>
              <div className="text-2xl font-black text-purple-950 mt-1">
                {gdEval ? `${gdScore}/50` : 'Pending'}
              </div>
              <span className="text-[10px] text-purple-700 font-medium">
                {gdEval ? (gdScore >= 25 ? '✓ Qualified' : 'Below Cutoff') : 'Awaiting'}
              </span>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Round 2: PI Score</span>
              <div className="text-2xl font-black text-blue-950 mt-1">
                {piEval ? `${piScore}/50` : 'Pending'}
              </div>
              <span className="text-[10px] text-blue-700 font-medium">
                {piEval ? (piScore >= 35 ? '✓ High Recommendation' : 'Interview Completed') : 'Awaiting'}
              </span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Combined Score</span>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {totalPlacementScore}/{maxPossibleScore}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">
                {compositePercentage}% Overall Performance
              </span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">AMCAT Aptitude</span>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {candidate.amcatScore || 'N/A'} pts
              </div>
              <span className="text-[10px] text-amber-700 font-medium">
                Campus Baseline Test
              </span>
            </div>
          </div>

          {/* 4. ROUND 1: GROUP DISCUSSION (GD) DETAILS & COMMENTS */}
          <div className="border border-purple-200 rounded-2xl p-5 bg-purple-50/30 space-y-4">
            <div className="flex justify-between items-center border-b border-purple-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-purple-950">Round 1: Group Discussion (GD) Assessment</h3>
              </div>
              {gdEval && (
                <span className="text-xs font-bold text-purple-900">
                  Evaluator: {gdEval.interviewerName} ({gdEval.interviewerPhone || 'Panel 1'})
                </span>
              )}
            </div>

            {gdEval ? (
              <div className="space-y-3">
                {/* Rubric Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  {GD_CRITERIA.map((crit) => (
                    <div key={crit} className="bg-white p-2.5 rounded-xl border border-purple-200">
                      <span className="text-[10px] text-slate-500 block truncate font-medium">{crit}</span>
                      <span className="text-base font-black text-purple-900 mt-0.5 block">
                        {gdEval.scores[crit] !== undefined ? `${gdEval.scores[crit]}/10` : '—'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* GD Evaluator Comments & Remarks */}
                <div className="bg-white p-4 rounded-xl border border-purple-200 space-y-1.5">
                  <span className="text-xs font-bold text-purple-950 block">
                    💬 GD Evaluator Observations & Detailed Comments:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{gdEval.customFeedback || gdEval.interviewerRemarks || gdEval.aiFeedback || 'Candidate actively participated in the group discussion, demonstrating solid team dynamics.'}"
                  </p>
                  {gdEval.aiFeedback && (
                    <div className="text-[11px] text-purple-900 bg-purple-50 p-2.5 rounded-lg border border-purple-100 font-medium">
                      <strong>AI Competency Summary:</strong> {gdEval.aiFeedback}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500 italic">
                Group Discussion evaluation has not yet been recorded for this student.
              </div>
            )}
          </div>

          {/* 5. ROUND 2: PERSONAL INTERVIEW (PI) DETAILS & COMMENTS */}
          <div className="border border-blue-200 rounded-2xl p-5 bg-blue-50/30 space-y-4">
            <div className="flex justify-between items-center border-b border-blue-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-blue-950">Round 2: Personal Interview (PI) Assessment</h3>
              </div>
              {piEval && (
                <span className="text-xs font-bold text-blue-900">
                  Evaluator: {piEval.interviewerName} ({piEval.interviewerPhone || 'Panel 2'})
                </span>
              )}
            </div>

            {piEval ? (
              <div className="space-y-3">
                {/* Rubric Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  {PI_CRITERIA.map((crit) => (
                    <div key={crit} className="bg-white p-2.5 rounded-xl border border-blue-200">
                      <span className="text-[10px] text-slate-500 block truncate font-medium">{crit}</span>
                      <span className="text-base font-black text-blue-900 mt-0.5 block">
                        {piEval.scores[crit] !== undefined ? `${piEval.scores[crit]}/10` : '—'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* PI Evaluator Comments & Remarks */}
                <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-1.5">
                  <span className="text-xs font-bold text-blue-950 block">
                    💬 PI Evaluator Observations & Detailed Comments:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{piEval.customFeedback || piEval.interviewerRemarks || piEval.aiFeedback || 'Candidate demonstrated competent domain problem solving and articulate verbal explanations.'}"
                  </p>
                  {piEval.aiFeedback && (
                    <div className="text-[11px] text-blue-900 bg-blue-50 p-2.5 rounded-lg border border-blue-100 font-medium">
                      <strong>AI Technical Summary:</strong> {piEval.aiFeedback}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500 italic">
                Personal Interview evaluation has not yet been recorded for this student.
              </div>
            )}
          </div>

          {/* 6. WHAT SHOULD YOU WORK ON? (TARGETED DEVELOPMENT ROADMAP) */}
          <div className="border-2 border-amber-300 rounded-2xl p-5 bg-amber-50/50 space-y-3">
            <div className="flex items-center space-x-2 text-amber-950">
              <TrendingUp size={18} className="text-amber-700" />
              <h3 className="font-bold text-sm">
                Targeted Development Roadmap: What You Should Work On
              </h3>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Based on the evaluator assessments and rubric scoring, here are the highest-impact focus areas to practice before real campus recruitment drives:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {finalGrowthAreas.length > 0 ? (
                finalGrowthAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-amber-200 flex items-start space-x-2 text-xs text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{area}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-700 col-span-2">
                  Maintain current strong performance levels. Continue practicing live coding mock tests and behavioral storytelling.
                </div>
              )}
            </div>
          </div>

          {/* 7. Key Strengths Demonstrated */}
          {allStrengths.length > 0 && (
            <div className="border border-emerald-200 rounded-2xl p-5 bg-emerald-50/40 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-950">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Key Strengths Demonstrated</h4>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-950">
                {Array.from(new Set(allStrengths)).map((st, i) => (
                  <li key={i} className="flex items-start space-x-1.5 bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 8. Institutional Verification & Sign-off Area */}
          <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-600">
            <div>
              <div className="font-bold text-slate-900">Placement Assessment Committee</div>
              <div>Training & Placement Cell (T&P)</div>
              <div className="text-[10px] text-slate-400 mt-1">Confidential Institutional Performance Record</div>
            </div>

            <div className="text-left sm:text-right">
              <div className="w-44 border-b border-slate-400 pb-1 font-mono text-[10px] text-slate-400">
                Authorized Faculty Signature
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Official Mock Drive Evaluation Stamp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
