import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Check,
  Search,
  ArrowRight,
  HelpCircle,
  X,
  LayoutGrid,
  Table as TableIcon,
  UserCheck,
  ChevronLeft,
} from 'lucide-react';
import { Candidate, EvaluationRecord } from '../types';
import { GD_CRITERIA } from '../data/sampleData';
import { generateAutomatedReview } from '../utils/reviewGenerator';

interface GDBatchAssessmentProps {
  candidates: Candidate[];
  evaluations: EvaluationRecord[];
  currentInterviewer: string;
  interviewerPanel?: string;
  onSaveEvaluations: (records: EvaluationRecord[], updatedCandidates: Candidate[]) => Promise<void>;
  onOpenGDTopicModal: () => void;
  activeTopic?: string;
  onProceedToPI?: (candidate: Candidate) => void;
}

interface StudentScoreData {
  scores: Record<string, number>;
  shortlistForPI: boolean;
  customFeedback: string;
  aiFeedback: string;
}

const QUICK_GD_OBSERVATIONS = [
  '+ Initiated Discussion',
  '+ Strong Analytical Points',
  '+ Clear Articulation',
  '+ Active Listener',
  '+ Encouraged Quiet Peers',
  '+ Respectful Counter-Argument',
  '- Hesitant / Spoke Very Little',
  '- Aggressive / Cut Others Off',
  '- Repetitive / Off-Topic',
];

export const GDBatchAssessment: React.FC<GDBatchAssessmentProps> = ({
  candidates,
  evaluations,
  currentInterviewer,
  interviewerPanel,
  onSaveEvaluations,
  onOpenGDTopicModal,
  activeTopic,
  onProceedToPI,
}) => {
  // Workflow Stage: 'select_group' (picker) vs 'live_assessment' (live scoring table)
  const [assessmentStage, setAssessmentStage] = useState<'select_group' | 'live_assessment'>('select_group');

  // Selected student IDs in current group
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Search and filters for candidate roster
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [onlyPendingGD, setOnlyPendingGD] = useState(true);

  // Group Discussion metadata
  const [batchName, setBatchName] = useState('GD Batch #1');
  const [currentTopic, setCurrentTopic] = useState(
    activeTopic || 'Impact of Generative AI on Tech Hiring & Software Engineering Roles'
  );

  // Live GD Countdown Timer (default 20 mins)
  const [timerSeconds, setTimerSeconds] = useState(20 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // View mode inside assessment stage: 'table' (Excel matrix) vs 'cards'
  const [scoringLayout, setScoringLayout] = useState<'table' | 'cards'>('table');

  // Individual student scores: candidateId -> StudentScoreData
  const [studentScores, setStudentScores] = useState<Record<string, StudentScoreData>>({});

  // Submitting state and completion summary
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState<EvaluationRecord[] | null>(null);

  // Countdown timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // Sync active topic prop
  useEffect(() => {
    if (activeTopic) {
      setCurrentTopic(activeTopic);
    }
  }, [activeTopic]);

  // Initialize scores state for newly selected students
  useEffect(() => {
    setStudentScores((prev) => {
      const next = { ...prev };
      selectedCandidateIds.forEach((id) => {
        if (!next[id]) {
          const existingEval = evaluations.find(
            (e) =>
              (e.candidateId === id || e.rollNo === candidates.find((c) => c.id === id)?.rollNo) &&
              e.evaluationType === 'GD'
          );

          if (existingEval) {
            next[id] = {
              scores: { ...existingEval.scores },
              shortlistForPI: existingEval.totalScore >= 25,
              customFeedback: existingEval.customFeedback || '',
              aiFeedback: existingEval.aiFeedback || '',
            };
          } else {
            // Default 6/10 across all 5 criteria = 30/50
            const defaultScores = GD_CRITERIA.reduce((acc, crit) => {
              acc[crit] = 6;
              return acc;
            }, {} as Record<string, number>);

            next[id] = {
              scores: defaultScores,
              shortlistForPI: true,
              customFeedback: '',
              aiFeedback: '',
            };
          }
        }
      });
      return next;
    });
  }, [selectedCandidateIds, candidates, evaluations]);

  // Helper: toggle student in/out of group
  const handleToggleCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Helper: quick select batch presets
  const handleQuickSelectPreset = (count: number) => {
    const available = candidates.filter((c) => {
      const hasGD = evaluations.some(
        (e) => (e.candidateId === c.id || e.rollNo === c.rollNo) && e.evaluationType === 'GD'
      );
      return !hasGD;
    });

    const chosen = available.slice(0, count).map((c) => c.id);
    setSelectedCandidateIds(chosen);
  };

  // Score changer for a student on a specific rubric (allows any value from 0 to 10)
  const handleUpdateStudentScore = (candId: string, criterion: string, value: number) => {
    const clamped = isNaN(value) ? 0 : Math.max(0, Math.min(10, value));
    setStudentScores((prev) => {
      const student = prev[candId] || {
        scores: {},
        shortlistForPI: true,
        customFeedback: '',
        aiFeedback: '',
      };

      const updatedScores = {
        ...student.scores,
        [criterion]: clamped,
      };

      const total = GD_CRITERIA.reduce((sum, crit) => sum + (updatedScores[crit] || 0), 0);

      return {
        ...prev,
        [candId]: {
          ...student,
          scores: updatedScores,
          // Auto-adjust shortlist suggestion based on 25 pass mark
          shortlistForPI: total >= 25,
        },
      };
    });
  };

  // Toggle Shortlist for PI
  const handleToggleShortlist = (candId: string) => {
    setStudentScores((prev) => {
      const student = prev[candId];
      if (!student) return prev;
      return {
        ...prev,
        [candId]: {
          ...student,
          shortlistForPI: !student.shortlistForPI,
        },
      };
    });
  };

  // Feedback note handler
  const handleFeedbackChange = (candId: string, text: string) => {
    setStudentScores((prev) => {
      const student = prev[candId];
      if (!student) return prev;
      return {
        ...prev,
        [candId]: {
          ...student,
          customFeedback: text,
        },
      };
    });
  };

  // Add observation tag
  const handleAddTag = (candId: string, tag: string) => {
    setStudentScores((prev) => {
      const student = prev[candId];
      if (!student) return prev;
      const cur = student.customFeedback;
      return {
        ...prev,
        [candId]: {
          ...student,
          customFeedback: cur ? `${cur}; ${tag}` : tag,
        },
      };
    });
  };

  // Generate AI feedback for an individual student in the group
  const handleGenerateStudentAIFeedback = (cand: Candidate) => {
    const student = studentScores[cand.id];
    const scores = student?.scores || {};
    const totalScore = GD_CRITERIA.reduce((sum, crit) => sum + (scores[crit] || 0), 0);

    const review = generateAutomatedReview({
      studentName: cand.name,
      evaluationType: 'GD',
      role: cand.targetRole,
      scores,
      totalScore,
    });

    setStudentScores((prev) => ({
      ...prev,
      [cand.id]: {
        ...prev[cand.id],
        aiFeedback: review.feedbackText,
      },
    }));
  };

  // Submit all group evaluations
  const handleSubmitAllEvaluations = async () => {
    if (selectedCandidateIds.length === 0) {
      alert('No candidates in group to evaluate.');
      return;
    }

    setIsSubmitting(true);
    try {
      const recordsToSave: EvaluationRecord[] = [];
      const updatedCandidatesList: Candidate[] = [];

      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      selectedCandidateIds.forEach((candId, idx) => {
        const candidate = candidates.find((c) => c.id === candId);
        if (!candidate) return;

        const studentData = studentScores[candId] || {
          scores: GD_CRITERIA.reduce((acc, c) => ({ ...acc, [c]: 6 }), {}),
          shortlistForPI: true,
          customFeedback: '',
          aiFeedback: '',
        };

        const totalScore = GD_CRITERIA.reduce(
          (sum, crit) => sum + (studentData.scores[crit] || 0),
          0
        );

        const review = generateAutomatedReview({
          studentName: candidate.name,
          evaluationType: 'GD',
          role: candidate.targetRole,
          scores: studentData.scores,
          totalScore,
        });

        const finalAI = studentData.aiFeedback || review.feedbackText;
        const finalRemarks = studentData.customFeedback
          ? `${studentData.customFeedback} | [GD Topic: ${currentTopic}]`
          : `[GD Topic: ${currentTopic}] - ${finalAI}`;

        const record: EvaluationRecord = {
          id: `eval-gd-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          srNo: evaluations.length + idx + 1,
          candidateId: candidate.id,
          studentName: candidate.name,
          rollNo: candidate.rollNo,
          degree: candidate.degree,
          targetRole: candidate.targetRole,
          evaluationType: 'GD',
          scores: studentData.scores,
          totalScore,
          maxScore: 50,
          automatedReview: review,
          customFeedback: studentData.customFeedback,
          aiFeedback: finalAI,
          interviewerRemarks: finalRemarks,
          interviewerName: currentInterviewer,
          interviewerPhone: interviewerPanel || 'GD Room Panel',
          timestamp,
        };

        recordsToSave.push(record);

        const updatedCand: Candidate = {
          ...candidate,
          status: studentData.shortlistForPI ? 'PI Shortlisted' : 'Eliminated',
        };
        updatedCandidatesList.push(updatedCand);
      });

      await onSaveEvaluations(recordsToSave, updatedCandidatesList);
      setSubmissionSummary(recordsToSave);
      setIsTimerRunning(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit group evaluations');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timer MM:SS
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered candidate list for selection stage
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || c.targetRole === roleFilter;
    const matchesDegree = degreeFilter === 'all' || c.degree === degreeFilter;
    const hasGD = evaluations.some(
      (e) => (e.candidateId === c.id || e.rollNo === c.rollNo) && e.evaluationType === 'GD'
    );
    const matchesPending = !onlyPendingGD || !hasGD;
    return matchesSearch && matchesRole && matchesDegree && matchesPending;
  });

  const selectedCandidates = selectedCandidateIds
    .map((id) => candidates.find((c) => c.id === id))
    .filter(Boolean) as Candidate[];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-purple-800/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full font-bold text-[11px] uppercase tracking-wider">
                Group Discussion Assessment System
              </span>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="bg-purple-800/40 border border-purple-400/40 rounded-lg text-xs text-purple-200 font-bold px-2 py-0.5 focus:outline-none focus:border-purple-300 w-28"
                title="Click to rename batch"
              />
              <span className="text-xs text-purple-200 font-mono">
                • {selectedCandidateIds.length} Students Selected
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold mt-1 text-white">
              {assessmentStage === 'select_group'
                ? 'Step 1: Form Your GD Group Circle'
                : 'Step 2: Live Simultaneous Group Assessment'}
            </h1>
            <p className="text-xs text-purple-200/90 mt-0.5 max-w-2xl">
              {assessmentStage === 'select_group'
                ? 'Click on candidate names below to build your discussion table. Once ready, click "Assess Group Together" to score all students simultaneously.'
                : 'Score each candidate individually across the 5 GD rubrics while the group discussion is in progress.'}
            </p>
          </div>

          {/* Controls: Timer, Topic Recommender & Stage Switcher */}
          <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
            {/* Live Shared Timer */}
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-purple-500/40 px-3.5 py-2 rounded-2xl shadow-inner">
              <div className="font-mono text-base font-black text-amber-300 min-w-[50px]">
                {formatTimer(timerSeconds)}
              </div>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 ${
                  isTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
                <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(20 * 60);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60"
                title="Reset timer to 20 mins"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* Choose Topic Button */}
            <button
              type="button"
              onClick={onOpenGDTopicModal}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <HelpCircle size={14} />
              <span>Choose Topic</span>
            </button>
          </div>
        </div>

        {/* Active GD Topic Bar */}
        <div className="mt-4 pt-4 border-t border-purple-800/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <span className="text-xs font-bold text-purple-200 shrink-0 flex items-center space-x-1">
            <span>GD Topic:</span>
          </span>
          <input
            type="text"
            value={currentTopic}
            onChange={(e) => setCurrentTopic(e.target.value)}
            placeholder="Type or pick a GD topic..."
            className="flex-1 px-3 py-1.5 bg-slate-950/60 border border-purple-500/40 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* 2. Submission Success Banner */}
      {submissionSummary && (
        <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-3xl space-y-3 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-3 text-emerald-950">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Check size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  Evaluated {submissionSummary.length} students in {batchName}!
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  All individual scorecards have been saved and synced to the Student Notice Board and Universal Master Google Sheet.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSubmissionSummary(null);
                  setSelectedCandidateIds([]);
                  setAssessmentStage('select_group');
                  handleQuickSelectPreset(6);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Start Next GD Batch →
              </button>
            </div>
          </div>

          {/* Quick links to proceed to PI for shortlisted students */}
          <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-emerald-900">Proceed to Step 2 (PI):</span>
            {submissionSummary
              .filter((r) => r.totalScore >= 25)
              .map((rec) => {
                const cand = candidates.find(
                  (c) => c.id === rec.candidateId || c.rollNo === rec.rollNo
                );
                return (
                  <button
                    key={rec.id}
                    onClick={() => cand && onProceedToPI && onProceedToPI(cand)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs"
                  >
                    <span>
                      {rec.studentName} ({rec.totalScore}/50)
                    </span>
                    <ArrowRight size={11} />
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* 3. STAGE 1: GROUP BUILDER / CANDIDATE SELECTION */}
      {assessmentStage === 'select_group' && (
        <div className="space-y-4">
          {/* Selected Group Tray / Action Banner */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-200 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Users size={16} className="text-purple-600" />
                  <span>Selected Group Members ({selectedCandidates.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on any candidate card below to add or remove them from this group.
                </p>
              </div>

              {/* Presets and Main Action Button */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset(6)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Pick 6
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset(8)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Pick 8
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset(10)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Pick 10
                </button>
                {selectedCandidateIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCandidateIds([])}
                    className="px-2 py-1 text-slate-400 hover:text-red-600 text-xs font-medium"
                  >
                    Clear All
                  </button>
                )}

                {/* THE BIG ACTION BUTTON */}
                <button
                  type="button"
                  disabled={selectedCandidateIds.length === 0}
                  onClick={() => setAssessmentStage('live_assessment')}
                  className="ml-2 px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-2xl text-xs font-bold shadow-md flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-95"
                >
                  <UserCheck size={16} />
                  <span>
                    Assess Group Together ({selectedCandidateIds.length} Students) →
                  </span>
                </button>
              </div>
            </div>

            {/* Selected Chips Roster */}
            {selectedCandidates.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {selectedCandidates.map((cand, idx) => (
                  <div
                    key={cand.id}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 border border-purple-300 rounded-xl text-xs text-purple-950 font-medium"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-700 text-white font-black text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-bold">{cand.name}</span>
                    <span className="text-[10px] text-purple-700 font-mono">({cand.rollNo})</span>
                    <button
                      type="button"
                      onClick={() => handleToggleCandidate(cand.id)}
                      className="text-purple-400 hover:text-red-600 ml-1"
                      title="Remove from group"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-purple-50/50 rounded-2xl border border-dashed border-purple-200 text-xs text-purple-800 font-medium">
                👉 Click any student cards below to form your group, or click <strong>"Pick 6"</strong> above.
              </div>
            )}
          </div>

          {/* Search, Filter and Candidate Grid */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name or roll number..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="all">All Roles</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Tech Sales">Tech Sales</option>
                  <option value="General">General</option>
                </select>

                <select
                  value={degreeFilter}
                  onChange={(e) => setDegreeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="all">All Degrees</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="MCA">MCA</option>
                  <option value="BCA">BCA</option>
                </select>

                <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={onlyPendingGD}
                    onChange={(e) => setOnlyPendingGD(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Pending GD Only</span>
                </label>
              </div>
            </div>

            {/* Clickable Candidate Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
              {filteredCandidates.map((cand) => {
                const isSelected = selectedCandidateIds.includes(cand.id);
                const seatIndex = selectedCandidateIds.indexOf(cand.id);
                const hasGDEval = evaluations.some(
                  (e) =>
                    (e.candidateId === cand.id || e.rollNo === cand.rollNo) &&
                    e.evaluationType === 'GD'
                );

                return (
                  <div
                    key={cand.id}
                    onClick={() => handleToggleCandidate(cand.id)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all select-none relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-100/80 border-purple-500 ring-2 ring-purple-500/30 shadow-sm transform -translate-y-0.5'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          #{seatIndex + 1}
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs flex items-center justify-center font-bold">
                          +
                        </span>
                      )}

                      {hasGDEval ? (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded">
                          GD Done
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] rounded font-medium">
                          Pending
                        </span>
                      )}
                    </div>

                    <div>
                      <div
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-purple-950 font-black' : 'text-slate-800'
                        }`}
                      >
                        {cand.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {cand.rollNo}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="truncate font-medium">{cand.degree}</span>
                      <span className="font-bold text-amber-800">{cand.amcatScore} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. STAGE 2: LIVE SIMULTANEOUS GROUP ASSESSMENT STUDIO */}
      {assessmentStage === 'live_assessment' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Studio Top Control Bar */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setAssessmentStage('select_group')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Change / Add Students ({selectedCandidates.length})</span>
              </button>

              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {batchName} • {selectedCandidates.length} Active Candidates
              </span>
            </div>

            {/* Layout Toggle & Main Submit Button */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setScoringLayout('table')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                    scoringLayout === 'table' ? 'bg-white shadow-2xs text-purple-900' : 'text-slate-600'
                  }`}
                >
                  <TableIcon size={13} />
                  <span>Score Matrix</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScoringLayout('cards')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                    scoringLayout === 'cards' ? 'bg-white shadow-2xs text-purple-900' : 'text-slate-600'
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Cards View</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitAllEvaluations}
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <CheckCircle size={15} />
                <span>{isSubmitting ? 'Recording...' : `Submit All (${selectedCandidates.length})`}</span>
              </button>
            </div>
          </div>

          {/* VIEW A: SCORE MATRIX TABLE (Excel-Style High Efficiency) */}
          {scoringLayout === 'table' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="py-3 px-4 w-12 text-center">Seat</th>
                      <th className="py-3 px-4 min-w-[160px]">Student Info</th>
                      {GD_CRITERIA.map((crit) => (
                        <th key={crit} className="py-3 px-3 min-w-[140px] text-center">
                          <div>{crit}</div>
                          <div className="text-[10px] text-slate-400 font-normal">0–10 Marks</div>
                        </th>
                      ))}
                      <th className="py-3 px-4 w-20 text-center">Total /50</th>
                      <th className="py-3 px-4 w-28 text-center">PI Shortlist</th>
                      <th className="py-3 px-4 min-w-[200px]">Notes & Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCandidates.map((cand, idx) => {
                      const studentData = studentScores[cand.id] || {
                        scores: GD_CRITERIA.reduce((acc, c) => ({ ...acc, [c]: 6 }), {}),
                        shortlistForPI: true,
                        customFeedback: '',
                        aiFeedback: '',
                      };
                      const scores = studentData.scores;
                      const total = GD_CRITERIA.reduce((s, c) => s + (scores[c] || 0), 0);
                      const isShortlisted = studentData.shortlistForPI;

                      return (
                        <tr key={cand.id} className="hover:bg-purple-50/30 transition-colors">
                          {/* Seat # */}
                          <td className="py-3 px-4 text-center">
                            <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-bold text-xs inline-flex items-center justify-center shadow-2xs">
                              #{idx + 1}
                            </span>
                          </td>

                          {/* Student Details */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{cand.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{cand.rollNo}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {cand.degree} • <span className="text-purple-700">{cand.targetRole}</span>
                            </div>
                          </td>

                          {/* 5 Criteria Marks with Direct Numeric Input Box (0–10) */}
                          {GD_CRITERIA.map((crit) => {
                            const val = scores[crit] !== undefined ? scores[crit] : 6;
                            return (
                              <td key={crit} className="py-3 px-2 text-center">
                                <div className="flex flex-col items-center justify-center space-y-1">
                                  <div className="flex items-center space-x-1 justify-center">
                                    <input
                                      type="number"
                                      min={0}
                                      max={10}
                                      step={1}
                                      value={val === 0 ? '0' : val || ''}
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw === '') {
                                          handleUpdateStudentScore(cand.id, crit, 0);
                                        } else {
                                          const parsed = parseInt(raw, 10);
                                          if (!isNaN(parsed)) {
                                            handleUpdateStudentScore(cand.id, crit, parsed);
                                          }
                                        }
                                      }}
                                      className="w-14 h-9 text-center font-bold text-sm bg-white border-2 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 rounded-xl text-slate-900 shadow-2xs font-mono"
                                      placeholder="0-10"
                                      title="Type any mark (0-10)"
                                    />
                                    <span className="text-[11px] text-slate-400 font-bold">/10</span>
                                  </div>

                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStudentScore(cand.id, crit, Math.max(0, val - 1))}
                                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center"
                                      title="Decrease by 1"
                                    >
                                      -
                                    </button>
                                    <span className="text-[9px] text-slate-400 font-mono">step</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStudentScore(cand.id, crit, Math.min(10, val + 1))}
                                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center"
                                      title="Increase by 1"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </td>
                            );
                          })}

                          {/* Total Score */}
                          <td className="py-3 px-4 text-center">
                            <div
                              className={`text-base font-black ${
                                total >= 35
                                  ? 'text-emerald-700'
                                  : total >= 25
                                  ? 'text-purple-700'
                                  : 'text-red-600'
                              }`}
                            >
                              {total}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">/50</div>
                          </td>

                          {/* PI Shortlist Switch */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleShortlist(cand.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                isShortlisted
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-red-50 text-red-800 border-red-300'
                              }`}
                            >
                              {isShortlisted ? '✓ Shortlist' : '✕ Reject'}
                            </button>
                          </td>

                          {/* Notes & Quick Tags */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={studentData.customFeedback}
                                onChange={(e) => handleFeedbackChange(cand.id, e.target.value)}
                                placeholder="Student remarks..."
                                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />

                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleGenerateStudentAIFeedback(cand)}
                                  className="text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-0.5"
                                >
                                  <Sparkles size={10} />
                                  <span>AI Note</span>
                                </button>

                                <div className="flex flex-wrap gap-1">
                                  {QUICK_GD_OBSERVATIONS.slice(0, 3).map((tag) => (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => handleAddTag(cand.id, tag)}
                                      className="px-1.5 py-0.2 bg-slate-100 hover:bg-purple-100 text-[9px] text-slate-600 rounded"
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {studentData.aiFeedback && (
                                <div className="text-[10px] text-purple-900 bg-purple-50 p-1.5 rounded border border-purple-200 italic">
                                  {studentData.aiFeedback}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW B: CARDS VIEW */}
          {scoringLayout === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCandidates.map((cand, idx) => {
                const studentData = studentScores[cand.id] || {
                  scores: GD_CRITERIA.reduce((acc, c) => ({ ...acc, [c]: 6 }), {}),
                  shortlistForPI: true,
                  customFeedback: '',
                  aiFeedback: '',
                };
                const scores = studentData.scores;
                const total = GD_CRITERIA.reduce((s, c) => s + (scores[c] || 0), 0);
                const isShortlisted = studentData.shortlistForPI;

                return (
                  <div
                    key={cand.id}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-700 text-white font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{cand.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{cand.rollNo}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {cand.degree} • <span className="text-purple-700">{cand.targetRole}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900">{total}/50</div>
                        <button
                          type="button"
                          onClick={() => handleToggleShortlist(cand.id)}
                          className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            isShortlisted
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        >
                          {isShortlisted ? '✓ Shortlist for PI' : '✕ Reject'}
                        </button>
                      </div>
                    </div>

                    {/* Criteria Direct Input Boxes (0–10) */}
                    <div className="space-y-2">
                      {GD_CRITERIA.map((crit) => {
                        const val = scores[crit] !== undefined ? scores[crit] : 6;
                        return (
                          <div
                            key={crit}
                            className="flex items-center justify-between text-xs gap-2 bg-slate-50/70 p-2 rounded-xl border border-slate-200/70"
                          >
                            <span className="text-slate-800 font-semibold truncate">{crit}</span>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateStudentScore(cand.id, crit, Math.max(0, val - 1))}
                                className="w-6 h-7 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shadow-2xs"
                                title="Minus 1"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                max={10}
                                step={1}
                                value={val === 0 ? '0' : val || ''}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === '') {
                                    handleUpdateStudentScore(cand.id, crit, 0);
                                  } else {
                                    const parsed = parseInt(raw, 10);
                                    if (!isNaN(parsed)) {
                                      handleUpdateStudentScore(cand.id, crit, parsed);
                                    }
                                  }
                                }}
                                className="w-12 h-7 text-center font-bold text-xs bg-white border border-slate-300 focus:border-purple-600 rounded-lg text-slate-900 font-mono shadow-2xs"
                                placeholder="0-10"
                              />
                              <span className="text-[11px] text-slate-400 font-bold">/10</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateStudentScore(cand.id, crit, Math.min(10, val + 1))}
                                className="w-6 h-7 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shadow-2xs"
                                title="Plus 1"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Feedback */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <input
                        type="text"
                        value={studentData.customFeedback}
                        onChange={(e) => handleFeedbackChange(cand.id, e.target.value)}
                        placeholder="Notes for student..."
                        className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Bottom Submission Bar */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
            <div>
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Group Discussion Assessment
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {selectedCandidates.length} Students Scored • Ready to Sync to Universal Master Sheet
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setAssessmentStage('select_group')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all"
              >
                ← Edit Group
              </button>

              <button
                type="button"
                onClick={handleSubmitAllEvaluations}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle size={16} />
                <span>{isSubmitting ? 'Recording All Scores...' : `Submit All ${selectedCandidates.length} Group Evaluations`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
