
import React, { useState, useMemo } from 'react';
import { ViewState, Company, Application, ApplicationStatus, CompanyType } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ApplicationsList from './components/ApplicationsList';
import CompaniesList from './components/CompaniesList';
import CompanyDetail from './components/CompanyDetail';
import Modal from './components/Modal';

const INITIAL_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'TechFlow Systems',
    description: 'A cutting-edge SaaS provider focusing on automation and cloud infrastructure.',
    employeeRange: '100-500',
    fresherSalary: '₹12-15 LPA',
    location: 'Bangalore, India',
    type: 'Product',
    cultureRating: 4,
    customFields: [{ label: 'Tech Stack', value: 'React, Go, AWS' }]
  },
  {
    id: '2',
    name: 'GlobalConsult',
    description: 'Boutique consultancy for Fortune 500 companies specializing in digital transformation.',
    employeeRange: '1000+',
    fresherSalary: '₹6-8 LPA',
    location: 'Remote',
    type: 'Consultancy',
    cultureRating: 3,
    customFields: []
  }
];

const INITIAL_APPS: Application[] = [
  {
    id: '101',
    companyId: '1',
    position: 'Frontend Engineer Intern',
    dateApplied: '2023-11-15',
    status: 'Interviewing',
    notes: 'Technical round scheduled for Monday.'
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalType, setModalType] = useState<'company' | 'application' | 'confirmation'>('application');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // State for delete confirmation
  const [deleteIntent, setDeleteIntent] = useState<{ type: 'company' | 'application', id: string } | null>(null);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companies, searchQuery]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const company = companies.find(c => c.id === app.companyId);
      return (
        app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    });
  }, [applications, companies, searchQuery]);

  const handleAddCompany = (newCompany: Omit<Company, 'id'>) => {
    const company = { ...newCompany, id: Math.random().toString(36).substr(2, 9) };
    setCompanies(prev => [...prev, company]);
    setIsModalOpen(false);
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    setIsModalOpen(false);
  };

  const initiateDeleteCompany = (id: string) => {
    setDeleteIntent({ type: 'company', id });
    setModalType('confirmation');
    setIsModalOpen(true);
  };

  const initiateDeleteApplication = (id: string) => {
    setDeleteIntent({ type: 'application', id });
    setModalType('confirmation');
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteIntent) return;

    if (deleteIntent.type === 'company') {
      const id = deleteIntent.id;
      setCompanies(prev => prev.filter(c => c.id !== id));
      setApplications(prev => prev.filter(a => a.companyId !== id));
      if (selectedCompanyId === id) {
        setView('companies');
        setSelectedCompanyId(null);
      }
    } else if (deleteIntent.type === 'application') {
      const id = deleteIntent.id;
      setApplications(prev => prev.filter(a => a.id !== id));
    }
    
    setIsModalOpen(false);
    setDeleteIntent(null);
  };

  const handleAddApplication = (newApp: Omit<Application, 'id'>) => {
    const app = { ...newApp, id: Math.random().toString(36).substr(2, 9) };
    setApplications(prev => [...prev, app]);
    setIsModalOpen(false);
  };

  const handleUpdateApplication = (updatedApp: Application) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    setIsModalOpen(false);
  };

  const openEditModal = (type: 'company' | 'application', item: any) => {
    setModalType(type);
    setModalMode('edit');
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openCreateModal = (type: 'company' | 'application') => {
    setModalType(type);
    setModalMode('create');
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar currentView={view} setView={(v) => { setView(v); setSelectedCompanyId(null); }} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center flex-1 max-w-xl">
            <svg className="w-5 h-5 text-slate-400 absolute ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search..." 
              aria-label="Search companies and applications"
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 rounded-sm text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => openCreateModal('company')}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-sm hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Add Company
            </button>
            <button 
              onClick={() => openCreateModal('application')}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              New App
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {view === 'dashboard' && (
            <Dashboard 
              apps={applications} 
              companies={companies} 
              onViewApps={() => setView('applications')}
            />
          )}
          {view === 'applications' && (
            <ApplicationsList 
              apps={filteredApps} 
              companies={companies} 
              onUpdateStatus={(id, status) => {
                setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
              }}
              onEdit={(app) => openEditModal('application', app)}
              onDelete={initiateDeleteApplication}
            />
          )}
          {view === 'companies' && (
            <CompaniesList 
              companies={filteredCompanies} 
              onViewDetail={(id) => { setSelectedCompanyId(id); setView('company-detail'); }}
              onEdit={(company) => openEditModal('company', company)}
              onDelete={initiateDeleteCompany}
            />
          )}
          {view === 'company-detail' && selectedCompanyId && (
            <CompanyDetail 
              company={companies.find(c => c.id === selectedCompanyId)!}
              applications={applications.filter(a => a.companyId === selectedCompanyId)}
              onBack={() => setView('companies')}
              onEdit={(c) => openEditModal('company', c)}
              onDelete={initiateDeleteCompany}
            />
          )}
        </div>
      </main>

      {isModalOpen && (
        <Modal 
          type={modalType} 
          mode={modalMode}
          initialData={editingItem}
          companies={companies}
          confirmationMessage={
            deleteIntent?.type === 'company' 
            ? 'Are you sure you want to delete this company? All associated applications will also be permanently removed.' 
            : 'Are you sure you want to delete this application record?'
          }
          onClose={() => { setIsModalOpen(false); setDeleteIntent(null); }}
          onConfirm={handleConfirmDelete}
          onAddCompany={handleAddCompany}
          onUpdateCompany={handleUpdateCompany}
          onAddApplication={handleAddApplication}
          onUpdateApplication={handleUpdateApplication}
        />
      )}
    </div>
  );
};

export default App;
