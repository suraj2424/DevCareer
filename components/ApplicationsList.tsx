
import React from 'react';
import { Application, Company, ApplicationStatus } from '../types';

interface ApplicationsListProps {
  apps: Application[];
  companies: Company[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({ apps, companies, onUpdateStatus, onEdit, onDelete }) => {
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Offer': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Interviewing': 
      case 'Technical':
      case 'HR':
      case 'Screening': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Ghosted': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const statuses: ApplicationStatus[] = ['Applied', 'Screening', 'Interviewing', 'Technical', 'HR', 'Offer', 'Rejected', 'Ghosted'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Applications</h2>
          <p className="text-slate-500">Manage and update your active job applications.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden animate-in fade-in duration-300">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Company</th>
              <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Position</th>
              <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {apps.map((app) => {
              const company = companies.find(c => c.id === app.companyId);
              const companyName = company?.name || 'Unknown';
              return (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center font-bold text-white text-[10px]" aria-hidden="true">
                        {companyName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{companyName}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{app.dateApplied}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 font-medium">{app.position}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded-sm ${getStatusColor(app.status)}`} aria-hidden="true">
                        {app.status}
                      </span>
                      <select 
                        className="text-[10px] border border-slate-200 rounded-sm bg-white p-1 focus:ring-1 focus:ring-blue-500 outline-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                        aria-label={`Change status for ${app.position} at ${companyName}`}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        type="button" 
                        onClick={() => onEdit(app)} 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        aria-label={`Edit application for ${app.position} at ${companyName}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => onDelete(app.id)} 
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        aria-label={`Delete application for ${app.position} at ${companyName}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {apps.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-24 text-center text-slate-400">
                  <p className="text-sm italic">No records found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsList;
