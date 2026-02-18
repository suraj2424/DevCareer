import React, { useEffect, useId, useMemo, useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'top' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), 3500);
    return () => window.clearTimeout(t);
  }, [open]);

  const sideClasses = useMemo(() => {
    switch (side) {
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
      default:
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    }
  }, [side]);

  const child = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      setOpen(true);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      setOpen(false);
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      setOpen(true);
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      setOpen(false);
    },
    'aria-describedby': open ? id : children.props['aria-describedby'],
  });

  return (
    <span className="relative inline-flex">
      {child}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={
            `absolute z-50 px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider ` +
            `bg-slate-900 text-white shadow-lg border border-slate-700 whitespace-nowrap ` +
            `${sideClasses}`
          }
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
