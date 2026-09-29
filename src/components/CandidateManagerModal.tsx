import React, { useState, useRef } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Candidate, Degree, TargetRole } from '../types';
import { downloadSampleCandidateExcel, parseCandidatesExcelFile } from '../utils/excelUtils';

interface CandidateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  onAddCandidate: (candidate: Candidate) => void;
  onBulkAddCandidates: (candidates: Candidate[]) => void;
  onDeleteCandidate: (id: string) => void;
  onResetCandidates: () => void;
  onSelectCandidateForEval?: (candidate: Candidate) => void;
}

export const CandidateManagerModal: React.FC<CandidateManagerModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onAddCandidate,
  onBulkAddCandidates,
  onDeleteCandidate,
  onResetCandidates,
  onSelectCandidateForEval,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'upload'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Manual Add Form State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [degree, setDegree] = useState<Degree>('B.Tech');
  const [targetRole, setTargetRole] = useState<TargetRole>('Full Stack Developer');
  const [amcatScore, setAmcatScore] = useState<number>(750);
  const [formSuccess, setFormSuccess] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState<Candidate[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || c.targetRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNo.trim()) return;

    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      rollNo: rollNo.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim() || `${rollNo.toLowerCase()}@campus.edu`,
      phone: phone.trim() || undefined,
      degree,
      targetRole,
      amcatScore: amcatScore || 700,
      status: 'Pending',
    };

    onAddCandidate(newCandidate);
    setFormSuccess(`Candidate "${name}" successfully registered!`);
    setName('');
    setRollNo('');
    setEmail('');
    setPhone('');
    setTimeout(() => {
      setFormSuccess('');
      setActiveTab('list');
    }, 1200);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const parsed = await parseCandidatesExcelFile(file);
      if (parsed.length === 0) {
        setUploadError('No valid candidate rows found in spreadsheet.');
      } else {
        setUploadedPreview(parsed);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error parsing file.');
    } finally {
      setIsUploading(false);
    }
  };

  const confirmUpload = () => {
    if (uploadedPreview.length > 0) {
      onBulkAddCandidates(uploadedPreview);
      setUploadedPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActiveTab('list');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Users size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Candidate Pool & Excel Management</h2>
              <p className="text-xs text-slate-300">
                {candidates.length} students enrolled across B.Tech, MCA & BCA placement drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={16} />
            <span>Candidate List ({candidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'add'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus size={16} />
            <span>Add Single Candidate</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload size={16} />
            <span>Upload Excel / CSV</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, roll no, or email..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="Full Stack Developer">Full Stack</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Tech Sales">Tech Sales</option>
                  </select>
                  <button
                    onClick={onResetCandidates}
                    title="Reload Initial Mock Pool"
                    className="px-3 py-2 text-xs border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 flex items-center space-x-1"
                  >
                    <RefreshCw size={13} />
                    <span>Reset Pool</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-[350px] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Roll No</th>
                      <th className="py-2.5 px-3 font-semibold">Student Name</th>
                      <th className="py-2.5 px-3 font-semibold">Degree</th>
                      <th className="py-2.5 px-3 font-semibold">Target Role</th>
                      <th className="py-2.5 px-3 font-semibold">AMCAT</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No candidates found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c) => (
                        <tr key={c.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-gray-700">
                            {c.rollNo}
                          </td>
                          <td className="py-2 px-3 font-medium text-gray-900">
                            {c.name}
                            <div className="text-[10px] text-gray-400">{c.email}</div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-medium text-[11px]">
                              {c.degree}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                c.targetRole === 'Full Stack Developer'
                                  ? 'bg-blue-100 text-blue-700'
                                  : c.targetRole === 'Data Analyst'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : c.targetRole === 'Tech Sales'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {c.targetRole}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-gray-700">{c.amcatScore}</td>
                          <td className="py-2 px-3 text-right space-x-1">
                            {onSelectCandidateForEval && (
                              <button
                                onClick={() => {
                                  onSelectCandidateForEval(c);
                                  onClose();
                                }}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-medium shadow-sm transition-colors"
                              >
                                Select for Eval
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteCandidate(c.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                              title="Delete candidate"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL ADD */}
          {activeTab === 'add' && (
            <form onSubmit={handleManualSubmit} className="space-y-4 max-w-xl mx-auto py-2">
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle2 size={16} />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Gupta"
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Roll Number / Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 21BTECH099"
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Degree / Stream
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value as Degree)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white"
                  >
                    <option value="B.Tech">B.Tech (Computer Science / IT / ECE)</option>
                    <option value="MCA">MCA (Master of Computer Applications)</option>
                    <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Role (PDF Jobs)
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as TargetRole)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white"
                  >
                    <option value="Full Stack Developer">Full Stack Developer (Nexora - 7 LPA)</option>
                    <option value="Data Analyst">Data Analyst (InsightEdge - 5 LPA)</option>
                    <option value="Tech Sales">Tech Sales (CloudVantage - 8+3 LPA)</option>
                    <option value="General">General Mock Placement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    AMCAT Score (Leaderboard)
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="900"
                    value={amcatScore}
                    onChange={(e) => setAmcatScore(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow transition-colors flex items-center space-x-1.5"
                >
                  <UserPlus size={15} />
                  <span>Save Candidate</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EXCEL UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Template Download Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Download Standard Excel Template</h4>
                    <p className="text-[11px] text-emerald-800">
                      Pre-formatted .xlsx with columns: Roll Number, Full Name, Degree, Target Role, AMCAT Score.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => downloadSampleCandidateExcel()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors whitespace-nowrap"
                >
                  <Download size={14} />
                  <span>Download Sample (.xlsx)</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-blue-50/20 transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="excel-file-input"
                />
                <label
                  htmlFor="excel-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                    <Upload size={28} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {isUploading ? 'Parsing Spreadsheet...' : 'Click to browse or drop candidate Excel (.xlsx / .csv)'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Automatic column detection for student name, roll number, role & degree.
                  </span>
                </label>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload Preview */}
              {uploadedPreview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-800">
                      Preview Parsed Candidates ({uploadedPreview.length} found)
                    </h4>
                    <button
                      onClick={confirmUpload}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm flex items-center space-x-1"
                    >
                      <CheckCircle2 size={14} />
                      <span>Confirm & Add to Pool</span>
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="p-2">Roll No</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Degree</th>
                          <th className="p-2">Target Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {uploadedPreview.slice(0, 10).map((cand, i) => (
                          <tr key={i}>
                            <td className="p-2 font-mono">{cand.rollNo}</td>
                            <td className="p-2 font-medium">{cand.name}</td>
                            <td className="p-2">{cand.degree}</td>
                            <td className="p-2">{cand.targetRole}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {uploadedPreview.length > 10 && (
                    <p className="text-[11px] text-gray-500 italic">
                      ...and {uploadedPreview.length - 10} more candidates ready to import.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
