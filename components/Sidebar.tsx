
import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'dashboard' as ViewState, label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { id: 'applications' as ViewState, label: 'My Applications', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    )},
    { id: 'companies' as ViewState, label: 'Company Hub', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    )},
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0">
      <div className="p-8">
        <h1 className="text-white text-xl font-bold tracking-tight">DevCareer<span className="text-blue-500">.</span></h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Personal Tracker</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1" aria-label="Main Navigation">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            aria-current={currentView === item.id ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-sm">
          <div className="w-8 h-8 rounded-sm bg-blue-500 flex items-center justify-center text-white font-bold text-xs uppercase" aria-hidden="true">
            JD
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Junior Developer</p>
            <p className="text-xs text-slate-400">Active Search</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
