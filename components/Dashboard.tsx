import React, { useMemo } from 'react';
import {
  Briefcase,
  MessageSquare,
  Trophy,
  TrendingUp,
  Building2,
  Target,
  Zap,
  ArrowRight,
  Clock,
  Send,
  ChevronRight,
} from 'lucide-react';
import { Application, Company } from '../types';
import ChartContainer from './ChartContainer';
import { Card, CardContent, CardHeader } from './ui/Card';
import Button from './ui/Button';

interface DashboardProps {
  apps: Application[];
  companies: Company[];
  onViewApps: () => void;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const ACTIVE_STATUSES = new Set(['Interviewing', 'Technical', 'HR', 'Screening']);
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  Applied: { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  Screening: { dot: 'bg-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  Interviewing: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  Technical: { dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  HR: { dot: 'bg-pink-500', bg: 'bg-pink-50', text: 'text-pink-700' },
  Offer: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Rejected: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  Withdrawn: { dot: 'bg-slate-400', bg: 'bg-slate-100', text: 'text-slate-600' },
};

const DEFAULT_STATUS_COLOR = { dot: 'bg-slate-400', bg: 'bg-slate-100', text: 'text-slate-600' };

function getStatusColor(status: string) {
  return STATUS_COLORS[status] ?? DEFAULT_STATUS_COLOR;
}

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const Dashboard: React.FC<DashboardProps> = ({ apps, companies, onViewApps }) => {
  const {
    activeCount,
    offerCount,
    recentCount,
    successRate,
    recentApps,
    statusCounts,
    topCompanies,
  } = useMemo(() => {
    const now = Date.now();
    const cutoff = now - SEVEN_DAYS_MS;

    let active = 0;
    let offers = 0;
    const recent: Application[] = [];
    const statuses: Record<string, number> = {};
    const companyApps: Record<string, number> = {};

    for (const app of apps) {
      if (ACTIVE_STATUSES.has(app.status)) active++;
      if (app.status === 'Offer') offers++;
      if (new Date(app.dateApplied).getTime() >= cutoff) recent.push(app);
      statuses[app.status] = (statuses[app.status] || 0) + 1;
      companyApps[app.companyId] = (companyApps[app.companyId] || 0) + 1;
    }

    const sorted = [...apps].sort(
      (a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
    );

    const topCo = Object.entries(companyApps)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      activeCount: active,
      offerCount: offers,
      recentCount: recent.length,
      successRate: apps.length > 0 ? Math.round((offers / apps.length) * 100) : 0,
      recentApps: sorted.slice(0, 5),
      statusCounts: statuses,
      topCompanies: topCo,
    };
  }, [apps]);

  const chartData = useMemo(
    () => Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
    [statusCounts],
  );

  const stats = useMemo(
    () => [
      {
        label: 'Total Sent',
        value: apps.length,
        icon: Send,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        trend: recentCount > 0 ? `+${recentCount} this week` : undefined,
        trendUp: true,
      },
      {
        label: 'In Progress',
        value: activeCount,
        icon: MessageSquare,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        trend: activeCount > 0 ? 'Awaiting response' : undefined,
        trendUp: null,
      },
      {
        label: 'Offers',
        value: offerCount,
        icon: Trophy,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        trend: offerCount > 0 ? 'Congratulations!' : undefined,
        trendUp: true,
      },
      {
        label: 'Success Rate',
        value: `${successRate}%`,
        icon: TrendingUp,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        trend: successRate > 0 ? 'Conversion rate' : undefined,
        trendUp: successRate >= 10,
      },
    ],
    [apps.length, activeCount, offerCount, successRate, recentCount],
  );

  const hasApps = apps.length > 0;

  return (
    <div className="space-y-8">
  {/* ── Section 1: Greeting + KPIs ─────────────────────────── */}
  <section aria-labelledby="dashboard-heading">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1
          id="dashboard-heading"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {hasApps
            ? `Tracking ${apps.length} application${apps.length !== 1 ? 's' : ''} across ${companies.length} compan${companies.length !== 1 ? 'ies' : 'y'}.`
            : 'Start tracking your job search by adding your first application.'}
        </p>
      </div>
      <Button
        onClick={onViewApps}
        variant="primary"
        size="md"
        className="shrink-0 self-start sm:self-auto"
      >
        {hasApps ? 'View Applications' : 'Add Application'}
        <ArrowRight className="h-4 w-4" aria-hidden="true" focusable="false" />
      </Button>
    </div>

    {/* KPI cards */}
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} padding="none">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <p
                      className={cn(
                        'mt-1.5 text-xs font-medium',
                        stat.trendUp === true && 'text-emerald-600',
                        stat.trendUp === false && 'text-red-600',
                        stat.trendUp === null && 'text-amber-600',
                      )}
                    >
                      {stat.trend}
                    </p>
                  )}
                </div>
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    stat.bg,
                    stat.color,
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </section>

  {/* ── Section 2: Pipeline + Activity ─────────────────────── */}
  {hasApps && (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
      {/* Pipeline */}
      <section className="lg:col-span-3" aria-labelledby="pipeline-heading">
        <Card padding="none" className="h-full">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2
              id="pipeline-heading"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              Pipeline
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Where your applications stand right now.
            </p>
          </div>

          <CardContent className="p-6">
            {/* Horizontal status bar */}
            <div className="mb-6">
              <div
                className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
                role="img"
                aria-label={`Pipeline: ${Object.entries(statusCounts)
                  .map(([s, c]) => `${s} ${c}`)
                  .join(', ')}`}
              >
                {Object.entries(statusCounts).map(([status, count]) => {
                  const pct = (Number(count) / apps.length) * 100;
                  const color = getStatusColor(status);
                  return (
                    <div
                      key={status}
                      className={cn('h-full transition-all duration-300', color.dot)}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Status rows */}
            <ul className="space-y-2" aria-label="Status breakdown">
              {Object.entries(statusCounts)
                .sort(([, a], [, b]) => Number(b) - Number(a))
                .map(([status, count]) => {
                  const pct = Math.round((Number(count) / apps.length) * 100);
                  const color = getStatusColor(status);
                  return (
                    <li
                      key={status}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <span
                        className={cn('h-2.5 w-2.5 shrink-0 rounded-full', color.dot)}
                        aria-hidden="true"
                      />
                      <span className="flex-1 text-sm font-medium text-slate-700">
                        {status}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-slate-900">
                        {count}
                      </span>
                      <span
                        className={cn(
                          'w-12 rounded-md px-2 py-0.5 text-center text-xs font-semibold tabular-nums',
                          color.bg,
                          color.text,
                        )}
                      >
                        {pct}%
                      </span>
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Recent activity */}
      <section className="lg:col-span-2" aria-labelledby="activity-heading">
        <Card padding="none" className="h-full">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2
                id="activity-heading"
                className="text-lg font-bold tracking-tight text-slate-900"
              >
                Recent Activity
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">Latest applications</p>
            </div>
            <Button
              onClick={onViewApps}
              variant="ghost"
              size="sm"
              className="text-xs"
              aria-label="View all applications"
            >
              View all
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
            </Button>
          </div>

          <CardContent className="p-2">
            {recentApps.length > 0 ? (
              <ul aria-label="Recent applications">
                {recentApps.map((app) => {
                  const company = companies.find((c) => c.id === app.companyId);
                  const color = getStatusColor(app.status);
                  return (
                    <li
                      key={app.id}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold uppercase text-slate-600"
                        aria-hidden="true"
                      >
                        {(company?.name ?? '?').slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {app.role}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {company?.name ?? 'Unknown company'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={cn(
                            'inline-block rounded-md px-2 py-0.5 text-xs font-semibold',
                            color.bg,
                            color.text,
                          )}
                        >
                          {app.status}
                        </span>
                        <p className="mt-0.5 flex items-center justify-end gap-1 text-xs text-slate-400">
                          <Clock
                            className="h-3 w-3"
                            aria-hidden="true"
                            focusable="false"
                          />
                          <time dateTime={app.dateApplied}>
                            {formatRelativeDate(app.dateApplied)}
                          </time>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <Briefcase
                  className="mx-auto h-8 w-8 text-slate-300"
                  aria-hidden="true"
                  focusable="false"
                />
                <p className="mt-2 text-sm text-slate-500">No applications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )}

  {/* ── Section 3: Chart + Top Companies ───────────────────── */}
  {hasApps && (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
      {/* Chart */}
      <section className="lg:col-span-2" aria-label="Application status chart">
        <ChartContainer data={chartData} title="Status Distribution" />
      </section>

      {/* Top companies */}
      <section aria-labelledby="companies-heading">
        <Card padding="none" className="h-full">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2
              id="companies-heading"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              Top Companies
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Most applications by company
            </p>
          </div>

          <CardContent className="p-2">
            {topCompanies.length > 0 ? (
              <ol aria-label="Companies ranked by application count">
                {topCompanies.map(([companyId, count], idx) => {
                  const company = companies.find((c) => c.id === companyId);
                  const pct = Math.round((count / apps.length) * 100);
                  return (
                    <li
                      key={companyId}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold tabular-nums text-slate-500"
                        aria-hidden="true"
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {company?.name ?? 'Unknown'}
                        </p>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                        {count}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="px-6 py-12 text-center">
                <Building2
                  className="mx-auto h-8 w-8 text-slate-300"
                  aria-hidden="true"
                  focusable="false"
                />
                <p className="mt-2 text-sm text-slate-500">No companies yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )}

  {/* ── Empty state ────────────────────────────────────────── */}
  {!hasApps && (
    <Card padding="none" as="section" aria-labelledby="empty-heading">
      <CardContent className="px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          <Briefcase
            className="h-8 w-8 text-blue-500"
            aria-hidden="true"
            focusable="false"
          />
        </div>
        <h2
          id="empty-heading"
          className="mt-4 text-lg font-bold text-slate-900"
        >
          Start your job search
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          Add your first application to begin tracking your career progress, pipeline, and activity.
        </p>
        <Button onClick={onViewApps} variant="primary" size="md" className="mt-6">
          Add Your First Application
          <ArrowRight className="h-4 w-4" aria-hidden="true" focusable="false" />
        </Button>
      </CardContent>
    </Card>
  )}
</div>
  );
};

export default React.memo(Dashboard);