import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Copy,
  X,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { InterviewQuestion, TargetRole } from '../types';
import { INTERVIEW_QUESTIONS, ROLES_CONFIG } from '../data/sampleData';

interface PIQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: TargetRole;
  onSelectQuestion?: (questionText: string) => void;
}

export const PIQuestionsModal: React.FC<PIQuestionsModalProps> = ({
  isOpen,
  onClose,
  targetRole = 'Full Stack Developer',
  onSelectQuestion,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(targetRole || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredQuestions = INTERVIEW_QUESTIONS.filter((q) => {
    const matchesRole =
      selectedRole === 'all' || q.role === selectedRole || (selectedRole !== 'General' && q.role === 'General');
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.evaluationHints.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const handleCopy = (q: InterviewQuestion) => {
    const text = `Question: ${q.question}\n\nKey Answer Indicators:\n${q.evaluationHints.map(h => `• ${h}`).join('\n')}\n\nFollow-up Probes:\n${q.followUpProbes.map(p => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const roleMeta = ROLES_CONFIG[selectedRole as TargetRole] || ROLES_CONFIG['Full Stack Developer'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <MessageSquare size={24} className="text-blue-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold">Personal Interview (PI) Question Recommender</h2>
                <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] rounded-full uppercase tracking-wider font-semibold">
                  PDF 50 Marks Rubric
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Technical, behavioral, and domain interview prompts with answer keys and follow-up probes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Selector & Context Bar */}
        <div className="bg-slate-50 border-b border-gray-200 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="text-gray-500 font-medium self-center mr-1">Target Profile:</span>
              {(['all', 'Full Stack Developer', 'Data Analyst', 'Tech Sales', 'General'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    selectedRole === r
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {r === 'all' ? 'All Questions' : r}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries (e.g. SQL, React, BANT)..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {selectedRole !== 'all' && roleMeta && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-blue-900">{roleMeta.company}</span>
                <span className="text-blue-700 mx-2">•</span>
                <span className="text-blue-800">Package: {roleMeta.package}</span>
                <span className="text-blue-700 mx-2">•</span>
                <span className="text-blue-700">{roleMeta.location}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {roleMeta.skills.slice(0, 3).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white text-blue-800 rounded text-[10px] border border-blue-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              No interview questions found for the selected query.
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                      {q.role}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-medium">
                      {q.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.difficulty === 'Entry-Level'
                          ? 'bg-green-100 text-green-700'
                          : q.difficulty === 'Moderate'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(q)}
                      className="px-2.5 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-1 border border-gray-200"
                    >
                      {copiedId === q.id ? (
                        <>
                          <CheckCircle2 size={13} className="text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>

                    {onSelectQuestion && (
                      <button
                        onClick={() => {
                          onSelectQuestion(q.question);
                          onClose();
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm"
                      >
                        Ask This Question
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                  "{q.question}"
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-emerald-900 text-xs font-bold">
                      <Lightbulb size={13} className="text-emerald-600" />
                      <span>What to Look for in Answer:</span>
                    </div>
                    <ul className="text-[11px] text-emerald-800 space-y-1">
                      {q.evaluationHints.map((hint, i) => (
                        <li key={i} className="flex items-start space-x-1">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-indigo-900 text-xs font-bold">
                      <HelpCircle size={13} className="text-indigo-600" />
                      <span>Suggested Follow-Up Probes:</span>
                    </div>
                    <ul className="text-[11px] text-indigo-800 space-y-1">
                      {q.followUpProbes.map((probe, i) => (
                        <li key={i} className="flex items-start space-x-1">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{probe}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
