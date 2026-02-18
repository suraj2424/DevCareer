import React, { useCallback } from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  User as UserIcon
} from 'lucide-react';

interface MenuItem {
  id: ViewState;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  navLabelId: string;
  collapsed?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'applications',
    label: 'My Applications',
    icon: Briefcase,
  },
  {
    id: 'companies',
    label: 'Company Hub',
    icon: Building2,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserIcon,
  },
];

const SidebarNav: React.FC<SidebarNavProps> = ({ currentView, setView, navLabelId, collapsed = false }) => {
  const handleItemClick = useCallback(
    (id: ViewState) => () => {
      setView(id);
    },
    [setView],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const nav = e.currentTarget;
      const buttons: HTMLButtonElement[] = Array.from(
        nav.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
      );
      const currentIndex = buttons.indexOf(
        document.activeElement as HTMLButtonElement,
      );

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex =
            currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = buttons.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== null) {
        buttons[nextIndex].focus();
      }
    },
    [],
  );

  return (
    <nav
      id="sidebar-content"
      className="flex-1 px-4"
      aria-labelledby={navLabelId}
      role="navigation"
    >
      <h2 id={navLabelId} className="sr-only">
        Main Navigation
      </h2>
      <ul
        role="menubar"
        aria-orientation="vertical"
        className="space-y-1"
        onKeyDown={handleKeyDown}
      >
        {MENU_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={handleItemClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={isActive ? 0 : -1}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center' : 'gap-3'
                } rounded-md px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span>{item.label}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarNav;
