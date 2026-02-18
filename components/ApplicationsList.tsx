import React, { useCallback, useMemo } from 'react';
import {
  Pencil,
  Trash2,
  Briefcase,
  MapPin,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { Application, Company, ApplicationStatus } from '../types';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import CustomDropdown from './CustomDropdown';
import Tooltip from './Tooltip';

interface ApplicationsListProps {
  apps: Application[];
  companies: Company[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const STATUSES: ApplicationStatus[] = [
  'Applied',
  'Screening',
  'Interviewing',
  'Technical',
  'HR',
  'Offer',
  'Rejected',
  'Ghosted',
];

const STATUS_OPTIONS = STATUSES.map((s) => ({ value: s, label: s }));

const STATUS_VARIANT: Record<ApplicationStatus, 'success' | 'error' | 'warning' | 'secondary' | 'default'> = {
  Offer: 'success',
  Rejected: 'error',
  Interviewing: 'warning',
  Technical: 'warning',
  HR: 'warning',
  Screening: 'warning',
  Applied: 'default',
  Ghosted: 'secondary',
};

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getRelativeDay(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

const EmptyState: React.FC = React.memo(() => (
  <Card padding="none">
    <CardContent className="px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Briefcase className="h-7 w-7 text-slate-400" aria-hidden="true" focusable="false" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-900">No applications yet</h3>
      <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
        Start tracking your job search by adding your first application.
      </p>
    </CardContent>
  </Card>
));

EmptyState.displayName = 'EmptyState';

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  apps,
  companies,
  onUpdateStatus,
  onEdit,
  onDelete,
}) => {
  const companyMap = useMemo(() => {
    const map = new Map<string, Company>();
    for (const c of companies) map.set(c.id, c);
    return map;
  }, [companies]);

  const sortedApps = useMemo(
    () =>
      [...apps].sort(
        (a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
      ),
    [apps],
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent, app: Application) => {
      e.stopPropagation();
      onEdit(app);
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

  const hasApps = sortedApps.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            My Applications
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {hasApps
              ? `${sortedApps.length} application${sortedApps.length !== 1 ? 's' : ''} tracked.`
              : 'Manage and update your active job applications.'}
          </p>
        </div>
      </div>

      {!hasApps ? (
        <EmptyState />
      ) : (
        <>
          {/* ── Desktop table ──────────────────────────────────── */}
          <div className="hidden lg:block">
            <Card padding="none">
              <div className="overflow-x-auto overscroll-x-contain">
                <table className="w-full text-left" aria-label="Applications">
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
                        className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        Position
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        Type / Role
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        Applied
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        Status
                      </th>
                      <th scope="col" className="px-5 py-3.5">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedApps.map((app) => {
                      const company = companyMap.get(app.companyId);
                      const companyName = company?.name ?? 'Unknown';
                      const initials = companyName.slice(0, 2).toUpperCase();

                      return (
                        <tr
                          key={app.id}
                          className="group transition-colors hover:bg-slate-50 focus-within:bg-slate-50"
                        >
                          {/* Company */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 transition-colors group-hover:bg-slate-900 group-hover:text-white"
                                aria-hidden="true"
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {companyName}
                                </p>
                                {company?.location && (
                                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                                    <MapPin
                                      className="h-3 w-3 shrink-0"
                                      aria-hidden="true"
                                      focusable="false"
                                    />
                                    <span className="truncate">{company.location}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-900">
                              {app.position}
                            </p>
                          </td>

                          {/* Type / Role */}
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="secondary" size="sm">
                                {app.type}
                              </Badge>
                              <Badge variant="default" size="sm">
                                {app.role}
                              </Badge>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Calendar
                                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                aria-hidden="true"
                                focusable="false"
                              />
                              <time dateTime={app.dateApplied} className="tabular-nums">
                                {formatDate(app.dateApplied)}
                              </time>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {getRelativeDay(app.dateApplied)}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={STATUS_VARIANT[app.status] ?? 'default'}
                                size="sm"
                              >
                                {app.status}
                              </Badge>
                              <div className="w-36 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                <CustomDropdown<ApplicationStatus>
                                  id={`status-${app.id}`}
                                  value={app.status}
                                  onChange={(v) => onUpdateStatus(app.id, v)}
                                  options={STATUS_OPTIONS}
                                  buttonClassName="text-xs py-1 px-2 border-slate-200"
                                />
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <Tooltip content="Edit" side="top">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleEdit(e, app)}
                                  aria-label={`Edit ${app.position} at ${companyName}`}
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
                                  onClick={(e) => handleDelete(e, app.id)}
                                  aria-label={`Delete ${app.position} at ${companyName}`}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* ── Mobile / Tablet cards ──────────────────────────── */}
          <ul className="space-y-3 lg:hidden" aria-label="Applications list">
            {sortedApps.map((app) => {
              const company = companyMap.get(app.companyId);
              const companyName = company?.name ?? 'Unknown';
              const initials = companyName.slice(0, 2).toUpperCase();

              return (
                <li key={app.id}>
                  <Card padding="none" className="group">
                    <CardContent className="p-4">
                      {/* Top row: avatar + info + actions */}
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500"
                          aria-hidden="true"
                        >
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-slate-900">
                                {app.position}
                              </h3>
                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {companyName}
                                {company?.location && ` · ${company.location}`}
                              </p>
                            </div>

                            <div className="flex shrink-0 gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleEdit(e, app)}
                                aria-label={`Edit ${app.position} at ${companyName}`}
                                className="h-7 w-7 p-0"
                              >
                                <Pencil
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                  focusable="false"
                                />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(e, app.id)}
                                aria-label={`Delete ${app.position} at ${companyName}`}
                                className="h-7 w-7 p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                  focusable="false"
                                />
                              </Button>
                            </div>
                          </div>

                          {/* Tags row */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant={STATUS_VARIANT[app.status] ?? 'default'}
                              size="sm"
                            >
                              {app.status}
                            </Badge>
                            <Badge variant="secondary" size="sm">
                              {app.type}
                            </Badge>
                            <Badge variant="default" size="sm">
                              {app.role}
                            </Badge>
                          </div>

                          {/* Date + status update */}
                          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            <p className="flex items-center gap-1 text-xs text-slate-400">
                              <Calendar
                                className="h-3 w-3 shrink-0"
                                aria-hidden="true"
                                focusable="false"
                              />
                              <time dateTime={app.dateApplied} className="tabular-nums">
                                {formatDate(app.dateApplied)}
                              </time>
                              <span aria-hidden="true">·</span>
                              <span>{getRelativeDay(app.dateApplied)}</span>
                            </p>

                            <div className="w-28 shrink-0">
                              <CustomDropdown<ApplicationStatus>
                                id={`status-mobile-${app.id}`}
                                value={app.status}
                                onChange={(v) => onUpdateStatus(app.id, v)}
                                options={STATUS_OPTIONS}
                                buttonClassName="text-xs py-1 px-2 border-slate-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default React.memo(ApplicationsList);