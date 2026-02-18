import React, { forwardRef, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
  /** Semantic HTML element to render. Defaults to 'div'. */
  as?: 'div' | 'section' | 'article' | 'aside';
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

const BASE_CARD_CLASSES =
  'bg-white border border-slate-200 rounded-lg shadow-sm' as const;

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Merges class strings, filtering out empty / falsy segments. */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Components ──────────────────────────────────────────────────────────────

/**
 * Card – a generic surface container.
 *
 * Renders as a `<div>` by default but accepts `as="section"` or `as="article"`
 * for better document semantics. When using `section` or `article`, pair it
 * with an accessible heading inside `CardHeader` so the landmark is labelled.
 *
 * All unknown HTML attributes (id, data-*, aria-*, etc.) are forwarded to the
 * root element.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, className, padding = 'md', as: Component = 'div', ...rest },
    ref,
  ) => {
    const classes = useMemo(
      () => cn(BASE_CARD_CLASSES, PADDING_CLASSES[padding], className),
      [padding, className],
    );

    return (
      <Component ref={ref} className={classes} {...rest}>
        {children}
      </Component>
    );
  },
);

Card.displayName = 'Card';

/**
 * CardHeader – the top region of a Card.
 *
 * Place a heading element (`h2`, `h3`, etc.) inside so the card has an
 * accessible label when wrapped in a landmark element.
 */
const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...rest }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...rest}>
      {children}
    </div>
  ),
);

CardHeader.displayName = 'CardHeader';

/**
 * CardContent – the primary body region of a Card.
 */
const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...rest }, ref) => (
    <div ref={ref} className={cn(className)} {...rest}>
      {children}
    </div>
  ),
);

CardContent.displayName = 'CardContent';

/**
 * CardFooter – the bottom region of a Card, visually separated by a border.
 */
const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 border-t border-slate-200 pt-4', className)}
      {...rest}
    >
      {children}
    </div>
  ),
);

CardFooter.displayName = 'CardFooter';

// ─── Exports ─────────────────────────────────────────────────────────────────

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps, CardSectionProps, CardPadding };