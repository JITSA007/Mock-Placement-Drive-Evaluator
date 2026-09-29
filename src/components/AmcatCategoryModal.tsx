import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Trash2,
  Save,
  X,
  CheckCircle,
  Sliders,
  User,
  Settings,
} from 'lucide-react';
import { AmcatCategory, Candidate } from '../types';

interface AmcatCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: AmcatCategory[];
  onUpdateCategories: (categories: AmcatCategory[]) => void;
  selectedCandidate?: Candidate | null;
  onUpdateCandidateScores?: (candidateId: string, scores: Record<string, number>, total: number) => void;
  candidatesList?: Candidate[];
}

export const AmcatCategoryModal: React.FC<AmcatCategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
  selectedCandidate,
  onUpdateCandidateScores,
  candidatesList = [],
}) => {
  const [activeTab, setActiveTab] = useState<'scores' | 'categories'>('scores');

  // Candidate selection for score editing
  const [activeCandidateId, setActiveCandidateId] = useState<string>(
    selectedCandidate?.id || (candidatesList[0]?.id || '')
  );

  const activeCandidate = candidatesList.find((c) => c.id === activeCandidateId) || selectedCandidate;

  // Local state for candidate category scores
  const [candidateScores, setCandidateScores] = useState<Record<string, number>>(() => {
    return activeCandidate?.amcatScores || {};
  });

  // State for categories management
  const [categoryList, setCategoryList] = useState<AmcatCategory[]>(categories);
  const [newCatName, setNewCatName] = useState('');
  const [newCatMax, setNewCatMax] = useState<number>(100);
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  // Handle score change for a specific category
  const handleScoreChange = (catId: string, value: string, max: number) => {
    const num = parseInt(value, 10);
    const score = isNaN(num) ? 0 : Math.max(0, Math.min(max, num));
    setCandidateScores((prev) => ({
      ...prev,
      [catId]: score,
    }));
  };

  // Compute live total AMCAT score
  const computedTotal = categoryList.reduce((sum, cat) => sum + (candidateScores[cat.id] || 0), 0);
  const maxPossibleTotal = categoryList.reduce((sum, cat) => sum + cat.maxScore, 0);

  // Switch candidate
  const handleSwitchCandidate = (candId: string) => {
    setActiveCandidateId(candId);
    const cand = candidatesList.find((c) => c.id === candId);
    if (cand) {
      setCandidateScores(cand.amcatScores || {});
    }
  };

  // Save Candidate Scores
  const handleSaveCandidateScores = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;

    if (onUpdateCandidateScores) {
      onUpdateCandidateScores(activeCandidate.id, candidateScores, computedTotal);
      setToastMsg(`AMCAT score updated (${computedTotal}/${maxPossibleTotal}) for ${activeCandidate.name}!`);
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  // Category Management Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: AmcatCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      maxScore: newCatMax > 0 ? newCatMax : 100,
    };

    const updated = [...categoryList, newCat];
    setCategoryList(updated);
    onUpdateCategories(updated);
    setNewCatName('');
    setNewCatMax(100);
    setToastMsg(`Category "${newCat.name}" added successfully.`);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleDeleteCategory = (catId: string) => {
    if (categoryList.length <= 1) {
      alert('You must have at least one AMCAT category.');
      return;
    }
    const updated = categoryList.filter((c) => c.id !== catId);
    setCategoryList(updated);
    onUpdateCategories(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-xl">
              <Trophy size={22} className="text-amber-100" />
            </div>
            <div>
              <h2 className="text-base font-bold">Category-wise AMCAT Scoring</h2>
              <p className="text-xs text-amber-100 mt-0.5">
                Define evaluation sections and enter category marks for leaderboard ranking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('scores')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'scores'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={15} />
            <span>Enter Candidate Scores</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'categories'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings size={15} />
            <span>Define / Customize Categories ({categoryList.length})</span>
          </button>
        </div>

        {/* Toast confirmation */}
        {toastMsg && (
          <div className="mx-6 mt-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle size={15} className="text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: ENTER CANDIDATE SCORES */}
          {activeTab === 'scores' && (
            <form onSubmit={handleSaveCandidateScores} className="space-y-5">
              {/* Select candidate */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Candidate
                </label>
                <select
                  value={activeCandidate?.id || ''}
                  onChange={(e) => handleSwitchCandidate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium"
                >
                  {candidatesList.map((cand) => (
                    <option key={cand.id} value={cand.id}>
                      {cand.rollNo} - {cand.name} ({cand.targetRole})
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Summary Badge */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="text-[11px] font-bold text-amber-900 uppercase">
                    Total AMCAT Score
                  </div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    Accumulated across {categoryList.length} defined sections
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-900">{computedTotal}</span>
                  <span className="text-xs text-amber-700 font-semibold"> / {maxPossibleTotal}</span>
                </div>
              </div>

              {/* Category-wise inputs */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Category Breakdown Marks:
                </div>
                {categoryList.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-900">{cat.name}</div>
                      <div className="text-[10px] text-gray-500">Max marks: {cat.maxScore}</div>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        max={cat.maxScore}
                        value={candidateScores[cat.id] !== undefined ? candidateScores[cat.id] : ''}
                        onChange={(e) => handleScoreChange(cat.id, e.target.value, cat.maxScore)}
                        placeholder="0"
                        className="w-full text-center px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1"
                >
                  <Sliders size={13} />
                  <span>Customize Categories</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center space-x-1.5"
                >
                  <Save size={15} />
                  <span>Save AMCAT Scores</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DEFINE / CUSTOMIZE CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              {/* Existing Categories List */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Configured AMCAT Sections ({categoryList.length})
                </div>

                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {categoryList.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 bg-white flex items-center justify-between text-xs hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{cat.name}</div>
                        <div className="text-[10px] text-gray-500">Max Score: {cat.maxScore} Marks</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleAddCategory} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-gray-800 flex items-center space-x-1">
                  <Plus size={14} className="text-amber-600" />
                  <span>Define New AMCAT Category</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Automata Coding / CS Fundamentals"
                      required
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Max Marks
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={newCatMax}
                      onChange={(e) => setNewCatMax(parseInt(e.target.value, 10))}
                      required
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1 transition-colors"
                  >
                    <Plus size={13} />
                    <span>Add Category</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
