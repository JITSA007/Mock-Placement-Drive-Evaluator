import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Briefcase,
  Users,
  UserCheck,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  Save,
  PlusCircle,
  FileUp,
  Download,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Building2,
  ArrowRight,
  SlidersHorizontal,
  Trophy,
  CheckSquare,
  Tag,
  PenTool,
  RotateCcw,
  FileText,
  Key,
  ExternalLink,
} from 'lucide-react';
import {
  AmcatCategory,
  Candidate,
  Degree,
  EvaluationRecord,
  EvaluationType,
  TargetRole,
  AppUser,
} from './types';
import {
  GD_CRITERIA,
  PI_CRITERIA,
  ROLES_CONFIG,
  DEFAULT_AMCAT_CATEGORIES,
} from './data/sampleData';
import { DEFAULT_USERS } from './data/defaultUsers';
import { generateAutomatedReview } from './utils/reviewGenerator';
import { CandidateManagerModal } from './components/CandidateManagerModal';
import { GDRecommenderModal } from './components/GDRecommenderModal';
import { PIQuestionsModal } from './components/PIQuestionsModal';
import { SpreadsheetView } from './components/SpreadsheetView';
import { AutomatedReviewModal } from './components/AutomatedReviewModal';
import { AmcatCategoryModal } from './components/AmcatCategoryModal';
import { InterviewerLoginBar } from './components/InterviewerLoginBar';
import { LoginGate } from './components/LoginGate';
import { StudentNoticeBoard } from './components/StudentNoticeBoard';
import { UserManagementModal } from './components/UserManagementModal';
import { CandidateDossierModal } from './components/CandidateDossierModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { UniversalSheetModal } from './components/UniversalSheetModal';
import { EvaluationTimer } from './components/EvaluationTimer';
import { downloadSampleCandidateExcel } from './utils/excelUtils';
import { syncService } from './utils/syncService';
import { initAuth, googleSignIn, logout, getAccessToken } from './utils/googleAuth';
import {
  getOrCreateDatabaseSpreadsheet,
  appendEvaluationToGoogleSheet,
  syncAllToGoogleSheet,
} from './utils/googleSheetsDatabase';

const QUICK_FEEDBACK_TAGS = [
  'Strong domain knowledge',
  'Clear & structured communication',
  'Demonstrated leadership & initiative',
  'Good active listening & teamwork',
  'Needs practice with complex SQL/algorithms',
  'Confident posture & positive body language',
  'Hesitant on edge-cases',
  'High relocation readiness & enthusiasm',
];

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'evaluate' | 'sheet' | 'candidates' | 'resources'>('evaluate');

  // App Users & Authentication State
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('placement_users_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  });

  const [currentAppUser, setCurrentAppUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('placement_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Dedicated Page Routing: 'login' (Interviewer Login) | 'evaluator' (Workspace) | 'student-board' (Public Read-Only)
  const [pageMode, setPageMode] = useState<'login' | 'evaluator' | 'student-board'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#student-board') return 'student-board';
      const savedUser = localStorage.getItem('placement_current_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u && u.username) return 'evaluator';
        } catch (e) {}
      }
    }
    return 'login';
  });

  // Listen to browser hash changes (#login, #evaluator, #student-board)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#student-board') {
        setPageMode('student-board');
      } else if (hash === '#login') {
        if (!currentAppUser) setPageMode('login');
      } else if (hash === '#evaluator') {
        if (currentAppUser) setPageMode('evaluator');
        else setPageMode('login');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentAppUser]);

  // Google OAuth User (Optional)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('placement_google_sheet_database_id');
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  // Evaluator selection
  const [interviewersList, setInterviewersList] = useState<string[]>(() => {
    return users.map((u) => u.name);
  });

  const [selectedInterviewer, setSelectedInterviewer] = useState<string>(() => {
    if (currentAppUser) return currentAppUser.name;
    const saved = localStorage.getItem('placement_selected_interviewer');
    return saved || users[0]?.name || 'Sahin';
  });
  const [isAddingNewInterviewer, setIsAddingNewInterviewer] = useState(false);
  const [newInterviewerInput, setNewInterviewerInput] = useState('');

  // AMCAT Categories (Customizable & defined by user)
  const [amcatCategories, setAmcatCategories] = useState<AmcatCategory[]>(() => {
    const saved = localStorage.getItem('placement_amcat_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_AMCAT_CATEGORIES;
      }
    }
    return DEFAULT_AMCAT_CATEGORIES;
  });
  const [isAmcatModalOpen, setIsAmcatModalOpen] = useState(false);
  const [amcatTargetCandidate, setAmcatTargetCandidate] = useState<Candidate | null>(null);

  // Candidates & Evaluations Store (Clean initial database - 0 demo data)
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('placement_candidates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.filter((c: Candidate) => !c.id.startsWith('cand-00'));
        return cleaned;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() => {
    const saved = localStorage.getItem('placement_evaluations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.filter((e: EvaluationRecord) => !e.id.startsWith('eval-00'));
        return cleaned;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Multi-user Presence & Synchronization
  const [connectedUsers, setConnectedUsers] = useState<number>(1);

  // FLOW STATE: GD First, then PI
  const [evaluationType, setEvaluationType] = useState<EvaluationType>('GD');
  const [shortlistForPI, setShortlistForPI] = useState<boolean>(true);

  // Evaluation Form State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [rollNo, setRollNo] = useState<string>('');
  const [degree, setDegree] = useState<Degree>('B.Tech');
  const [targetRole, setTargetRole] = useState<TargetRole>('Full Stack Developer');
  const [scores, setScores] = useState<Record<string, number>>({});

  // DUAL FEEDBACK: Customized manual feedback & AI feedback
  const [customFeedback, setCustomFeedback] = useState<string>('');
  const [aiFeedbackText, setAiFeedbackText] = useState<string>('');
  const [activeGDTopicTitle, setActiveGDTopicTitle] = useState<string>('');

  // Modals state
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isGDModalOpen, setIsGDModalOpen] = useState(false);
  const [isPIModalOpen, setIsPIModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [dossierCandidate, setDossierCandidate] = useState<Candidate | null>(null);
  const [reviewModalRecord, setReviewModalRecord] = useState<EvaluationRecord | null>(null);
  const [isSheetSyncModalOpen, setIsSheetSyncModalOpen] = useState(false);
  const [masterSheetConfig, setMasterSheetConfig] = useState<{
    webhookUrl?: string;
    spreadsheetId?: string;
    ownerEmail?: string;
    lastSyncedAt?: string;
    syncCount?: number;
  }>(() => {
    const saved = localStorage.getItem('placement_master_sheet_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { ownerEmail: 'jitsahere@gmail.com', syncCount: 0 };
  });
  const [isUniversalSheetModalOpen, setIsUniversalSheetModalOpen] = useState(false);

  // Notifications & Live Sync Indicator
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [liveSyncActive, setLiveSyncActive] = useState<boolean>(true);
  const [justCompletedGDCandidate, setJustCompletedGDCandidate] = useState<Candidate | null>(null);

  // --- Initialize Firebase Google Authentication Listener ---
  useEffect(() => {
    const unsubscribeAuth = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        if (user.displayName) {
          setSelectedInterviewer(user.displayName);
        }

        // Initialize or find Google Sheet database
        try {
          const sheetId = await getOrCreateDatabaseSpreadsheet(token);
          setSpreadsheetId(sheetId);
        } catch (err) {
          console.warn('Could not auto-connect Google Sheet database:', err);
        }
      },
      () => {
        setCurrentUser(null);
      }
    );

    return () => unsubscribeAuth();
  }, []);

  // --- Real-Time Multi-User Synchronization Setup ---
  useEffect(() => {
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.candidates)) setCandidates(data.candidates);
        if (Array.isArray(data.evaluations)) setEvaluations(data.evaluations);
        if (Array.isArray(data.amcatCategories)) setAmcatCategories(data.amcatCategories);
        if (data.masterSheetConfig) setMasterSheetConfig(data.masterSheetConfig);
        if (Array.isArray(data.users)) {
          setUsers(data.users);
          setInterviewersList(data.users.map((u: AppUser) => u.name));
        } else if (Array.isArray(data.interviewers)) {
          setInterviewersList(data.interviewers);
        }
        if (typeof data.connectedUsers === 'number') setConnectedUsers(data.connectedUsers);
        setLiveSyncActive(true);
      })
      .catch((err) => console.log('Using local sync mode:', err));

    const unsubscribe = syncService.subscribe((delta) => {
      setLiveSyncActive(true);
      if (delta.candidates !== undefined) setCandidates(delta.candidates);
      if (delta.evaluations !== undefined) setEvaluations(delta.evaluations);
      if (delta.amcatCategories !== undefined) setAmcatCategories(delta.amcatCategories);
      if (delta.masterSheetConfig !== undefined) setMasterSheetConfig(delta.masterSheetConfig);
      if (delta.users !== undefined) {
        setUsers(delta.users);
        setInterviewersList(delta.users.map((u) => u.name));
      } else if (delta.interviewers !== undefined) {
        setInterviewersList(delta.interviewers);
      }
      if (typeof delta.connectedUsers === 'number') setConnectedUsers(delta.connectedUsers);
    });

    return () => unsubscribe();
  }, []);

  // Persist selections locally
  useEffect(() => {
    localStorage.setItem('placement_selected_interviewer', selectedInterviewer);
  }, [selectedInterviewer]);

  useEffect(() => {
    localStorage.setItem('placement_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('placement_interviewers_list', JSON.stringify(interviewersList));
  }, [interviewersList]);

  useEffect(() => {
    localStorage.setItem('placement_amcat_categories', JSON.stringify(amcatCategories));
  }, [amcatCategories]);

  useEffect(() => {
    localStorage.setItem('placement_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('placement_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // --- Credentials Authentication Handler (Sahin, Ashad, Harleen, Gunjan, Aditi, Jitendra) ---
  const handleLoginWithCredentials = (username: string, password: string): boolean => {
    const matched = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password &&
        u.active
    );

    if (matched) {
      setCurrentAppUser(matched);
      setSelectedInterviewer(matched.name);
      localStorage.setItem('placement_current_user', JSON.stringify(matched));
      setPageMode('evaluator');
      window.location.hash = '#evaluator';
      showToast(`Welcome, ${matched.name}! Logged in as ${matched.role}.`);
      return true;
    }
    return false;
  };

  // Google Login Handler (for supported domains)
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        if (result.user.displayName) {
          setSelectedInterviewer(result.user.displayName);
        }

        const sheetId = await getOrCreateDatabaseSpreadsheet(result.accessToken);
        setSpreadsheetId(sheetId);
        showToast('Signed in with Google! Google Sheets database connected.');
      }
    } catch (err: any) {
      showToast(err.message || 'Google sign-in error. Use direct username/password login.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {}
    setCurrentUser(null);
    setCurrentAppUser(null);
    localStorage.removeItem('placement_current_user');
    localStorage.removeItem('placement_guest_mode');
    setPageMode('login');
    window.location.hash = '#login';
    showToast('Signed out. Evaluation portal locked.');
  };

  // User Management Handlers (Save, Delete, Reset)
  const handleSaveUser = async (user: AppUser) => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = user;
        return updated;
      }
      return [...prev, user];
    });

    if (currentAppUser && currentAppUser.id === user.id) {
      setCurrentAppUser(user);
      localStorage.setItem('placement_current_user', JSON.stringify(user));
    }

    await syncService.saveUser(user);
    showToast(`User ${user.name} saved and synced!`);
  };

  const handleDeleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    await syncService.deleteUser(id);
    showToast('User removed.');
  };

  const handleResetUsers = async () => {
    setUsers(DEFAULT_USERS);
    await syncService.resetUsers();
    showToast('Restored default 6 evaluator credentials.');
  };

  // Manual Push / Export to Google Sheet Database & Excel
  const handleManualSyncToGoogleSheets = async () => {
    const token = await getAccessToken();
    if (token && spreadsheetId) {
      setIsSyncingSheets(true);
      try {
        await syncAllToGoogleSheet(token, spreadsheetId, evaluations, candidates);
        showToast('All records successfully synchronized to Google Sheet database!');
      } catch (err: any) {
        setIsSheetSyncModalOpen(true);
      } finally {
        setIsSyncingSheets(false);
      }
    } else {
      // Seamlessly open Google Sheets / Excel Export & Sync Modal!
      setIsSheetSyncModalOpen(true);
    }
  };

  // Universal Master Google Sheet Handlers (Owned by jitsahere@gmail.com)
  const handleSaveMasterSheetConfig = async (config: { webhookUrl?: string; spreadsheetId?: string }) => {
    const updated = {
      ...masterSheetConfig,
      ...config,
      ownerEmail: 'jitsahere@gmail.com',
      lastSyncedAt: new Date().toLocaleTimeString(),
    };
    setMasterSheetConfig(updated);
    localStorage.setItem('placement_master_sheet_config', JSON.stringify(updated));
    if (config.spreadsheetId) {
      setSpreadsheetId(config.spreadsheetId);
      localStorage.setItem('placement_google_sheet_database_id', config.spreadsheetId);
    }
    try {
      await fetch('/api/master-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {}
    showToast('Universal Master Sheet connected! All 6 evaluators will auto-write here.');
  };

  const handleForceSyncAllToMasterSheet = async () => {
    if (!masterSheetConfig.webhookUrl) {
      showToast('Please set your Google Sheet Webhook URL first.', 'error');
      return;
    }
    const res = await fetch('/api/master-sheet/sync-all', {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to sync to master sheet');
    }
    showToast(`Master Google Sheet updated with all ${evaluations.length} evaluation records!`);
  };

  // Find active candidate object
  const activeCandidate = candidates.find(
    (c) => c.id === selectedCandidateId || (c.rollNo && c.rollNo.toLowerCase() === rollNo.toLowerCase())
  );

  const activeCandidateGDEval = activeCandidate
    ? evaluations.find(
        (e) => (e.candidateId === activeCandidate.id || e.rollNo === activeCandidate.rollNo) && e.evaluationType === 'GD'
      )
    : null;

  // Candidate selection
  const handleCandidateSelect = (candId: string) => {
    setSelectedCandidateId(candId);
    if (!candId) {
      setStudentName('');
      setRollNo('');
      return;
    }
    const cand = candidates.find((c) => c.id === candId);
    if (cand) {
      setStudentName(cand.name);
      setRollNo(cand.rollNo);
      setDegree(cand.degree);
      setTargetRole(cand.targetRole);
      setShortlistForPI(true);
    }
  };

  const handleScoreChange = (criterion: string, val: number) => {
    const clamped = Math.max(0, Math.min(10, val));
    setScores((prev) => {
      const updated = {
        ...prev,
        [criterion]: clamped,
      };
      if (evaluationType === 'GD') {
        const sum = currentCriteria.reduce((s, c) => s + (updated[c] || 0), 0);
        setShortlistForPI(sum >= 25);
      }
      return updated;
    });
  };

  const currentCriteria = evaluationType === 'GD' ? GD_CRITERIA : PI_CRITERIA;
  const totalScore = currentCriteria.reduce((sum, crit) => sum + (scores[crit] || 0), 0);

  // Live Automated AI Review Generation
  const liveAutomatedReview = generateAutomatedReview({
    studentName: studentName.trim() || 'Candidate',
    evaluationType,
    role: targetRole,
    scores,
    totalScore,
  });

  const handleGenerateAIFeedback = () => {
    if (!studentName.trim()) {
      showToast('Please specify a candidate name first.', 'error');
      return;
    }
    setAiFeedbackText(liveAutomatedReview.feedbackText);
    showToast('⚡ AI Feedback generated successfully!');
  };

  const handleAppendAIToCustom = () => {
    if (!aiFeedbackText) {
      setAiFeedbackText(liveAutomatedReview.feedbackText);
    }
    const textToAppend = aiFeedbackText || liveAutomatedReview.feedbackText;
    setCustomFeedback((prev) => (prev ? `${prev}\n\n[AI Feedback]: ${textToAppend}` : textToAppend));
    showToast('AI Feedback appended to custom notes.');
  };

  const handleAddQuickTag = (tag: string) => {
    setCustomFeedback((prev) => (prev ? `${prev}; ${tag}` : tag));
  };

  // Add new interviewer inline
  const handleAddNewInterviewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterviewerInput.trim()) return;

    const trimmed = newInterviewerInput.trim();
    if (!interviewersList.includes(trimmed)) {
      const updated = [trimmed, ...interviewersList];
      setInterviewersList(updated);
      setSelectedInterviewer(trimmed);
      syncService.addInterviewer(trimmed);
      showToast(`Added evaluator "${trimmed}"!`);
    } else {
      setSelectedInterviewer(trimmed);
    }
    setNewInterviewerInput('');
    setIsAddingNewInterviewer(false);
  };

  // Switch to PI Round for candidate
  const handleStartPIRoundForCandidate = (cand: Candidate) => {
    setEvaluationType('PI');
    handleCandidateSelect(cand.id);
    setScores({});
    setCustomFeedback('');
    setAiFeedbackText('');
    setJustCompletedGDCandidate(null);
    showToast(`Commencing PI Round for ${cand.name}!`);
  };

  // Submit Evaluation Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !rollNo.trim()) {
      showToast('Please select or enter candidate name and roll number.', 'error');
      return;
    }

    let matchedCand = candidates.find((c) => c.rollNo.toLowerCase() === rollNo.toLowerCase());
    const nextStatus: Candidate['status'] =
      evaluationType === 'GD'
        ? shortlistForPI
          ? 'PI Shortlisted'
          : 'Eliminated'
        : 'Selected';

    if (!matchedCand) {
      matchedCand = {
        id: `cand-${Date.now()}`,
        rollNo: rollNo.trim().toUpperCase(),
        name: studentName.trim(),
        email: `${rollNo.toLowerCase()}@campus.edu`,
        degree,
        targetRole,
        amcatScore: 720,
        status: nextStatus,
      };
      setCandidates((prev) => [matchedCand!, ...prev]);
      await syncService.saveCandidate(matchedCand);
    }

    const review = generateAutomatedReview({
      studentName: studentName.trim(),
      evaluationType,
      role: targetRole,
      scores,
      totalScore,
    });

    const finalAIText = aiFeedbackText.trim() || review.feedbackText;
    const finalCustomText = customFeedback.trim();
    const combinedRemarks = finalCustomText
      ? `${finalCustomText}${finalAIText ? ` | [AI]: ${finalAIText}` : ''}`
      : finalAIText || review.summary;

    const newRecord: EvaluationRecord = {
      id: `eval-${Date.now()}`,
      srNo: evaluations.length + 1,
      candidateId: matchedCand.id,
      studentName: studentName.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      degree,
      targetRole,
      evaluationType,
      scores: { ...scores },
      totalScore,
      maxScore: 50,
      automatedReview: review,
      customFeedback: finalCustomText,
      aiFeedback: finalAIText,
      interviewerRemarks: combinedRemarks,
      interviewerName: selectedInterviewer,
      timestamp: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // 1. Optimistic local update + Broadcast across users
    setEvaluations((prev) => [newRecord, ...prev]);
    await syncService.saveEvaluation(newRecord);

    // 2. Append to real Google Sheets Database if user is logged into Google
    const token = await getAccessToken();
    if (token && spreadsheetId) {
      try {
        await appendEvaluationToGoogleSheet(token, spreadsheetId, newRecord);
      } catch (sheetErr) {
        console.warn('Google Sheet append error:', sheetErr);
      }
    }

    if (evaluationType === 'GD') {
      showToast(`GD Evaluation (${totalScore}/50) recorded & synced!`);
      if (shortlistForPI) {
        setJustCompletedGDCandidate(matchedCand);
      }
    } else {
      showToast(`Personal Interview (${totalScore}/50) recorded & synced!`);
      setJustCompletedGDCandidate(null);
    }

    // Reset fields for next student
    setScores({});
    setCustomFeedback('');
    setAiFeedbackText('');
    setSelectedCandidateId('');
    setStudentName('');
    setRollNo('');
  };

  // AMCAT updates handler
  const handleUpdateCandidateAmcat = (candidateId: string, catScores: Record<string, number>, total: number) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              amcatScores: catScores,
              amcatScore: total,
            }
          : c
      )
    );
    syncService.updateCandidateAmcat(candidateId, catScores, total);
  };

  const roleMeta = ROLES_CONFIG[targetRole] || ROLES_CONFIG['Full Stack Developer'];

  const shortlistedForPICandidates = candidates.filter(
    (c) => c.status === 'PI Shortlisted' || evaluations.some((e) => e.candidateId === c.id && e.evaluationType === 'GD')
  );

  // PAGE ROUTING:
  // 1. Standalone Public Student Notice Board (Strictly Read-Only - Safe for Students!)
  if (pageMode === 'student-board') {
    return (
      <StudentNoticeBoard
        candidates={candidates}
        evaluations={evaluations}
        connectedUsers={connectedUsers}
        onGoToLogin={() => {
          setPageMode('login');
          window.location.hash = '#login';
        }}
      />
    );
  }

  // 2. Standalone Evaluator Login Screen (Protected by Credentials)
  if (!currentAppUser) {
    return (
      <LoginGate
        users={users}
        onLoginWithCredentials={handleLoginWithCredentials}
        onLoginWithGoogle={handleGoogleLogin}
        onGoToStudentBoard={() => {
          setPageMode('student-board');
          window.location.hash = '#student-board';
        }}
        isLoggingIn={isLoggingIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold text-white animate-in slide-in-from-bottom duration-300 ${
            notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Logo & Real-time Live Badge */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-xl shadow-sm">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Mock Placement Drive Evaluator
                </h1>
                {/* Dynamic Real-time sync badge */}
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] rounded-full font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${liveSyncActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                  <span>{liveSyncActive ? `Live Sync Active • ${connectedUsers} Evaluator${connectedUsers > 1 ? 's' : ''} Online` : 'Connecting...'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Google Sheets Database • Multi-User Server • GD ➔ PI Pipeline
              </p>
            </div>
          </div>

          {/* INTERVIEWER DROPDOWN (No Form!) */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs w-full sm:w-auto">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                <UserCheck size={13} />
              </div>

              {!isAddingNewInterviewer ? (
                <div className="flex items-center space-x-1.5 flex-1 sm:flex-none">
                  <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Evaluator:</span>
                  <select
                    value={selectedInterviewer}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsAddingNewInterviewer(true);
                      } else {
                        setSelectedInterviewer(e.target.value);
                      }
                    }}
                    className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer max-w-[200px] truncate"
                  >
                    {interviewersList.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                    <option value="__add_new__" className="text-blue-600 font-semibold">
                      + Add New Evaluator Name...
                    </option>
                  </select>
                </div>
              ) : (
                <form onSubmit={handleAddNewInterviewer} className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={newInterviewerInput}
                    onChange={(e) => setNewInterviewerInput(e.target.value)}
                    placeholder="Enter Evaluator Name..."
                    autoFocus
                    className="px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs font-semibold focus:outline-none w-44"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewInterviewer(false)}
                    className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* INTERVIEWER LOGIN & GOOGLE SHEETS DATABASE BAR */}
        <InterviewerLoginBar
          currentInterviewer={
            currentAppUser
              ? {
                  name: currentAppUser.name,
                  username: currentAppUser.username,
                  role: currentAppUser.role,
                  panel: currentAppUser.panel,
                  email: currentAppUser.email,
                }
              : currentUser
              ? {
                  name: currentUser.displayName || 'Google Evaluator',
                  email: currentUser.email || undefined,
                  photoURL: currentUser.photoURL || undefined,
                }
              : null
          }
          spreadsheetId={spreadsheetId}
          isSyncingSheets={isSyncingSheets}
          onLogout={handleLogout}
          onManualSync={handleManualSyncToGoogleSheets}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onOpenUniversalSheetModal={() => setIsUniversalSheetModalOpen(true)}
          isMasterSheetConnected={!!masterSheetConfig.webhookUrl}
        />

        {/* Global Navigation Tabs */}
        <div className="border-t border-slate-200/80 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-2 sm:space-x-8 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('evaluate')}
              className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'evaluate'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck size={15} />
              <span>Evaluation Flow (GD ➔ PI)</span>
            </button>

            <button
              onClick={() => setActiveTab('sheet')}
              className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'sheet'
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              <span>Google Sheet & Leaderboard ({evaluations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'candidates'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={15} />
              <span>Candidates Pool ({candidates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'border-purple-600 text-purple-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle size={15} className="text-purple-600" />
              <span>GD Topics & Interview Bank</span>
            </button>

            {/* View student board preview */}
            <button
              onClick={() => {
                setPageMode('student-board');
                window.location.hash = '#student-board';
              }}
              className="py-2.5 border-b-2 border-transparent text-blue-600 hover:text-blue-800 flex items-center space-x-1.5 transition-colors whitespace-nowrap ml-auto"
              title="Preview the read-only notice board students see"
            >
              <ExternalLink size={13} />
              <span>Student Notice Board ↗</span>
            </button>

            {/* Quick credentials access tab button */}
            <button
              onClick={() => setIsUserManagementOpen(true)}
              className="py-2.5 border-b-2 border-transparent text-slate-600 hover:text-blue-700 flex items-center space-x-1.5 transition-colors whitespace-nowrap"
            >
              <Key size={14} className="text-amber-500" />
              <span>Manage 6 Logins Table</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8">
        {/* VIEW 1: EVALUATION FLOW STUDIO */}
        {activeTab === 'evaluate' && (
          <div className="space-y-6">
            {/* Step 1 ➔ Step 2 Flow Stepper */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => {
                    setEvaluationType('GD');
                    setScores({});
                  }}
                  className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                    evaluationType === 'GD'
                      ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                      : 'bg-purple-50/60 hover:bg-purple-100/70 text-purple-900 border-purple-200'
                  }`}
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-[11px]">
                    1
                  </span>
                  <div>
                    <div className="leading-tight">Step 1: Group Discussion (GD)</div>
                    <div className={`text-[10px] font-normal ${evaluationType === 'GD' ? 'text-purple-200' : 'text-purple-600'}`}>
                      20 Mins • 50 Marks (Initial Round)
                    </div>
                  </div>
                </button>

                <ArrowRight size={18} className="text-slate-400 shrink-0 hidden sm:inline" />

                <button
                  onClick={() => {
                    setEvaluationType('PI');
                    setScores({});
                  }}
                  className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                    evaluationType === 'PI'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-blue-50/60 hover:bg-blue-100/70 text-blue-900 border-blue-200'
                  }`}
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-[11px]">
                    2
                  </span>
                  <div>
                    <div className="leading-tight">Step 2: Personal Interview (PI)</div>
                    <div className={`text-[10px] font-normal ${evaluationType === 'PI' ? 'text-blue-200' : 'text-blue-600'}`}>
                      20 Mins • 50 Marks (Shortlisted Only)
                    </div>
                  </div>
                </button>
              </div>

              {/* AMCAT Quick Action */}
              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={() => {
                    setAmcatTargetCandidate(activeCandidate || null);
                    setIsAmcatModalOpen(true);
                  }}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
                >
                  <SlidersHorizontal size={13} className="text-amber-700" />
                  <span>Configure AMCAT Categories ({amcatCategories.length})</span>
                </button>
              </div>
            </div>

            {/* Candidate Shortlist Alert */}
            {justCompletedGDCandidate && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in duration-300">
                <div className="flex items-center space-x-3 text-xs text-purple-900">
                  <div className="p-2 bg-purple-600 text-white rounded-xl">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <span className="font-bold">{justCompletedGDCandidate.name}</span> qualified the GD round!
                    <div className="text-[11px] text-purple-700 mt-0.5">
                      Ready for Step 2: Personal Interview (PI - 50 Marks).
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleStartPIRoundForCandidate(justCompletedGDCandidate)}
                    className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1"
                  >
                    <span>Proceed to PI for this Candidate →</span>
                  </button>
                  <button
                    onClick={() => setJustCompletedGDCandidate(null)}
                    className="px-2.5 py-1.5 text-xs text-purple-700 hover:bg-purple-100 rounded-lg"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Evaluation Form & Real-Time Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 Cols: Form with Scoring & Dual Feedback */}
              <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-7 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <span>{evaluationType === 'GD' ? 'Round 1: Group Discussion' : 'Round 2: Personal Interview'}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          evaluationType === 'GD'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        50 Marks Matrix
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {evaluationType === 'GD'
                        ? 'Evaluate student participation, arguments, and shortlist for personal interviews'
                        : 'Conduct one-on-one technical & behavioral appraisal for qualified students'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Live Round Countdown Timer */}
                    <EvaluationTimer evaluationType={evaluationType} defaultMinutes={20} />

                    {evaluationType === 'GD' ? (
                      <button
                        type="button"
                        onClick={() => setIsGDModalOpen(true)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
                      >
                        <Users size={13} />
                        <span>Recommend GD Topics</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsPIModalOpen(true)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
                      >
                        <MessageSquare size={13} />
                        <span>Recommend PI Questions</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Candidate Selection Section */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Candidate for {evaluationType === 'GD' ? 'GD Round' : 'PI Round'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCandidateModalOpen(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                    >
                      <PlusCircle size={13} />
                      <span>Add / Upload Candidate Excel</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {evaluationType === 'PI' ? 'Pick from Shortlisted Candidates' : 'Pick from Pool'}
                      </label>
                      <select
                        value={selectedCandidateId}
                        onChange={(e) => handleCandidateSelect(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 font-medium"
                      >
                        <option value="">
                          {(evaluationType === 'PI' ? shortlistedForPICandidates : candidates).length === 0
                            ? '-- No candidates in database yet (Enter details below or upload Excel) --'
                            : '-- Choose Candidate or type manually --'}
                        </option>
                        {(evaluationType === 'PI' ? shortlistedForPICandidates : candidates).map((c) => {
                          const gd = evaluations.find((e) => e.candidateId === c.id && e.evaluationType === 'GD');
                          return (
                            <option key={c.id} value={c.id}>
                              {c.rollNo} - {c.name} ({c.targetRole}) {gd ? `[GD: ${gd.totalScore}/50]` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Student Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Candidate Name"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Roll Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="e.g. 21BTECH042"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs uppercase focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Target Role & Degree */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Target Job Role
                      </label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value as TargetRole)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Full Stack Developer">Full Stack Developer (Nexora - 7 LPA)</option>
                        <option value="Data Analyst">Data Analyst (InsightEdge - 5 LPA)</option>
                        <option value="Tech Sales">Tech Sales (CloudVantage - 8+3 LPA)</option>
                        <option value="General">General Campus Mock Drive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Degree Program
                      </label>
                      <select
                        value={degree}
                        onChange={(e) => setDegree(e.target.value as Degree)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="B.Tech">B.Tech (CS / IT / ECE)</option>
                        <option value="MCA">MCA (Master of Comp App)</option>
                        <option value="BCA">BCA (Bachelor of Comp App)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Category-wise AMCAT breakdown badge */}
                  {activeCandidate && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Trophy size={14} className="text-amber-700" />
                          <span className="font-bold text-amber-900">
                            AMCAT Score: {activeCandidate.amcatScore} pts
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-amber-800 mt-1">
                          {amcatCategories.map((cat) => (
                            <span key={cat.id} className="bg-white/80 px-1.5 py-0.5 rounded border border-amber-200/60">
                              {cat.name.split(' ')[0]}: <strong>{activeCandidate.amcatScores?.[cat.id] ?? '-'}</strong>/{cat.maxScore}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAmcatTargetCandidate(activeCandidate);
                          setIsAmcatModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        Edit AMCAT Marks ✎
                      </button>
                    </div>
                  )}

                  {/* PI round: display previous GD evaluation status */}
                  {evaluationType === 'PI' && activeCandidateGDEval && (
                    <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900">
                      <div>
                        <span className="font-bold">Step 1 GD Result:</span> Scored{' '}
                        <strong className="text-purple-700 font-mono">{activeCandidateGDEval.totalScore}/50</strong> by{' '}
                        {activeCandidateGDEval.interviewerName}
                        <div className="text-[11px] text-purple-700 mt-0.5 italic">
                          "{activeCandidateGDEval.interviewerRemarks}"
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded font-semibold text-[10px]">
                        GD Qualified
                      </span>
                    </div>
                  )}
                </div>

                {/* Scoring Matrix (50 Marks) */}
                <div className="space-y-4 pt-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {evaluationType === 'GD' ? 'Group Discussion Scoring Rubric' : 'Personal Interview Scoring Rubric'}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Assign 0 to 10 marks per criterion. Total out of 50.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-medium">Round Score:</span>
                      <span
                        className={`text-base font-black px-3 py-1 rounded-xl border ${
                          totalScore >= 40
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : totalScore >= 30
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : totalScore >= 25
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                        }`}
                      >
                        {totalScore} <span className="text-xs font-normal">/ 50</span>
                      </span>
                    </div>
                  </div>

                  {/* 5 Criteria */}
                  <div className="space-y-3">
                    {currentCriteria.map((criterion) => {
                      const currentVal = scores[criterion] !== undefined ? scores[criterion] : 0;
                      return (
                        <div
                          key={criterion}
                          className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors space-y-2"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-800">{criterion}</span>
                            <span className="font-mono font-bold text-sm text-blue-700 w-8 text-right">
                              {currentVal}/10
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleScoreChange(criterion, num)}
                                className={`flex-1 min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-all ${
                                  currentVal === num
                                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                                    : currentVal > num
                                    ? 'bg-blue-100/70 text-blue-800 hover:bg-blue-200'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* If GD Round: Shortlist for PI option */}
                {evaluationType === 'GD' && (
                  <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-950 flex items-center space-x-1.5">
                        <CheckSquare size={16} className="text-purple-700" />
                        <span>Shortlist Candidate for Stage 2 (Personal Interview)?</span>
                      </div>
                      <div className="text-[11px] text-purple-700 mt-0.5">
                        Passing benchmark is typically 25/50 marks. Shortlisted candidates will show in Step 2.
                      </div>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shortlistForPI}
                        onChange={(e) => setShortlistForPI(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-purple-900">Shortlist</span>
                    </label>
                  </div>
                )}

                {/* DUAL FEEDBACK SECTION: CUSTOMIZED FEEDBACK + AI FEEDBACK */}
                <div className="pt-2 border-t border-slate-200/80 space-y-4">
                  {evaluationType === 'GD' && activeGDTopicTitle && (
                    <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900">
                      <div className="flex items-center space-x-2">
                        <Users size={14} className="text-purple-600" />
                        <span><strong>Current GD Discussion Topic:</strong> "{activeGDTopicTitle}"</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveGDTopicTitle('')}
                        className="text-[11px] text-purple-600 hover:text-purple-800 underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <PenTool size={14} className="text-blue-600" />
                      <span>Dual Feedback Controls (Customized & AI)</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Recorded across both columns</span>
                  </div>

                  {/* 1. Custom Feedback Area */}
                  <div className="space-y-2 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-blue-950">
                        1. Interviewer Customized Notes / Feedback:
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomFeedback('')}
                        className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                      >
                        <RotateCcw size={10} />
                        <span>Clear</span>
                      </button>
                    </div>

                    <textarea
                      value={customFeedback}
                      onChange={(e) => setCustomFeedback(e.target.value)}
                      rows={3}
                      placeholder="Write your customized feedback, specific question responses, strengths, or select tags below..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                    />

                    {/* Quick feedback tags */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                        Quick Tag Inserts:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_FEEDBACK_TAGS.map((tag, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddQuickTag(tag)}
                            className="px-2 py-0.5 bg-white hover:bg-blue-100 text-slate-700 hover:text-blue-800 text-[10px] rounded-md border border-slate-200 transition-colors flex items-center space-x-1"
                          >
                            <Tag size={9} className="text-blue-500" />
                            <span>{tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. AI Feedback Area */}
                  <div className="space-y-2 bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <label className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                        <Sparkles size={14} className="text-amber-600" />
                        <span>2. AI Automated Feedback:</span>
                      </label>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleGenerateAIFeedback}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center space-x-1 transition-colors"
                        >
                          <Sparkles size={12} />
                          <span>Generate AI Review</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAppendAIToCustom}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-300"
                          title="Append to custom feedback"
                        >
                          Append to Custom
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={aiFeedbackText || liveAutomatedReview.feedbackText}
                      onChange={(e) => setAiFeedbackText(e.target.value)}
                      rows={3}
                      placeholder="AI generated comprehensive feedback will appear here..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 text-slate-700 italic"
                    />
                  </div>
                </div>

                {/* Submit to Sheet */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-xs text-slate-500">
                    Evaluator: <strong>{selectedInterviewer}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    className="w-full sm:w-auto px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save {evaluationType} Evaluation to Database</span>
                  </button>
                </div>
              </div>

              {/* Right 4 Cols: Real-Time Preview & Role Specs */}
              <div className="lg:col-span-4 space-y-6">
                {/* Live Automated Review Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles size={18} className="text-amber-500" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Live Review Preview
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        liveAutomatedReview.verdict === 'Strong Shortlist'
                          ? 'bg-emerald-100 text-emerald-800'
                          : liveAutomatedReview.verdict === 'Recommended'
                          ? 'bg-blue-100 text-blue-800'
                          : liveAutomatedReview.verdict === 'Borderline'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {liveAutomatedReview.verdict}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-slate-800 font-medium text-xs leading-relaxed">
                        {liveAutomatedReview.summary}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center space-x-1">
                        <CheckCircle size={12} className="text-emerald-600" />
                        <span>Key Strengths:</span>
                      </div>
                      <ul className="text-[11px] text-slate-700 space-y-1 pl-1">
                        {liveAutomatedReview.strengths.slice(0, 2).map((s, i) => (
                          <li key={i} className="flex items-start space-x-1">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-amber-800 uppercase flex items-center space-x-1">
                        <AlertCircle size={12} className="text-amber-600" />
                        <span>Development Target:</span>
                      </div>
                      <ul className="text-[11px] text-slate-700 space-y-1 pl-1">
                        {liveAutomatedReview.growthAreas.slice(0, 2).map((g, i) => (
                          <li key={i} className="flex items-start space-x-1">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Role Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Building2 size={18} className="text-blue-600" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {targetRole}
                      </h3>
                      <div className="text-[11px] text-slate-500">{roleMeta.company}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Salary Package:</span>
                      <span className="font-bold text-emerald-700">{roleMeta.package}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium text-slate-800">{roleMeta.location}</span>
                    </div>
                    <div className="pt-1">
                      <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Required Core Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {roleMeta.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-medium border border-blue-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: GOOGLE SHEETS & LEADERBOARD VIEW */}
        {activeTab === 'sheet' && (
          <SpreadsheetView
            evaluations={evaluations}
            candidates={candidates}
            onDeleteRecord={async (id) => {
              setEvaluations((prev) => prev.filter((e) => e.id !== id));
              await syncService.deleteEvaluation(id);
              showToast('Record deleted & synced.');
            }}
            onViewReview={(record) => setReviewModalRecord(record)}
            onEditAmcat={(cand) => {
              setAmcatTargetCandidate(cand);
              setIsAmcatModalOpen(true);
            }}
            spreadsheetId={spreadsheetId}
            onManualSync={handleManualSyncToGoogleSheets}
            isSyncingSheets={isSyncingSheets}
            onOpenUniversalSheetModal={() => setIsUniversalSheetModalOpen(true)}
            isMasterSheetConnected={!!masterSheetConfig.webhookUrl}
          />
        )}

        {/* VIEW 3: CANDIDATE POOL MANAGEMENT */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Placement Drive Candidates Pool</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time synchronized candidate registry across all evaluators and panels
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAmcatModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <SlidersHorizontal size={14} className="text-amber-700" />
                  <span>Configure AMCAT Categories</span>
                </button>
                <button
                  onClick={() => downloadSampleCandidateExcel()}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Download size={14} />
                  <span>Download Blank Template</span>
                </button>
                <button
                  onClick={() => setIsCandidateModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <FileUp size={14} />
                  <span>Upload / Add Candidate</span>
                </button>
              </div>
            </div>

            {/* Candidates Grid Cards or Empty Database Slate */}
            {candidates.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Placement Database is Clean (0 Demo Candidates)</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Upload your campus student Excel sheet (.xlsx / .csv) or add candidates manually. Any candidate added will immediately sync across all evaluators.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsCandidateModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5"
                  >
                    <FileUp size={14} />
                    <span>Upload Student Excel</span>
                  </button>
                  <button
                    onClick={() => downloadSampleCandidateExcel()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Download size={14} />
                    <span>Download Blank Template</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidates.map((cand) => {
                  const candGDEval = evaluations.find(
                    (e) => (e.candidateId === cand.id || e.rollNo === cand.rollNo) && e.evaluationType === 'GD'
                  );
                  const candPIEval = evaluations.find(
                    (e) => (e.candidateId === cand.id || e.rollNo === cand.rollNo) && e.evaluationType === 'PI'
                  );

                  return (
                    <div
                      key={cand.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:border-blue-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs text-slate-500 font-semibold">
                              {cand.rollNo}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 mt-0.5">{cand.name}</h3>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cand.status === 'PI Shortlisted'
                                ? 'bg-purple-100 text-purple-700'
                                : cand.status === 'Selected'
                                ? 'bg-emerald-100 text-emerald-700'
                                : cand.status === 'Eliminated'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {cand.status}
                          </span>
                        </div>

                        <div className="mt-3 text-xs text-slate-600 space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Target Role:</span>
                            <span className="font-medium text-slate-800">{cand.targetRole} ({cand.degree})</span>
                          </div>

                          {/* Interactive AMCAT score row */}
                          <div className="flex justify-between items-center bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                            <span className="text-amber-900 font-semibold flex items-center space-x-1">
                              <Trophy size={13} className="text-amber-600" />
                              <span>AMCAT Score:</span>
                            </span>
                            <button
                              onClick={() => {
                                setAmcatTargetCandidate(cand);
                                setIsAmcatModalOpen(true);
                              }}
                              className="font-bold text-amber-900 hover:text-amber-700 flex items-center space-x-1 font-mono text-xs underline"
                              title="Click to edit category-wise AMCAT marks"
                            >
                              <span>{cand.amcatScore} pts</span>
                              <span className="text-[10px]">✎</span>
                            </button>
                          </div>
                        </div>

                        {/* Drive round scores */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center space-x-2 text-[11px]">
                          <span className="text-slate-400">Drive Scores:</span>
                          {candGDEval ? (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                              GD: {candGDEval.totalScore}/50
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">GD: Pending</span>
                          )}

                          {candPIEval ? (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                              PI: {candPIEval.totalScore}/50
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">PI: Pending</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center space-x-2">
                        {!candGDEval ? (
                          <button
                            onClick={() => {
                              setEvaluationType('GD');
                              handleCandidateSelect(cand.id);
                              setActiveTab('evaluate');
                            }}
                            className="flex-1 py-1.5 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 rounded-xl text-xs font-semibold transition-colors text-center"
                          >
                            Evaluate GD
                          </button>
                        ) : !candPIEval ? (
                          <button
                            onClick={() => {
                              setEvaluationType('PI');
                              handleCandidateSelect(cand.id);
                              setActiveTab('evaluate');
                            }}
                            className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl text-xs font-semibold transition-colors text-center"
                          >
                            Evaluate PI
                          </button>
                        ) : (
                          <span className="flex-1 text-center py-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 rounded-xl">
                            Drive Completed (100M)
                          </span>
                        )}

                        {/* View / Print Official Dossier Scorecard */}
                        {(candGDEval || candPIEval) && (
                          <button
                            onClick={() => setDossierCandidate(cand)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors shrink-0"
                            title="Print Official Scorecard / Dossier"
                          >
                            <FileText size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: GD TOPICS & INTERVIEW QUESTIONS BANK */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Interviewer Cheatsheets & Resource Library
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  PDF-aligned GD topics with pros/cons and role-based technical questions
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsGDModalOpen(true)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  <Users size={14} />
                  <span>Explore GD Topics (20 Mins)</span>
                </button>
                <button
                  onClick={() => setIsPIModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  <MessageSquare size={14} />
                  <span>Explore PI Question Bank</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => setIsGDModalOpen(true)}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl p-6 cursor-pointer hover:shadow-md transition-all space-y-3"
              >
                <div className="p-3 bg-purple-700 text-white rounded-xl w-fit">
                  <Users size={24} />
                </div>
                <h3 className="text-base font-bold text-purple-950">Group Discussion (GD) Topics Bank</h3>
                <p className="text-xs text-purple-900/80 leading-relaxed">
                  Contains balanced topics across Tech & AI, Enterprise SaaS, Hybrid Work, and Career Standards.
                  Includes key supportive points, counter-arguments, and a 50-mark evaluation guide.
                </p>
                <div className="text-xs font-bold text-purple-700 flex items-center space-x-1">
                  <span>Browse All GD Topics →</span>
                </div>
              </div>

              <div
                onClick={() => setIsPIModalOpen(true)}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/80 rounded-2xl p-6 cursor-pointer hover:shadow-md transition-all space-y-3"
              >
                <div className="p-3 bg-blue-600 text-white rounded-xl w-fit">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-base font-bold text-blue-950">
                  Personal Interview (PI) Question Bank
                </h3>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  Tailored technical, behavioral, and domain questions for Full Stack Developers, Data
                  Analysts, and Tech Sales executives, complete with ideal answer cues and follow-up probes.
                </p>
                <div className="text-xs font-bold text-blue-700 flex items-center space-x-1">
                  <span>Browse Question Bank →</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        users={users}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
        onResetUsers={handleResetUsers}
      />

      <CandidateDossierModal
        isOpen={!!dossierCandidate}
        onClose={() => setDossierCandidate(null)}
        candidate={dossierCandidate}
        evaluations={evaluations}
      />

      <CandidateManagerModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        candidates={candidates}
        onAddCandidate={async (cand) => {
          setCandidates((prev) => [cand, ...prev]);
          await syncService.saveCandidate(cand);
          showToast(`Candidate ${cand.name} added and synced!`);
        }}
        onBulkAddCandidates={async (newCands) => {
          setCandidates((prev) => [...newCands, ...prev]);
          await syncService.bulkAddCandidates(newCands);
          showToast(`Imported ${newCands.length} candidates from Excel!`);
        }}
        onDeleteCandidate={async (id) => {
          setCandidates((prev) => prev.filter((c) => c.id !== id));
          await syncService.deleteCandidate(id);
          showToast('Candidate removed & synced.');
        }}
        onResetCandidates={async () => {
          setCandidates([]);
          await syncService.resetCandidates();
          showToast('Candidate pool cleared.');
        }}
        onSelectCandidateForEval={(cand) => {
          handleCandidateSelect(cand.id);
          setActiveTab('evaluate');
        }}
      />

      <AmcatCategoryModal
        isOpen={isAmcatModalOpen}
        onClose={() => {
          setIsAmcatModalOpen(false);
          setAmcatTargetCandidate(null);
        }}
        categories={amcatCategories}
        onUpdateCategories={async (updatedCats) => {
          setAmcatCategories(updatedCats);
          await syncService.updateAmcatCategories(updatedCats);
          showToast('AMCAT categories updated & synced.');
        }}
        selectedCandidate={amcatTargetCandidate}
        candidatesList={candidates}
        onUpdateCandidateScores={handleUpdateCandidateAmcat}
      />

      <GDRecommenderModal
        isOpen={isGDModalOpen}
        onClose={() => setIsGDModalOpen(false)}
        onSelectTopic={(topic) => {
          setActiveGDTopicTitle(topic.title);
          setCustomFeedback(
            (prev) => (prev ? `${prev}\n\n` : '') + `[GD Topic: ${topic.title}]`
          );
          showToast(`GD Topic "${topic.title.slice(0, 30)}..." selected!`);
        }}
      />

      <PIQuestionsModal
        isOpen={isPIModalOpen}
        onClose={() => setIsPIModalOpen(false)}
        targetRole={targetRole}
        onSelectQuestion={(qText) => {
          setCustomFeedback(
            (prev) => (prev ? `${prev}\n\n` : '') + `[Asked Question: ${qText}]`
          );
          showToast('Question inserted into custom feedback notes!');
        }}
      />

      <AutomatedReviewModal
        isOpen={!!reviewModalRecord}
        record={reviewModalRecord}
        onClose={() => setReviewModalRecord(null)}
        onApplyToRemarks={(text) => {
          setCustomFeedback(text);
          showToast('Review inserted into remarks!');
        }}
      />

      <GoogleSheetSyncModal
        isOpen={isSheetSyncModalOpen}
        onClose={() => setIsSheetSyncModalOpen(false)}
        evaluations={evaluations}
        candidates={candidates}
        onSignInGoogle={handleGoogleLogin}
        isGoogleConnected={!!currentUser}
      />

      <UniversalSheetModal
        isOpen={isUniversalSheetModalOpen}
        onClose={() => setIsUniversalSheetModalOpen(false)}
        masterSheetConfig={masterSheetConfig}
        onSaveMasterSheetConfig={handleSaveMasterSheetConfig}
        onForceSyncAll={handleForceSyncAllToMasterSheet}
        evaluationsCount={evaluations.length}
        candidatesCount={candidates.length}
      />
    </div>
  );
}
