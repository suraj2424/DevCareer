import React, { useEffect, useMemo, useRef, useState, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export type DropdownOption<T extends string = string> = {
  value: T;
  label: string;
};

interface CustomDropdownProps<T extends string = string> {
  id?: string;
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<DropdownOption<T>>;
  placeholder?: string;
  disabled?: boolean;
  buttonClassName?: string;
  menuClassName?: string;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const PREFERRED_MAX_HEIGHT = 224;
const MIN_MAX_HEIGHT = 120;
const GAP = 8;
const FLIP_THRESHOLD = 160;

const CustomDropdown = <T extends string = string>({
  id: externalId,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  buttonClassName,
  menuClassName,
}: CustomDropdownProps<T>) => {
  const autoId = useId();
  const baseId = externalId ?? autoId;
  const buttonId = `${baseId}-button`;
  const listboxId = `${baseId}-listbox`;
  const labelId = label ? `${baseId}-label` : undefined;

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const getSelectedIndex = useCallback(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  }, [options, value]);

  const computePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - GAP;
    const spaceAbove = rect.top - GAP;
    const shouldOpenUp = spaceBelow < FLIP_THRESHOLD && spaceAbove > spaceBelow;
    const available = Math.max(MIN_MAX_HEIGHT, Math.floor(shouldOpenUp ? spaceAbove : spaceBelow));
    const maxH = Math.min(PREFERRED_MAX_HEIGHT, available);

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      maxHeight: maxH,
      zIndex: 9999,
      ...(shouldOpenUp
        ? { bottom: window.innerHeight - rect.top + GAP, top: 'auto' }
        : { top: rect.bottom + GAP, bottom: 'auto' }),
    });
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const openMenu = useCallback(() => {
    setOpen(true);
    setActiveIndex(getSelectedIndex());
  }, [getSelectedIndex]);

  const commit = useCallback(
    (newValue: T) => {
      onChange(newValue);
      closeMenu();
      buttonRef.current?.focus();
    },
    [onChange, closeMenu],
  );

  useEffect(() => {
    if (!open) return;

    computePosition();

    const onReposition = () => {
      requestAnimationFrame(computePosition);
    };

    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, computePosition]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (
        rootRef.current &&
        e.target instanceof Node &&
        !rootRef.current.contains(e.target) &&
        !listRef.current?.contains(e.target)
      ) {
        closeMenu();
        buttonRef.current?.focus();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        buttonRef.current?.focus();
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;

    const activeEl = listRef.current?.querySelector<HTMLLIElement>(
      `[data-index="${activeIndex}"]`,
    );
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  useEffect(() => {
    if (open) {
      listRef.current?.focus();
    }
  }, [open]);

  const handleButtonKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        e.preventDefault();
        openMenu();
        break;
      default:
        break;
    }
  };

  const handleListKeyDown: React.KeyboardEventHandler<HTMLUListElement> = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i < options.length - 1 ? i + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : options.length - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && options[activeIndex]) {
          commit(options[activeIndex].value);
        }
        break;
      case 'Tab':
        closeMenu();
        break;
      default:
        break;
    }
  };

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (open) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [disabled, open, closeMenu, openMenu]);

  const activeDescendant =
    open && activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined;

  return (
    <div ref={rootRef} className="relative">
      {label && (
        <label
          id={labelId}
          htmlFor={buttonId}
          className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-700"
        >
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        aria-labelledby={labelId ? `${labelId} ${buttonId}` : undefined}
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white p-2 text-left text-sm text-slate-900 shadow-sm outline-none transition-colors',
          'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          buttonClassName,
        )}
      >
        <span className={cn('truncate', !selected && 'text-slate-500')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-slate-500 transition-transform duration-150',
            open && 'rotate-180',
          )}
          aria-hidden="true"
          focusable="false"
        />
      </button>

      {open &&
        createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={labelId ?? buttonId}
            aria-activedescendant={activeDescendant}
            onKeyDown={handleListKeyDown}
            style={menuStyle}
            className={cn(
              'overflow-auto overscroll-contain rounded-md border border-slate-200 bg-white shadow-xl outline-none',
              'focus-visible:ring-2 focus-visible:ring-blue-500',
              menuClassName,
            )}
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isActive = idx === activeIndex;

              return (
                <li
                  key={opt.value}
                  id={`${baseId}-option-${idx}`}
                  role="option"
                  data-index={idx}
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  onClick={() => commit(opt.value)}
                  className={cn(
                    'flex w-full cursor-default items-center justify-between gap-3 px-3 py-2.5 text-sm',
                    isActive && 'bg-blue-50',
                    isSelected ? 'font-semibold text-slate-900' : 'text-slate-700',
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check
                      className="h-4 w-4 shrink-0 text-blue-600"
                      aria-hidden="true"
                      focusable="false"
                    />
                  )}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
};

export default CustomDropdown;