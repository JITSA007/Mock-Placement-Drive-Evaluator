import React, { useState } from 'react';
import { UserCheck, Phone, ShieldCheck, X } from 'lucide-react';
import { InterviewerProfile } from '../types';

interface InterviewerModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave: (profile: InterviewerProfile) => void;
  currentProfile?: InterviewerProfile | null;
  mandatory?: boolean;
}

export const InterviewerModal: React.FC<InterviewerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProfile,
  mandatory = false,
}) => {
  const [name, setName] = useState(currentProfile?.name || '');
  const [phone, setPhone] = useState(currentProfile?.phone || '');
  const [panel, setPanel] = useState(currentProfile?.panel || 'Panel 1 - Technical & GD');
  const [companyOrCollege, setCompanyOrCollege] = useState(
    currentProfile?.companyOrCollege || 'Nexora / InsightEdge Placement Drive'
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please provide a valid contact phone number.');
      return;
    }

    setError('');
    onSave({
      name: name.trim(),
      phone: phone.trim(),
      panel: panel.trim() || 'General Panel',
      companyOrCollege: companyOrCollege.trim() || 'Placement Cell',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white relative">
          {!mandatory && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Interviewer Identification</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                Authorized evaluator credentials attached to all student sheets & logs
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Interviewer Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <UserCheck size={18} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Rajesh Sharma or Priya Patel"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Contact Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Required for college audit & verification on the evaluation sheet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Panel / Room
              </label>
              <input
                type="text"
                value={panel}
                onChange={(e) => setPanel(e.target.value)}
                placeholder="e.g. Panel 1 (GD & Technical)"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Organization / Unit
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companyOrCollege}
                  onChange={(e) => setCompanyOrCollege(e.target.value)}
                  placeholder="e.g. Nexora / Campus Drive"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
            {!mandatory && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Continue to Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
