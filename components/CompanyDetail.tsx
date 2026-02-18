
import React from 'react';
import { Company, Application } from '../types';

interface CompanyDetailProps {
  company: Company;
  applications: Application[];
  onBack: () => void;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, applications, onBack, onEdit, onDelete }) => {
  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-400">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 group transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 rounded-sm px-2 py-1 -ml-2"
        aria-label="Back to Company Hub"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        <span className="text-sm font-medium">Back to Hub</span>
      </button>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="h-32 bg-slate-900 flex items-end px-12 relative">
          <div className="w-24 h-24 bg-white border-4 border-white rounded-sm absolute -bottom-12 shadow-md flex items-center justify-center font-black text-4xl text-slate-200" aria-hidden="true">
            {company.name[0]}
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => onEdit(company)} className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-sm hover:bg-white/20 backdrop-blur-md transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">Edit</button>
            <button onClick={() => onDelete(company.id)} className="px-4 py-2 bg-rose-500/10 text-rose-300 text-xs font-bold rounded-sm hover:bg-rose-500/20 backdrop-blur-md transition-colors focus:ring-2 focus:ring-rose-500 focus:outline-none">Delete</button>
          </div>
        </div>

        <div className="px-12 pt-20 pb-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">{company.name}</h1>
              <div className="flex gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>{company.location}</span>
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>{company.type}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Culture Rating</div>
              <div className="flex gap-1 justify-end" aria-label={`Rated ${company.cultureRating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < company.cultureRating ? 'bg-amber-400' : 'bg-slate-100'}`} aria-hidden="true"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">About the Company</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{company.description}</p>
              </section>

              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Applied Positions</h3>
                <div className="space-y-3">
                  {applications.length > 0 ? applications.map(app => (
                    <div key={app.id} className="p-4 border border-slate-100 bg-slate-50/50 flex justify-between items-center group hover:border-slate-200 transition-colors rounded-sm">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{app.position}</div>
                        <div className="text-xs text-slate-400">Applied on {app.dateApplied}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 rounded-sm text-slate-600 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">{app.status}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic">No applications recorded yet.</p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-slate-50 p-6 border border-slate-100 rounded-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Avg. Fresher Pay</div>
                    <div className="text-lg font-bold text-slate-900">{company.fresherSalary}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Team Size</div>
                    <div className="text-lg font-bold text-slate-900">{company.employeeRange}</div>
                  </div>
                </div>
              </section>

              {company.customFields.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Extra Details</h3>
                  <div className="space-y-4">
                    {company.customFields.map((field, i) => (
                      <div key={i}>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{field.label}</div>
                        <div className="text-sm text-slate-900">{field.value}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
