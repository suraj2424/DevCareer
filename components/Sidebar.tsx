import React, { useId } from 'react';
import { ViewState, User } from '../types';
import SidebarHeader from './SidebarHeader';
import SidebarNav from './SidebarNav';
import UserMenu from './UserMenu';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  collapsed: boolean;
  onToggle: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setView,
  collapsed,
  onToggle,
  currentUser,
  onLogout,
}) => {
  const uniqueId = useId();
  const navLabelId = `${uniqueId}-nav-label`;

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } flex h-full shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-[width] duration-200 ease-out will-change-[width]`}
      aria-label="Application sidebar"
    >
      <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
      
      <SidebarNav 
        currentView={currentView} 
        setView={setView} 
        navLabelId={navLabelId} 
        collapsed={collapsed}
      />

      {currentUser && (
        <UserMenu
          currentUser={currentUser}
          collapsed={collapsed}
          setView={setView}
          onLogout={onLogout}
        />
      )}
    </aside>
  );
};

export default React.memo(Sidebar);