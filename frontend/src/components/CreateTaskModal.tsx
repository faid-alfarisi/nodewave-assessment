'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Project, Task } from '@/types';
import { X, Plus, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  projectId: string;
  existingTasks: Task[];
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreated,
  projectId,
  existingTasks,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<'MANAGEMENT' | 'UIUX' | 'FRONTEND' | 'BACKEND'>('FRONTEND');
  const [clientVisible, setClientVisible] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleDependency = (taskId: string) => {
    setSelectedDependencies((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.post('/api/tasks', {
        title,
        description,
        department,
        projectId,
        clientVisible,
        dependencyIds: selectedDependencies,
      });

      onCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#12161C] border border-[rgba(80,177,210,0.2)] shadow-2xl p-6 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)] mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#50B1D2]" />
            <span>Create New Task</span>
          </h3>
          <button onClick={onClose} className="p-1 text-[#A3A0AF] hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#A3A0AF] mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Optimistic Locking on APIs"
              className="w-full px-3 py-2 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#50B1D2]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#A3A0AF] mb-1">Core Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain deliverables and operational constraints..."
              className="w-full px-3 py-2 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#50B1D2]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#A3A0AF] mb-1">Department</label>
              <select
                value={department}
                onChange={(e: any) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#50B1D2]"
              >
                <option value="MANAGEMENT">MANAGEMENT</option>
                <option value="UIUX">UI/UX</option>
                <option value="FRONTEND">FRONTEND</option>
                <option value="BACKEND">BACKEND</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={clientVisible}
                  onChange={(e) => setClientVisible(e.target.checked)}
                  className="rounded border-gray-700 text-[#50B1D2] focus:ring-[#50B1D2]"
                />
                <span>Client Visible</span>
              </label>
            </div>
          </div>

          {/* Dependencies Selector */}
          <div>
            <label className="block font-semibold text-[#A3A0AF] mb-1.5">
              Prerequisite Dependencies (Must be Done before this task can start):
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.06)]">
              {existingTasks.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer text-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedDependencies.includes(t.id)}
                    onChange={() => toggleDependency(t.id)}
                    className="rounded border-gray-700 text-[#50B1D2] focus:ring-[#50B1D2]"
                  />
                  <span className="truncate flex-1">{t.title}</span>
                  <span className="text-[10px] text-[#A3A0AF] uppercase">({t.department} - {t.status})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#A3A0AF] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#50B1D2] hover:bg-[#3ca2c4] text-black font-bold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

