import React from 'react';
import { PipelineStatus, TestStatus } from '../types/ci';

interface StatusBadgeProps {
  status: PipelineStatus | TestStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  let dotColor = 'bg-neutral-400';
  let textColor = 'text-neutral-600';
  let label = status;

  if (norm === 'SUCCESS' || norm === 'PASSED') {
    dotColor = 'bg-black';
    textColor = 'text-neutral-900 font-bold';
    label = norm === 'SUCCESS' ? 'Passed / Success' : 'Passed';
  } else if (norm === 'FAILED') {
    dotColor = 'border-2 border-black bg-white';
    textColor = 'text-black font-extrabold underline decoration-1';
    label = 'Failed';
  } else if (norm === 'RUNNING') {
    dotColor = 'bg-neutral-500 animate-pulse';
    textColor = 'text-neutral-800 font-semibold';
    label = 'Running';
  } else if (norm === 'SKIPPED') {
    dotColor = 'bg-neutral-400';
    textColor = 'text-neutral-500';
    label = 'Skipped';
  } else if (norm === 'NOT_CONFIGURED') {
    dotColor = 'border border-neutral-400 bg-neutral-200';
    textColor = 'text-neutral-500';
    label = 'Not Configured';
  }

  const textSize = size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm';

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono ${textSize} ${textColor}`}>
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};
