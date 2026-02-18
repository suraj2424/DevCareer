import React, { useState, useCallback, useMemo } from 'react';
import {
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Star,
  ExternalLink,
  IndianRupee,
} from 'lucide-react';
import { Company } from '../types';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Tooltip from './Tooltip';

interface CompaniesListProps {
  companies: Company[];
  onViewDetail: (id: string) => void;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const STAR_INDICES = [1, 2, 3, 4, 5] as const;

const StarRating: React.FC<{ rating: number; label?: string }> = React.memo(
  ({ rating, label }) => (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={label ?? `Rating: ${rating} out of 5 stars`}
    >
      {STAR_INDICES.map((s) => (
        <Star
          key={s}
          className={cn(
            'h-3.5 w-3.5',
            s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200',
          )}
          aria-hidden="true"
          focusable="false"
        />
      ))}
    </div>
  ),
);

StarRating.displayName = 'StarRating';

const EmptyState: React.FC<{ variant: 'grid' | 'list' }> = React.memo(({ variant }) => (
  <Card padding="none">
    <CardContent className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Building2
          className="h-7 w-7 text-slate-400"
          aria-hidden="true"
          focusable="false"
        />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {variant === 'grid' ? 'No companies added yet' : 'No companies to show'}
      </h3>
      <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
        Start your company hub by adding your first company from the main actions.
      </p>
    </CardContent>
  </Card>
));

EmptyState.displayName = 'EmptyState';

const CompaniesList: React.FC<CompaniesListProps> = ({
  companies,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const setGrid = useCallback(() => setViewType('grid'), []);
  const setList = useCallback(() => setViewType('list'), []);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, id: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onViewDetail(id);
      }
    },
    [onViewDetail],
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent, company: Company) => {
      e.stopPropagation();
      onEdit(company);
    },
    [onEdit],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDelete(id);
    },
    [onDelete],
  );

  const sortedCompanies = useMemo(
    () => [...companies].sort((a, b) => a.name.localeCompare(b.name)),
    [companies],
  );

  const hasCompanies = sortedCompanies.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Company Hub
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {hasCompanies
              ? `Tracking ${sortedCompanies.length} compan${sortedCompanies.length !== 1 ? 'ies' : 'y'}.`
              : 'Track company details and insights.'}
          </p>
        </div>

        <div
          className="inline-flex shrink-0 items-center rounded-lg border border-slate-200 bg-white p-1"
          role="radiogroup"
          aria-label="View layout"
        >
          <button
            type="button"
            role="radio"
            aria-checked={viewType === 'grid'}
            aria-label="Grid view"
            onClick={setGrid}
            className={cn(
              'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
              viewType === 'grid'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" focusable="false" />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={viewType === 'list'}
            aria-label="List view"
            onClick={setList}
            className={cn(
              'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
              viewType === 'list'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <List className="h-4 w-4" aria-hidden="true" focusable="false" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!hasCompanies ? (
        <EmptyState variant={viewType} />
      ) : viewType === 'grid' ? (
        /* ── Grid View ─────────────────────────────────────────── */
        <ul
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Companies grid"
        >
          {sortedCompanies.map((company) => (
            <li key={company.id}>
              <Card
                padding="none"
                className="group relative h-full cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                tabIndex={0}
                role="article"
                aria-label={company.name}
                onClick={() => onViewDetail(company.id)}
                onKeyDown={(e) => handleCardKeyDown(e, company.id)}
              >
                <CardContent className="flex h-full flex-col p-5">
                  {/* Actions overlay */}
                  <div className="absolute right-3 top-3 flex gap-1 rounded-md bg-white/90 p-0.5 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Tooltip content="Edit" side="bottom">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEdit(e, company)}
                        aria-label={`Edit ${company.name}`}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                          focusable="false"
                        />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete" side="bottom">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, company.id)}
                        aria-label={`Delete ${company.name}`}
                        className="h-8 w-8 p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                          focusable="false"
                        />
                      </Button>
                    </Tooltip>
                  </div>

                  {/* Company header */}
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 transition-colors group-hover:bg-slate-900 group-hover:text-white"
                      aria-hidden="true"
                    >
                      {company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-slate-900">
                        {company.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                          focusable="false"
                        />
                        <span className="truncate">{company.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {company.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {company.description}
                    </p>
                  )}

                  {/* Details */}
                  <dl className="mt-auto space-y-2.5 border-t border-slate-100 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <IndianRupee
                          className="h-3 w-3"
                          aria-hidden="true"
                          focusable="false"
                        />
                        Fresher Pay
                      </dt>
                      <dd className="text-xs font-bold tabular-nums text-slate-900">
                        {company.fresherSalary}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Culture
                      </dt>
                      <dd>
                        <StarRating
                          rating={company.cultureRating}
                          label={`${company.name} culture: ${company.cultureRating} out of 5`}
                        />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Type
                      </dt>
                      <dd>
                        <Badge variant="secondary" size="sm">
                          {company.type}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        /* ── List View ─────────────────────────────────────────── */
        <Card padding="none">
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full text-left" aria-label="Companies list">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Company
                  </th>
                  <th
                    scope="col"
                    className="hidden px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 sm:table-cell"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="hidden px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 md:table-cell"
                  >
                    Salary
                  </th>
                  <th
                    scope="col"
                    className="hidden px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 md:table-cell"
                  >
                    Culture
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Type
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="group transition-colors hover:bg-slate-50 focus-within:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => onViewDetail(company.id)}
                        className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded-md"
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 transition-colors group-hover:bg-slate-900 group-hover:text-white"
                          aria-hidden="true"
                        >
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-bold text-slate-900 group-hover:text-blue-600">
                            {company.name}
                          </span>
                          <span className="block truncate text-xs text-slate-400 sm:hidden">
                            {company.location}
                          </span>
                        </div>
                        <ExternalLink
                          className="h-3.5 w-3.5 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden="true"
                          focusable="false"
                        />
                      </button>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <span className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin
                          className="h-3.5 w-3.5 shrink-0 text-slate-400"
                          aria-hidden="true"
                          focusable="false"
                        />
                        {company.location}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="text-sm font-semibold tabular-nums text-slate-900">
                        {company.fresherSalary}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <StarRating
                        rating={company.cultureRating}
                        label={`${company.name} culture: ${company.cultureRating} out of 5`}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="secondary" size="sm">
                        {company.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Tooltip content="Edit" side="top">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEdit(e, company)}
                            aria-label={`Edit ${company.name}`}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                              focusable="false"
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete" side="top">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(e, company.id)}
                            aria-label={`Delete ${company.name}`}
                            className="h-8 w-8 p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                              focusable="false"
                            />
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default React.memo(CompaniesList);