import React, { useState } from 'react';
import {
  X,
  Plus,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Users,
} from 'lucide-react';
import { AppUser } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  onSaveUser: (user: AppUser) => void;
  onDeleteUser: (id: string) => void;
  onResetUsers: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onSaveUser,
  onDeleteUser,
  onResetUsers,
}) => {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AppUser>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newUserData, setNewUserData] = useState<Partial<AppUser>>({
    name: '',
    username: '',
    password: '',
    role: 'Interviewer',
    panel: 'Panel 1 - Technical',
    active: true,
  });

  if (!isOpen) return null;

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartEdit = (user: AppUser) => {
    setEditingUserId(user.id);
    setEditForm({ ...user });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id || !editForm.name || !editForm.username || !editForm.password) return;
    onSaveUser(editForm as AppUser);
    setEditingUserId(null);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.username || !newUserData.password) return;

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: newUserData.name.trim(),
      username: newUserData.username.trim().toLowerCase(),
      password: newUserData.password.trim(),
      role: newUserData.role || 'Interviewer',
      panel: newUserData.panel || 'Panel 1 - General',
      email: `${newUserData.username.toLowerCase()}@placement.campus.edu`,
      active: true,
    };

    onSaveUser(newUser);
    setNewUserData({
      name: '',
      username: '',
      password: '',
      role: 'Interviewer',
      panel: 'Panel 1 - Technical',
      active: true,
    });
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold">Interviewer Credentials & Access Table</h2>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] rounded-md border border-blue-400/30 uppercase tracking-wider font-semibold">
                  {users.length} Logins Configured
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Set and update interviewer logins, usernames, and passwords. Works instantly on Vercel deployments!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="text-xs text-slate-600 font-medium">
            <span>Interviewers can log in with these credentials or 1-click quick login.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onResetUsers}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
              title="Reset table to default 6 logins (Sahin, Ashad, Harleen, Gunjan, Aditi, Jitendra)"
            >
              <RotateCcw size={13} />
              <span>Reset to Default 6 Logins</span>
            </button>

            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>{isAddingNew ? 'Cancel' : '+ Add New Login'}</span>
            </button>
          </div>
        </div>

        {/* Add New User Drawer Form */}
        {isAddingNew && (
          <form
            onSubmit={handleCreateNewUser}
            className="bg-blue-50/70 border-b border-blue-200 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs animate-in slide-in-from-top-3 duration-200"
          >
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Interviewer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newUserData.name || ''}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="e.g. Sahin"
                required
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newUserData.username || ''}
                onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                placeholder="e.g. sahin"
                required
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 lowercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newUserData.password || ''}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="e.g. sahin@123"
                required
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Panel</label>
              <select
                value={newUserData.panel || 'Panel 1 - Technical'}
                onChange={(e) => setNewUserData({ ...newUserData, panel: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="Panel 1 - Technical & Coding">Panel 1 - Technical & Coding</option>
                <option value="Panel 2 - GD & Soft Skills">Panel 2 - GD & Soft Skills</option>
                <option value="Panel 3 - HR & Corporate Fitment">Panel 3 - HR & Corporate Fitment</option>
                <option value="Lead Panel & Placement Coordinator">Lead Panel & Coordinator</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                Save Login
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Users Table */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Interviewer</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Role / Panel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((user) => {
                const isEditing = editingUserId === user.id;

                if (isEditing) {
                  return (
                    <tr key={user.id} className="bg-blue-50/60">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs font-bold w-full"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editForm.username || ''}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          className="px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs font-mono lowercase w-full"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editForm.password || ''}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                          className="px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs font-mono w-full"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={editForm.panel || ''}
                          onChange={(e) => setEditForm({ ...editForm, panel: e.target.value })}
                          className="px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs w-full"
                        >
                          <option value="Panel 1 - Technical & Coding">Panel 1 - Technical</option>
                          <option value="Panel 2 - GD & Soft Skills">Panel 2 - GD & Soft Skills</option>
                          <option value="Panel 3 - HR & Corporate Fitment">Panel 3 - HR Fitment</option>
                          <option value="Lead Panel & Placement Coordinator">Lead Panel</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.active ?? true}
                            onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-[11px] font-semibold text-slate-700">Active</span>
                        </label>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-2xs"
                            title="Save changes"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                            title="Cancel edit"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span>{user.name}</span>
                        {user.role === 'Lead Evaluator' && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold text-[9px]">
                            Lead
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                      @{user.username}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-semibold min-w-[90px] inline-block">
                          {showPasswords[user.id] ? user.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                          title={showPasswords[user.id] ? 'Hide password' : 'Show password'}
                        >
                          {showPasswords[user.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="text-[11px] font-medium text-slate-700">{user.panel || 'Panel 1'}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.active ? 'bg-emerald-500' : 'bg-slate-400'}`}
                        ></span>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit name, username, or password"
                        >
                          <Edit2 size={13} />
                        </button>
                        {users.length > 1 && (
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-between items-center text-xs">
          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <Key size={13} className="text-amber-600" />
            <span>Passwords are synchronized across all connected browsers and live tabs.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
