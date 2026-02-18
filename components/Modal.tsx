
import React, { useRef, useState, useEffect, useId } from 'react';
import { Company, Application, CompanyType, ApplicationStatus, ApplicationType, ApplicationRole, CustomField } from '../types';
import CustomDropdown from './CustomDropdown';
import ApplicationForm from './ApplicationForm';
import CompanyForm from './CompanyForm';

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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Accessibility IDs
  const formId = useId();

  useEffect(() => {
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const el = dialogRef.current;
    if (!el) return;

    const focusables = el.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const list = Array.from(
        el.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];

      const filtered = list.filter(
        (n: HTMLElement) => !n.hasAttribute('disabled') && !n.getAttribute('aria-hidden')
      );

      if (filtered.length === 0) return;
      const firstEl = filtered[0];
      const lastEl = filtered[filtered.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [onClose]);

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
      <div ref={dialogRef} className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200" role="document">
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
            <CompanyForm
              initialData={mode === 'edit' ? initialData : undefined}
              onSave={(companyData) => {
                if (mode === 'edit' && onUpdateCompany) {
                  onUpdateCompany({ ...companyData, id: initialData.id });
                } else if (onAddCompany) {
                  onAddCompany(companyData);
                }
              }}
              onCancel={onClose}
              mode={mode}
            />
          ) : type === 'application' ? (
            <ApplicationForm
              initialData={mode === 'edit' ? initialData : undefined}
              companies={companies}
              onSave={(applicationData) => {
                if (mode === 'edit' && onUpdateApplication) {
                  onUpdateApplication({ ...applicationData, id: initialData.id });
                } else if (onAddApplication) {
                  onAddApplication(applicationData);
                }
              }}
              onCancel={onClose}
              mode={mode}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Modal;
