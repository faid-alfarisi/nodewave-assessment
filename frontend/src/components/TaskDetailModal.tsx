'use client';

import React, { useState } from 'react';
import { Task, User } from '@/types';
import { api } from '@/lib/api';
import {
  X,
  Clock,
  History,
  Paperclip,
  Upload,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  currentUser: User | null;
  onClose: () => void;
  onUpdate: () => void;
  onConflict: (serverData: any) => void;
}

export default function TaskDetailModal({
  task,
  currentUser,
  onClose,
  onUpdate,
  onConflict,
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'audit' | 'attachments'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable fields for PM
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');

  // Attachment upload state
  const [attachFileName, setAttachFileName] = useState('');
  const [attachUrl, setAttachUrl] = useState('');

  if (!task) return null;

  const isPM = currentUser?.role === 'PRODUCT_MANAGER';
  const isClient = currentUser?.role === 'CLIENT_GUEST';
  const isInternal = currentUser?.role === 'INTERNAL_TEAM';

  // Check state-based permissions
  const incompletePrereqs = task.dependencies?.filter(
    (d) => d.prerequisiteTask.status !== 'DONE'
  ) || [];
  const hasPrereqBlocker = incompletePrereqs.length > 0;

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.patch(`/api/tasks/${task.id}`, {
        status: newStatus,
        version: task.version,
      });
      onUpdate();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        onConflict(err.response?.data?.currentData);
        onClose();
      } else {
        setErrorMessage(err.response?.data?.error || 'Failed to update status');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle details update (PM only)
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.patch(`/api/tasks/${task.id}`, {
        title,
        description,
        version: task.version,
      });
      onUpdate();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        onConflict(err.response?.data?.currentData);
        onClose();
      } else {
        setErrorMessage(err.response?.data?.error || 'Failed to save changes');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file attachment upload
  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachFileName || !attachUrl) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.post(`/api/tasks/${task.id}/attachments`, {
        fileName: attachFileName,
        fileUrl: attachUrl,
      });
      setAttachFileName('');
      setAttachUrl('');
      onUpdate();
      setActiveTab('attachments');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to add attachment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0F1318] border border-[rgba(80,177,210,0.2)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex items-start justify-between bg-[rgba(255,255,255,0.02)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#50B1D2]/10 border border-[#50B1D2]/30 text-[#50B1D2] font-semibold">
                {task.department || 'PROJECT TASK'}
              </span>
              <span className="text-xs text-[#A3A0AF] font-mono">v{task.version}</span>
              {task.status === 'BLOCKED' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Blocked
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A3A0AF] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-[rgba(255,255,255,0.06)] px-5 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-[#50B1D2] text-[#50B1D2]'
                : 'border-transparent text-[#A3A0AF] hover:text-white'
            }`}
          >
            <span>Overview & State</span>
          </button>

          {!isClient && (
            <>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'attachments'
                    ? 'border-[#50B1D2] text-[#50B1D2]'
                    : 'border-transparent text-[#A3A0AF] hover:text-white'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attachments ({task.attachments?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'audit'
                    ? 'border-[#50B1D2] text-[#50B1D2]'
                    : 'border-transparent text-[#A3A0AF] hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Trail ({task.auditLogs?.length || 0})</span>
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Dependencies Alert if Blocked */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                  <h4 className="text-xs font-semibold text-[#50B1D2] mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Prerequisite Task Dependencies:</span>
                  </h4>
                  <div className="space-y-1.5">
                    {task.dependencies.map((dep) => {
                      const isDone = dep.prerequisiteTask.status === 'DONE';
                      return (
                        <div
                          key={dep.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.04)]"
                        >
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span className="text-white font-medium">{dep.prerequisiteTask.title}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {dep.prerequisiteTask.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Core Description Form (PM can edit, Internal can only view) */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A0AF] mb-1.5">
                  Core Description {!isPM && <span className="text-amber-400">(Read-Only for Internal)</span>}
                </label>
                {isPM ? (
                  <form onSubmit={handleSaveDetails} className="space-y-3">
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-white text-xs focus:outline-none focus:border-[#50B1D2]"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 bg-[#50B1D2] hover:bg-[#3ca2c4] text-black text-xs font-bold rounded-lg transition-colors"
                    >
                      Update Description
                    </button>
                  </form>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] text-xs text-white leading-relaxed">
                    {task.description || 'No description provided.'}
                  </div>
                )}
              </div>

              {/* State-Based Transitions Workflow */}
              {!isClient && (
                <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <h4 className="text-xs font-semibold text-white mb-2">Change Status (State-Based Rules):</h4>
                  <div className="flex flex-wrap gap-2">
                    {/* To Do */}
                    <button
                      type="button"
                      disabled={isSubmitting || task.status === 'TODO'}
                      onClick={() => handleStatusChange('TODO')}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] hover:bg-white/10 text-white disabled:opacity-30"
                    >
                      Move to To Do
                    </button>

                    {/* In Progress (Locked if Prereqs not Done) */}
                    <button
                      type="button"
                      disabled={isSubmitting || task.status === 'IN_PROGRESS' || hasPrereqBlocker}
                      onClick={() => handleStatusChange('IN_PROGRESS')}
                      title={hasPrereqBlocker ? 'Locked: Prerequisite tasks are not yet Done!' : ''}
                      className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-colors ${
                        hasPrereqBlocker
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 cursor-not-allowed'
                          : 'border-[#50B1D2]/40 bg-[#50B1D2]/10 hover:bg-[#50B1D2]/20 text-[#50B1D2]'
                      } disabled:opacity-40`}
                    >
                      {hasPrereqBlocker && <Lock className="w-3 h-3 text-rose-400" />}
                      <span>In Progress</span>
                    </button>

                    {/* Done (Locked for PM if task is In Progress) */}
                    <button
                      type="button"
                      disabled={
                        isSubmitting ||
                        task.status === 'DONE' ||
                        (isPM && task.status === 'IN_PROGRESS')
                      }
                      onClick={() => handleStatusChange('DONE')}
                      title={
                        isPM && task.status === 'IN_PROGRESS'
                          ? 'Rule: PMs cannot mark In-Progress tasks as Done. Only assigned executor can.'
                          : ''
                      }
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        isPM && task.status === 'IN_PROGRESS'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 cursor-not-allowed'
                          : 'border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                      } disabled:opacity-40`}
                    >
                      {isPM && task.status === 'IN_PROGRESS' && <Lock className="w-3 h-3 text-amber-400" />}
                      <span>Mark as Done</span>
                    </button>
                  </div>

                  {isPM && task.status === 'IN_PROGRESS' && (
                    <p className="text-[11px] text-amber-400/90 mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> PM restriction: Only the executor can complete an In-Progress task.
                    </p>
                  )}
                  {hasPrereqBlocker && (
                    <p className="text-[11px] text-rose-400/90 mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> State lock: You cannot start this task until prerequisites are Done.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              {/* Upload Attachment Form */}
              <form onSubmit={handleAddAttachment} className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] space-y-3">
                <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#50B1D2]" />
                  <span>Attach Deliverable URL</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="File Name (e.g. DesignSpecs.fig)"
                    value={attachFileName}
                    onChange={(e) => setAttachFileName(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#50B1D2]"
                  />
                  <input
                    type="url"
                    required
                    placeholder="URL (https://...)"
                    value={attachUrl}
                    onChange={(e) => setAttachUrl(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#50B1D2]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#50B1D2] hover:bg-[#3ca2c4] text-black text-xs font-bold rounded-lg transition-colors"
                >
                  Save Attachment
                </button>
              </form>

              {/* Attachments List */}
              <div className="space-y-2">
                {task.attachments && task.attachments.length > 0 ? (
                  task.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Paperclip className="w-4 h-4 text-[#50B1D2]" />
                        <div>
                          <p className="text-xs font-medium text-white">{att.fileName}</p>
                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#50B1D2] hover:underline"
                          >
                            {att.fileUrl}
                          </a>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#A3A0AF]">
                        {new Date(att.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#A3A0AF] text-center py-6">No attachments uploaded yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#50B1D2] mb-2">Immutable Modification History</h4>
              {task.auditLogs && task.auditLogs.length > 0 ? (
                task.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[#A3A0AF] text-[11px]">
                      <span className="font-semibold text-white">
                        {log.user?.fullName || 'System / User'}
                      </span>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-white">
                      Changed column <span className="text-[#50B1D2] font-mono">{log.changedColumn}</span>:
                    </div>
                    <div className="text-[11px] flex items-center gap-2 bg-black/40 p-2 rounded-lg font-mono">
                      <span className="text-rose-300 line-through">{log.oldValue || 'none'}</span>
                      <ArrowRight className="w-3 h-3 text-[#A3A0AF]" />
                      <span className="text-emerald-300 font-bold">{log.newValue}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#A3A0AF] text-center py-6">No audit records found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

