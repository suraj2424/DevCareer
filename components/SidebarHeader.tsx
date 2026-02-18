import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ collapsed, onToggle }) => {
  const toggleIcon = collapsed ? (
    <ChevronDown className="h-5 w-5 text-slate-400" />
  ) : (
    <ChevronDown className="h-5 w-5 text-slate-400 rotate-180" />
  );

  return (
    <div className={collapsed ? 'p-4 pt-6' : 'p-8'}>
      <div className="flex items-start justify-between gap-2">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              DevCareer
              <span className="text-blue-400" aria-hidden="true">
                .
              </span>
            </h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Personal Tracker
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-expanded={!collapsed}
          aria-controls="sidebar-content"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {toggleIcon}
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;
