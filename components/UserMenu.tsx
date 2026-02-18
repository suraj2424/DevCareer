import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { User, ViewState } from '../types';
import { ChevronDown, User as UserIcon, LogOut } from 'lucide-react';

interface UserMenuProps {
  currentUser: User;
  collapsed: boolean;
  setView: (view: ViewState) => void;
  onLogout: () => void;
}

const MENU_ITEMS = [
  { action: 'profile' as const, label: 'Profile', Icon: UserIcon },
  { action: 'logout' as const, label: 'Logout', Icon: LogOut },
] as const;

type MenuAction = (typeof MENU_ITEMS)[number]['action'];

const UserMenu: React.FC<UserMenuProps> = ({ currentUser, collapsed, setView, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();
  const triggerId = useId();

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleAction = useCallback(
    (action: MenuAction) => {
      if (action === 'profile') {
        setView('profile');
      } else {
        onLogout();
      }
      close();
    },
    [setView, onLogout, close],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      const firstItem = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]');
      firstItem?.focus();
    }
  }, [isOpen]);

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      // Explicitly type items so TypeScript knows each entry is an HTMLButtonElement
      const items: HTMLButtonElement[] = Array.from(
        menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
      );
      const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
        case 'Tab':
          close();
          return;
        default:
          return;
      }

      if (nextIndex !== null) {
        items[nextIndex].focus();
      }
    },
    [close],
  );

  return (
    <div className="border-t border-slate-800 p-4">
      <div className="relative" ref={containerRef}>
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          onClick={toggle}
          className={`w-full flex items-center ${
            collapsed ? 'justify-center' : 'gap-3'
          } rounded-md bg-slate-800/50 p-2 hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`}
          aria-label={collapsed ? `${currentUser.name} – User menu` : undefined}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={isOpen ? menuId : undefined}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-bold uppercase text-white"
            aria-hidden="true"
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-slate-400">
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500"
                  aria-hidden="true"
                />
                Active
              </p>
            </div>
          )}
          {!collapsed && (
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 ${
                isOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          )}
        </button>

        {isOpen && (
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            onKeyDown={handleMenuKeyDown}
            className="absolute bottom-full left-0 mb-2 w-full min-w-[10rem] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
          >
            {MENU_ITEMS.map(({ action, label, Icon }) => (
              <li key={action} role="none">
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => handleAction(action)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default React.memo(UserMenu);