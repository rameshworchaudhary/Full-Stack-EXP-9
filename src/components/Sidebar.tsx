import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Workflow,
  ShieldCheck,
  FileText,
  Server,
  Terminal,
  Activity,
  UserCheck,
} from 'lucide-react';
import { HealthInfo } from '../types/ci';

export type NavTab = 'overview' | 'runs' | 'pipeline' | 'strategy' | 'experiment';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  health: HealthInfo | null;
  backendOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  health,
  backendOnline,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'runs' as NavTab, label: 'Test Runs', icon: GitBranch },
    { id: 'pipeline' as NavTab, label: 'CI Pipeline', icon: Workflow },
    { id: 'strategy' as NavTab, label: 'Testing Strategy', icon: ShieldCheck },
    { id: 'experiment' as NavTab, label: 'Lab Report & Docs', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-neutral-50 border-r border-neutral-200 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-black">CI Dashboard</h1>
              <p className="text-xs text-neutral-500 font-mono">Continuous Testing</p>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="mt-3.5 pt-3 border-t border-neutral-200 bg-white -mx-2 px-3 py-2.5 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-black shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-black truncate">Rameshwor Chaudhary</p>
                <p className="text-[11px] font-mono text-neutral-600 font-semibold">UID: 24BAI71012</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-black text-white font-bold shadow-xs'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend & Environment Status */}
      <div className="p-4 border-t border-neutral-200 space-y-3 bg-white">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-500 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-neutral-700" />
              Spring Boot API
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline ? 'bg-black' : 'border-2 border-black bg-white'
                }`}
              />
              <span className="text-black font-semibold">
                {backendOnline ? 'Online (:8085)' : 'Disconnected'}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
            <span>Runtime</span>
            <span className="text-black font-medium">Java 17 · Maven 3.8</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
            <span>Database</span>
            <span className="text-black font-medium">H2 / PostgreSQL</span>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-600 font-mono">
          <div className="flex items-center gap-1.5 text-black font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>GitHub Actions CI</span>
          </div>
          <p className="mt-1 text-neutral-500 text-[10px] leading-relaxed">
            Pact JVM · Testcontainers · JaCoCo
          </p>
        </div>
      </div>
    </aside>
  );
};
