
import React, { useState } from 'react';
import { Company } from '../types';

interface CompaniesListProps {
  companies: Company[];
  onViewDetail: (id: string) => void;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

const CompaniesList: React.FC<CompaniesListProps> = ({ companies, onViewDetail, onEdit, onDelete }) => {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewDetail(id);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`}
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Company Hub</h2>
          <p className="text-slate-500">Track company details and insights.</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-sm p-1" role="group" aria-label="View Layout">
          <button 
            type="button"
            onClick={() => setViewType('grid')}
            aria-label="Grid view"
            aria-pressed={viewType === 'grid'}
            className={`px-3 py-1.5 rounded-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${viewType === 'grid' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
          <button 
            type="button"
            onClick={() => setViewType('list')}
            aria-label="List view"
            aria-pressed={viewType === 'list'}
            className={`px-3 py-1.5 rounded-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${viewType === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {companies.map((company) => (
            <div 
              key={company.id} 
              role="button"
              tabIndex={0}
              aria-label={`View details for ${company.name}`}
              onKeyDown={(e) => handleKeyDown(e, company.id)}
              className="bg-white border border-slate-200 rounded-sm p-6 hover:border-slate-300 transition-all flex flex-col group cursor-pointer relative focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500" 
              onClick={() => onViewDetail(company.id)}
            >
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEdit(company); }} 
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm focus:opacity-100 focus:ring-2 focus:ring-blue-500"
                  title="Edit Company"
                  aria-label={`Edit ${company.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(company.id); }} 
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm focus:opacity-100 focus:ring-2 focus:ring-rose-500"
                  title="Delete Company"
                  aria-label={`Delete ${company.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="w-12 h-12 bg-slate-100 rounded-sm flex items-center justify-center font-bold text-slate-400 mb-4 transition-colors group-hover:bg-slate-900 group-hover:text-white" aria-hidden="true">
                {company.name[0]}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{company.location}</p>
              <p className="text-sm text-slate-600 line-clamp-2 mb-6 h-10">{company.description}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  <span>Fresher Pay</span>
                  <span className="text-slate-900">{company.fresherSalary}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Culture</span>
                   {renderStars(company.cultureRating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden animate-in fade-in duration-300">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Company</th>
                <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Location</th>
                <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th scope="col" className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map(company => (
                <tr 
                  key={company.id} 
                  className="hover:bg-slate-50 cursor-pointer group focus-within:bg-slate-50" 
                  onClick={() => onViewDetail(company.id)}
                >
                  <td className="px-6 py-4">
                    <button 
                      className="text-left font-bold text-slate-900 focus:underline focus:text-blue-600 focus:outline-none"
                      onClick={(e) => { e.stopPropagation(); onViewDetail(company.id); }}
                    >
                      {company.name}
                    </button>
                    <div className="text-xs text-slate-400">{company.fresherSalary} avg.</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{company.location}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold border border-slate-200 px-2 py-1 rounded-sm text-slate-500 uppercase">{company.type}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onEdit(company); }} 
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-sm focus:ring-2 focus:ring-blue-500"
                        title="Edit"
                        aria-label={`Edit ${company.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(company.id); }} 
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-sm focus:ring-2 focus:ring-rose-500"
                        title="Delete"
                        aria-label={`Delete ${company.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompaniesList;
