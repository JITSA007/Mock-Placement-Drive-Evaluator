import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  X,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { EvaluationRecord } from '../types';

interface AutomatedReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EvaluationRecord | null;
  onApplyToRemarks?: (text: string) => void;
}

export const AutomatedReviewModal: React.FC<AutomatedReviewModalProps> = ({
  isOpen,
  onClose,
  record,
  onApplyToRemarks,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !record) return null;

  const { automatedReview, studentName, rollNo, targetRole, degree, evaluationType, totalScore, scores } =
    record;

  const handleCopyReview = () => {
    const text = `=== Mock Placement Drive Evaluation ===\nCandidate: ${studentName} (${rollNo}, ${degree})\nRole: ${targetRole}\nRound: ${evaluationType === 'GD' ? 'Group Discussion' : 'Personal Interview'}\nTotal Score: ${totalScore}/50 (${((totalScore/50)*100).toFixed(0)}%)\nVerdict: ${automatedReview.verdict}\n\nSummary:\n${automatedReview.summary}\n\nKey Strengths:\n${automatedReview.strengths.map(s => `• ${s}`).join('\n')}\n\nGrowth Areas:\n${automatedReview.growthAreas.map(g => `• ${g}`).join('\n')}\n\nRole Fit Notes:\n${automatedReview.roleFitNote}\n\nFeedback:\n${automatedReview.feedbackText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-6 text-white flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <Sparkles size={24} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">{studentName}</h2>
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-mono">{rollNo}</span>
              </div>
              <p className="text-xs text-blue-100 mt-1">
                {targetRole} • {degree} • {evaluationType === 'GD' ? 'Group Discussion (50M)' : 'Personal Interview (50M)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Score & Verdict Banner */}
        <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="text-center px-4 py-1.5 bg-white border border-gray-200 rounded-xl shadow-xs">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">Total Score</div>
              <div className="text-xl font-bold text-gray-900">
                {totalScore} <span className="text-xs text-gray-400 font-normal">/ 50</span>
              </div>
            </div>
            <div className="text-center px-4 py-1.5 bg-white border border-gray-200 rounded-xl shadow-xs">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">Percentage</div>
              <div className="text-xl font-bold text-blue-600">
                {((totalScore / 50) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div>
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs ${
                automatedReview.verdict === 'Strong Shortlist'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : automatedReview.verdict === 'Recommended'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : automatedReview.verdict === 'Borderline'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              <Award size={14} />
              <span>Verdict: {automatedReview.verdict}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700 flex-1">
          {/* Executive Summary */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-1 flex items-center space-x-1">
              <TrendingUp size={14} className="text-blue-700" />
              <span>Executive Performance Assessment</span>
            </h4>
            <p className="text-blue-950 text-xs leading-relaxed">{automatedReview.summary}</p>
          </div>

          {/* Matrix Scores Breakdown */}
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Evaluation Matrix Breakdown (PDF Rubric):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(scores).map(([crit, val]) => (
                <div key={crit} className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <div className="text-[10px] text-gray-500 truncate" title={crit}>
                    {crit}
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">{val}/10</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <h5 className="font-bold text-emerald-900 flex items-center space-x-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Identified Strengths</span>
              </h5>
              <ul className="space-y-1.5 text-emerald-800 text-[11px]">
                {automatedReview.strengths.map((str, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
              <h5 className="font-bold text-amber-900 flex items-center space-x-1.5">
                <AlertTriangle size={15} className="text-amber-600" />
                <span>Actionable Growth Areas</span>
              </h5>
              <ul className="space-y-1.5 text-amber-800 text-[11px]">
                {automatedReview.growthAreas.map((gro, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{gro}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Role Fit Note */}
          <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
            <h5 className="font-bold text-purple-900 mb-1">Company & Job Role Alignment:</h5>
            <p className="text-purple-950 text-[11px] leading-relaxed">{automatedReview.roleFitNote}</p>
          </div>

          {/* Dual Feedback Section: Custom & AI */}
          <div className="space-y-3">
            {record.customFeedback && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                <h5 className="font-bold text-blue-950 flex items-center space-x-1.5">
                  <UserCheck size={14} className="text-blue-700" />
                  <span>Interviewer Custom Feedback:</span>
                </h5>
                <p className="text-blue-900 text-xs leading-relaxed">{record.customFeedback}</p>
              </div>
            )}

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="font-bold text-gray-800 flex items-center space-x-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>AI Automated Feedback:</span>
                </h5>
                {onApplyToRemarks && (
                  <button
                    onClick={() => {
                      onApplyToRemarks(record.aiFeedback || automatedReview.feedbackText);
                      onClose();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Insert into Form Remarks
                  </button>
                )}
              </div>
              <p className="text-gray-700 text-xs leading-relaxed italic bg-white p-3 rounded-lg border border-gray-100">
                "{record.aiFeedback || automatedReview.feedbackText}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-[11px] text-gray-500">
            Evaluator: <strong>{record.interviewerName}</strong> ({record.interviewerPhone})
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyReview}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Copy size={13} />
              <span>{copied ? 'Copied!' : 'Copy Review'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Printer size={13} />
              <span>Print Scorecard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
