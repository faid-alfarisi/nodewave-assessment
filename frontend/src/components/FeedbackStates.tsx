import React from 'react';

export function LoadingSpinner({ text = 'Loading data...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[rgba(80,177,210,0.15)]"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#50B1D2] animate-spin"></div>
      </div>
      <p className="text-sm text-[#A3A0AF] animate-pulse">{text}</p>
    </div>
  );
}

export function EmptyState({
  title = 'No items found',
  description = 'There is currently no data to display.',
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-[rgba(80,177,210,0.2)] rounded-2xl bg-[rgba(255,255,255,0.01)] my-6">
      <div className="w-12 h-12 rounded-2xl bg-[#50B1D2]/10 border border-[#50B1D2]/20 flex items-center justify-center mb-3">
        <div className="w-5 h-5 rounded-full bg-[#50B1D2]/40 animate-ping"></div>
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-[#A3A0AF] max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'An error occurred',
  message = 'Failed to communicate with the server.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-6 border border-rose-500/30 rounded-2xl bg-rose-500/5 text-center my-6 max-w-md mx-auto">
      <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3 font-bold text-sm">
        !
      </div>
      <h3 className="text-base font-semibold text-rose-300 mb-1">{title}</h3>
      <p className="text-sm text-rose-200/70 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

