
import React, { useState, useEffect, useId } from 'react';
import { Company, Application, CompanyType, ApplicationStatus, CustomField } from '../types';
import { researchCompany } from '../services/geminiService';

interface ModalProps {
  type: 'company' | 'application' | 'confirmation';
  mode: 'create' | 'edit' | 'view';
  initialData?: any;
  companies?: Company[];
  confirmationMessage?: string;
  onClose: () => void;
  onConfirm?: () => void;
  onAddCompany?: (c: Omit<Company, 'id'>) => void;
  onUpdateCompany?: (c: Company) => void;
  onAddApplication?: (a: Omit<Application, 'id'>) => void;
  onUpdateApplication?: (a: Application) => void;
}

const Modal: React.FC<ModalProps> = ({ 
  type, mode, initialData, companies = [], confirmationMessage, onClose, onConfirm,
  onAddCompany, onUpdateCompany, onAddApplication, onUpdateApplication 
}) => {
  // Company Form State
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cLoc, setCLoc] = useState('');
  const [cSalary, setCSalary] = useState('');
  const [cRange, setCRange] = useState('');
  const [cType, setCType] = useState<CompanyType>('Product');
  const [cRating, setCRating] = useState(3);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isResearching, setIsResearching] = useState(false);

  // Application Form State
  const [appCompanyId, setAppCompanyId] = useState(companies[0]?.id || '');
  const [appPosition, setAppPosition] = useState('');
  const [appDate, setAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [appStatus, setAppStatus] = useState<ApplicationStatus>('Applied');
  const [appNotes, setAppNotes] = useState('');

  // Accessibility IDs
  const formId = useId();

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      if (type === 'company') {
        const c = initialData as Company;
        setCName(c.name);
        setCDesc(c.description);
        setCLoc(c.location);
        setCSalary(c.fresherSalary);
        setCRange(c.employeeRange);
        setCType(c.type);
        setCRating(c.cultureRating);
        setCustomFields(c.customFields);
      } else if (type === 'application') {
        const a = initialData as Application;
        setAppCompanyId(a.companyId);
        setAppPosition(a.position);
        setAppDate(a.dateApplied);
        setAppStatus(a.status);
        setAppNotes(a.notes);
      }
    }
  }, [mode, initialData, type]);

  const handleAISuggest = async () => {
    if (!cName) return;
    setIsResearching(true);
    const data = await researchCompany(cName);
    if (data) {
      setCDesc(data.description || '');
      setCRange(data.employeeRange || '');
      setCSalary(data.fresherSalary || '');
      setCLoc(data.location || '');
      setCType(data.type as CompanyType || 'Product');
      setCRating(data.cultureRating || 3);
    }
    setIsResearching(false);
  };

  const addField = () => setCustomFields([...customFields, { label: '', value: '' }]);
  const updateField = (index: number, key: 'label' | 'value', val: string) => {
    const next = [...customFields];
    next[index][key] = val;
    setCustomFields(next);
  };

  const handleSave = () => {
    if (type === 'company' && onAddCompany && onUpdateCompany) {
      const data = { name: cName, description: cDesc, location: cLoc, fresherSalary: cSalary, employeeRange: cRange, type: cType, cultureRating: cRating, customFields };
      if (mode === 'edit') onUpdateCompany({ ...data, id: initialData.id });
      else onAddCompany(data);
    } else if (type === 'application' && onAddApplication && onUpdateApplication) {
      const data = { companyId: appCompanyId, position: appPosition, dateApplied: appDate, status: appStatus, notes: appNotes };
      if (mode === 'edit') onUpdateApplication({ ...data, id: initialData.id });
      else onAddApplication(data);
    }
  };

  if (type === 'confirmation') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby={`${formId}-title`}>
        <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl p-6 border border-slate-200 animate-in zoom-in-95 duration-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 id={`${formId}-title`} className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-sm text-slate-600 mt-2">{confirmationMessage}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-sm text-slate-700 text-sm font-bold hover:bg-slate-50 focus:ring-2 focus:ring-slate-500">Cancel</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-sm text-sm font-bold hover:bg-rose-700 shadow-sm focus:ring-2 focus:ring-rose-500">Delete</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby={`${formId}-title`}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 id={`${formId}-title`} className="text-xl font-black text-slate-900 tracking-tight italic uppercase">
              {mode === 'edit' ? 'Update' : 'New'} {type === 'company' ? 'Company' : 'Application'}
            </h2>
            <button onClick={onClose} aria-label="Close modal" className="p-2 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors focus:ring-2 focus:ring-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {type === 'company' ? (
            <div className="space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-1">
                  <label htmlFor={`${formId}-cname`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Company Name</label>
                  <input 
                    id={`${formId}-cname`}
                    type="text" 
                    className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleAISuggest}
                  disabled={isResearching || !cName}
                  className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm text-xs font-bold uppercase hover:bg-blue-100 transition-colors h-[38px] disabled:opacity-50 focus:ring-2 focus:ring-blue-500"
                >
                  {isResearching ? '...' : 'AI Research'}
                </button>
              </div>

              <div className="space-y-1">
                <label htmlFor={`${formId}-cdesc`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Description</label>
                <textarea 
                  id={`${formId}-cdesc`}
                  rows={3}
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor={`${formId}-cloc`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Location</label>
                  <input 
                    id={`${formId}-cloc`}
                    type="text" 
                    className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                    value={cLoc}
                    onChange={(e) => setCLoc(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-csalary`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Fresher Pay</label>
                  <input 
                    id={`${formId}-csalary`}
                    type="text" 
                    className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                    value={cSalary}
                    onChange={(e) => setCSalary(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor={`${formId}-ctype`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Type</label>
                  <select 
                    id={`${formId}-ctype`}
                    className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 shadow-sm"
                    value={cType}
                    onChange={(e) => setCType(e.target.value as CompanyType)}
                  >
                    <option>Startup</option>
                    <option>Product</option>
                    <option>Consultancy</option>
                    <option>FAANG</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest block mb-1">Culture (1-5)</span>
                  <div className="flex gap-2 h-[38px] items-center" role="radiogroup" aria-label="Culture Rating">
                    {[1,2,3,4,5].map(v => (
                      <button 
                        key={v} 
                        role="radio"
                        aria-checked={cRating === v}
                        onClick={() => setCRating(v)}
                        aria-label={`Rate ${v} out of 5`}
                        className={`flex-1 h-8 flex items-center justify-center rounded-sm text-xs font-bold border transition-all focus:ring-2 focus:ring-blue-500 ${cRating === v ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Custom Insights</span>
                  <button onClick={addField} className="text-[10px] font-bold text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm p-0.5">Add +</button>
                </div>
                {customFields.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      aria-label={`Custom field label ${i + 1}`}
                      placeholder="e.g. Benefits" 
                      className="flex-1 border border-slate-300 p-2 rounded-sm text-[11px] focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 shadow-sm placeholder:text-slate-400"
                      value={f.label}
                      onChange={(e) => updateField(i, 'label', e.target.value)}
                    />
                    <input 
                      aria-label={`Custom field value ${i + 1}`}
                      placeholder="Value" 
                      className="flex-1 border border-slate-300 p-2 rounded-sm text-[11px] focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 shadow-sm placeholder:text-slate-400"
                      value={f.value}
                      onChange={(e) => updateField(i, 'value', e.target.value)}
                    />
                    <button 
                      onClick={() => setCustomFields(customFields.filter((_, idx) => idx !== i))} 
                      className="p-2 text-slate-400 hover:text-rose-600 focus:text-rose-600 focus:outline-none"
                      aria-label={`Remove custom field ${i + 1}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <label htmlFor={`${formId}-appComp`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Target Company</label>
                <select 
                  id={`${formId}-appComp`}
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 shadow-sm"
                  value={appCompanyId}
                  onChange={(e) => setAppCompanyId(e.target.value)}
                >
                  <option value="" disabled>Choose...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor={`${formId}-appPos`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Applied Role</label>
                <input 
                  id={`${formId}-appPos`}
                  type="text" 
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                  value={appPosition}
                  onChange={(e) => setAppPosition(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor={`${formId}-appDate`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Date</label>
                  <input 
                    id={`${formId}-appDate`}
                    type="date" 
                    className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 shadow-sm"
                    value={appDate}
                    onChange={(e) => setAppDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-appStatus`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Progress</label>
                  <select 
                    id={`${formId}-appStatus`}
                    className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 shadow-sm"
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value as ApplicationStatus)}
                  >
                    <option>Applied</option>
                    <option>Screening</option>
                    <option>Interviewing</option>
                    <option>Technical</option>
                    <option>HR</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                    <option>Ghosted</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor={`${formId}-appNotes`} className="text-xs font-bold text-slate-700 uppercase tracking-widest">Notes</label>
                <textarea 
                  id={`${formId}-appNotes`}
                  rows={4}
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="pt-8 flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-bold text-[11px] uppercase rounded-sm hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-500">Cancel</button>
            <button 
              onClick={handleSave}
              className="flex-[2] px-6 py-3 bg-slate-900 text-white font-bold text-[11px] uppercase rounded-sm hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              {mode === 'edit' ? 'Update' : 'Confirm'} Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
