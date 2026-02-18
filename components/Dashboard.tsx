
import React from 'react';
import { Application, Company } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  apps: Application[];
  companies: Company[];
  onViewApps: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ apps, companies, onViewApps }) => {
  const stats = [
    { label: 'Total Applications', value: apps.length, color: 'bg-blue-500' },
    // Fix: Added Interviewing to the active interview filter
    { label: 'Active Interviews', value: apps.filter(a => a.status === 'Interviewing' || a.status === 'Technical' || a.status === 'HR' || a.status === 'Screening').length, color: 'bg-amber-500' },
    { label: 'Offers Received', value: apps.filter(a => a.status === 'Offer').length, color: 'bg-emerald-500' },
    { label: 'Rejections', value: apps.filter(a => a.status === 'Rejected').length, color: 'bg-rose-500' },
  ];

  const statusCounts = apps.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#a855f7', '#94a3b8'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Career Progress</h2>
        <p className="text-slate-500">Overview of your current job search journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              <div className={`w-8 h-1 ${stat.color} mb-2 rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
          <h3 className="text-lg font-bold mb-6">Application Status Breakdown</h3>
          <div className="w-full h-[300px] min-h-[300px] min-w-0" role="img" aria-label="Bar chart showing application status distribution">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '2px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-[300px]">
            {apps.slice(-5).reverse().map((app) => {
              const company = companies.find(c => c.id === app.companyId);
              return (
                <div key={app.id} className="flex gap-4 pb-4 border-b border-slate-50 last:border-0">
                  <div className="w-10 h-10 shrink-0 bg-slate-100 flex items-center justify-center font-bold text-slate-400 rounded-sm" aria-hidden="true">
                    {company?.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{app.position}</p>
                    <p className="text-xs text-slate-500">{company?.name} • {app.status}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{app.dateApplied}</p>
                  </div>
                </div>
              );
            })}
            {apps.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm">No applications yet.</p>
              </div>
            )}
          </div>
          <button 
            onClick={onViewApps}
            className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors rounded-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            View All Applications
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
