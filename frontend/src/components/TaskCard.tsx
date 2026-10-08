'use client';

import React from 'react';
import { Task, User } from '@/types';
import {
  Lock,
  Paperclip,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  currentUser: User | null;
  onClick: () => void;
  onQuickMove?: (taskId: string, targetStatus: string, version: number) => void;
}

export default function TaskCard({
  task,
  currentUser,
  onClick,
  onQuickMove,
}: TaskCardProps) {
  const isClient = currentUser?.role === 'CLIENT_GUEST';
  const isPM = currentUser?.role === 'PRODUCT_MANAGER';

  // Check if any prerequisite is NOT done
  const incompletePrereqs = task.dependencies?.filter(
    (d) => d.prerequisiteTask.status !== 'DONE'
  ) || [];
  const isDependencyBlocked = incompletePrereqs.length > 0;

  // Department color accent
  const getDeptColor = (dept: string | null) => {
    switch (dept) {
      case 'UIUX':
        return 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30';
      case 'FRONTEND':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'BACKEND':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'MANAGEMENT':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-xl bg-[rgba(18,22,28,0.7)] border transition-all duration-200 cursor-pointer hover:shadow-xl ${
        task.status === 'BLOCKED'
          ? 'border-rose-500/30 hover:border-rose-500/50 hover:bg-rose-950/10'
          : 'border-[rgba(80,177,210,0.15)] hover:border-[#50B1D2]/40 hover:bg-[rgba(25,32,42,0.8)]'
      }`}
    >
      {/* Top Meta: Department & Version */}
      <div className="flex items-center justify-between mb-2">
        {!isClient && task.department ? (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDeptColor(
              task.department
            )}`}
          >
            {task.department}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-[#50B1D2]">NODEWAVE TASK</span>
        )}

        <div className="flex items-center gap-1.5">
          {task.clientVisible && !isClient && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Client
            </span>
          )}
          <span className="text-[10px] text-[#A3A0AF] font-mono">v{task.version}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white group-hover:text-[#50B1D2] transition-colors line-clamp-2 mb-2 leading-snug">
        {task.title}
      </h3>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-[#A3A0AF] line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Dependency Warning Banner if Blocked */}
      {isDependencyBlocked && !isClient && (
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 mb-3 flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Blocked by prerequisites:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-rose-200/80">
              {incompletePrereqs.map((p) => (
                <li key={p.id}>
                  {p.prerequisiteTask.title} ({p.prerequisiteTask.status})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Footer: Assignee & Attachments */}
      <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.04)] text-xs">
        {/* Assignee (Masked for Client Guest) */}
        {!isClient && task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#50B1D2]/20 text-[#50B1D2] flex items-center justify-center text-[10px] font-bold">
              {task.assignee.fullName.charAt(0)}
            </div>
            <span className="text-[11px] text-[#A3A0AF] truncate max-w-[110px]">
              {task.assignee.fullName}
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-[#A3A0AF] italic">
            {isClient ? 'Verified Deliverable' : 'Unassigned'}
          </div>
        )}

        <div className="flex items-center gap-2 text-[#A3A0AF]">
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <Paperclip className="w-3 h-3 text-[#50B1D2]" />
              {task.attachments.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

