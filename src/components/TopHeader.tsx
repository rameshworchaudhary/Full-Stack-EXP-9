import React from 'react';
import { RefreshCw, GitBranch, User } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) => {
  return (
    <header className="h-16 border-b border-neutral-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-base font-bold text-black flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-neutral-500 font-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs font-mono">
        {/* Prominent Student & UID Identification Badge */}
        <div className="flex items-center gap-2 text-black bg-neutral-100 border border-neutral-300 px-3 py-1.5 rounded-lg shadow-xs">
          <User className="w-3.5 h-3.5 text-neutral-700" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-black">Rameshwor Chaudhary</span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-700 font-bold">24BAI71012</span>
          </div>
        </div>

        {/* Branch indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-neutral-700 bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-md">
          <GitBranch className="w-3.5 h-3.5 text-neutral-500" />
          <span className="font-medium">main</span>
        </div>

        {/* Last updated & refresh button */}
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="hidden md:inline text-neutral-500 text-[11px]">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-black hover:bg-neutral-800 text-white font-semibold transition-colors disabled:opacity-50 shadow-xs"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};
