import React, { useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Star,
  Users,
  Pencil,
  Trash2,
  Briefcase,
  Calendar,
  Tag,
  IndianRupee,
  ExternalLink,
} from 'lucide-react';
import { Company, Application } from '../types';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface CompanyDetailProps {
  company: Company;
  applications: Application[];
  onBack: () => void;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const STAR_INDICES = [1, 2, 3, 4, 5] as const;

const STATUS_VARIANT: Record<string, 'success' | 'error' | 'warning' | 'secondary' | 'default'> = {
  Offer: 'success',
  Rejected: 'error',
  Interviewing: 'warning',
  Technical: 'warning',
  HR: 'warning',
  Screening: 'warning',
  Applied: 'default',
  Ghosted: 'secondary',
};

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = React.memo(
  ({ rating, size = 'sm' }) => (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`Culture rating: ${rating} out of 5 stars`}
    >
      {STAR_INDICES.map((s) => (
        <Star
          key={s}
          className={cn(
            s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200',
            size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          )}
          aria-hidden="true"
          focusable="false"
        />
      ))}
    </div>
  ),
);

StarRating.displayName = 'StarRating';

const SalaryDisplay: React.FC<{ value: string; className?: string }> = React.memo(
  ({ value, className }) => (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="tabular-nums">{value}</span>
      <abbr
        title="Cost to Company (annual)"
        className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 no-underline"
      >
        ctc
      </abbr>
    </span>
  ),
);

SalaryDisplay.displayName = 'SalaryDisplay';

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

const CompanyDetail: React.FC<CompanyDetailProps> = ({
  company,
  applications,
  onBack,
  onEdit,
  onDelete,
}) => {
  const initials = company.name.slice(0, 2).toUpperCase();

  const sortedApps = useMemo(
    () =>
      [...applications].sort(
        (a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
      ),
    [applications],
  );

  const statusSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const app of applications) {
      counts[app.status] = (counts[app.status] || 0) + 1;
    }
    return counts;
  }, [applications]);

  const heroStats = useMemo(
    () => [
      {
        label: 'Fresher Pay',
        value: company.fresherSalary,
        icon: IndianRupee,
        isSalary: true,
      },
      {
        label: 'Team Size',
        value: company.employeeRange,
        icon: Users,
        isSalary: false,
      },
      {
        label: 'Applications',
        value: applications.length,
        icon: Briefcase,
        isSalary: false,
      },
      {
        label: 'Culture',
        value: null,
        icon: Star,
        isSalary: false,
        custom: <StarRating rating={company.cultureRating} size="sm" />,
      },
    ],
    [company.fresherSalary, company.employeeRange, company.cultureRating, applications.length],
  );

  return (
    <article
      className="mx-auto max-w-5xl"
      aria-labelledby="company-detail-heading"
    >
      {/* Back navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="group -ml-2 gap-2 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
            focusable="false"
          />
          Back to Company Hub
        </Button>
      </nav>

      {/* ── Hero banner ──────────────────────────────────────── */}
      <Card padding="none" className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          <div className="relative px-6 pb-6 pt-8 sm:px-10 sm:pt-10">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-white/10 bg-white/10 text-lg font-bold text-white backdrop-blur-sm sm:h-16 sm:w-16 sm:text-xl"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <h1
                    id="company-detail-heading"
                    className="truncate text-lg font-bold tracking-tight text-white sm:text-xl"
                  >
                    {company.name}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPin
                        className="h-3 w-3 shrink-0"
                        aria-hidden="true"
                        focusable="false"
                      />
                      {company.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Building2
                        className="h-3 w-3 shrink-0"
                        aria-hidden="true"
                        focusable="false"
                      />
                      {company.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                {company.careersLink && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(company.careersLink, '_blank', 'noopener,noreferrer')}
                    aria-label={`View careers at ${company.name}`}
                    className="border border-white/10 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
                    <span className="hidden sm:inline">Careers</span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(company)}
                  aria-label={`Edit ${company.name}`}
                  className="border border-white/10 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(company.id)}
                  aria-label={`Delete ${company.name}`}
                  className="border border-red-500/20 bg-red-500/10 text-red-300 backdrop-blur-sm hover:bg-red-500/20 hover:text-red-200"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>

            {/* Stats row */}
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3"
                  >
                    <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <Icon
                        className="h-3 w-3 shrink-0"
                        aria-hidden="true"
                        focusable="false"
                      />
                      {stat.label}
                    </dt>
                    <dd className="mt-1 text-sm font-bold tabular-nums text-white sm:text-base">
                      {stat.custom ? (
                        stat.custom
                      ) : stat.isSalary ? (
                        <SalaryDisplay
                          value={String(stat.value)}
                          className="text-white [&_abbr]:text-slate-400"
                        />
                      ) : (
                        stat.value
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-0 divide-y divide-slate-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {/* Main content — 2/3 */}
          <div className="lg:col-span-2">
            {/* About */}
            {company.description && (
              <section className="px-6 py-5" aria-labelledby="about-heading">
                <h2
                  id="about-heading"
                  className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400"
                >
                  About
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  {company.description}
                </p>
              </section>
            )}

            {/* Applications */}
            <section
              className="border-t border-slate-100 px-6 py-5"
              aria-labelledby="roles-heading"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2
                  id="roles-heading"
                  className="text-xs font-bold uppercase tracking-widest text-slate-400"
                >
                  Applied Roles
                </h2>
                {applications.length > 0 && (
                  <span className="text-xs font-semibold tabular-nums text-slate-500">
                    {applications.length} total
                  </span>
                )}
              </div>

              {sortedApps.length > 0 ? (
                <ul className="space-y-2" aria-label="Applications at this company">
                  {sortedApps.map((app) => (
                    <li
                      key={app.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {app.role}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar
                            className="h-3 w-3 shrink-0"
                            aria-hidden="true"
                            focusable="false"
                          />
                          <time dateTime={app.dateApplied} className="tabular-nums">
                            {formatDate(app.dateApplied)}
                          </time>
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {app.type && (
                          <Badge variant="secondary" size="sm">
                            {app.type}
                          </Badge>
                        )}
                        <Badge
                          variant={STATUS_VARIANT[app.status] ?? 'default'}
                          size="sm"
                        >
                          {app.status}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 px-6 py-12 text-center">
                  <Briefcase
                    className="mx-auto h-8 w-8 text-slate-300"
                    aria-hidden="true"
                    focusable="false"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    No applications recorded yet.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar — 1/3 */}
          <aside className="lg:col-span-1">
            {/* Status breakdown */}
            {Object.keys(statusSummary).length > 0 && (
              <section
                className="px-6 py-5"
                aria-labelledby="status-breakdown-heading"
              >
                <h2
                  id="status-breakdown-heading"
                  className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400"
                >
                  Status Breakdown
                </h2>
                <dl className="space-y-2.5">
                  {Object.entries(statusSummary)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <dt>
                          <Badge
                            variant={STATUS_VARIANT[status] ?? 'default'}
                            size="sm"
                          >
                            {status}
                          </Badge>
                        </dt>
                        <dd className="text-sm font-semibold tabular-nums text-slate-900">
                          {count}
                        </dd>
                      </div>
                    ))}
                </dl>
              </section>
            )}

            {/* Custom fields */}
            {company.customFields.length > 0 && (
              <section
                className="border-t border-slate-100 px-6 py-5"
                aria-labelledby="extra-details-heading"
              >
                <h2
                  id="extra-details-heading"
                  className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400"
                >
                  Extra Details
                </h2>
                <dl className="space-y-3">
                  {company.customFields.map((field, i) => (
                    <div key={i}>
                      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        <Tag
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                          focusable="false"
                        />
                        {field.label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-slate-900">
                        {field.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </aside>
        </div>
      </Card>
    </article>
  );
};

export default React.memo(CompanyDetail);