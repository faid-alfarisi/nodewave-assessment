import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ConcurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  serverData?: {
    title?: string;
    description?: string;
    status?: string;
    version?: number;
  };
}

export default function ConcurrencyConflictModal({
  isOpen,
  onClose,
  onRefresh,
  serverData,
}: ConcurrencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#12161C] border border-amber-500/40 shadow-2xl text-left">
        <div className="flex items-center gap-3 text-amber-400 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">409 Conflict: Concurrent Edit</h3>
            <p className="text-xs text-amber-300/80">Race condition detected on this task</p>
          </div>
        </div>

        <p className="text-xs text-[#A3A0AF] leading-relaxed mb-4">
          Another team member updated this task while you were editing it. Your change was safely rejected to prevent data overwrites.
        </p>

        {serverData && (
          <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] mb-4 text-xs space-y-1">
            <p className="text-[11px] font-semibold text-[#50B1D2]">Latest version in database (v{serverData.version}):</p>
            <p className="text-white"><span className="text-[#A3A0AF]">Title:</span> {serverData.title}</p>
            <p className="text-white"><span className="text-[#A3A0AF]">Status:</span> {serverData.status}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#A3A0AF] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onRefresh();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Newest Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}

