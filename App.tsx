
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ViewState, Company, Application, ApplicationStatus, CompanyType, User, UserData } from './types';
import hybridStorage from './utils/hybridStorage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ApplicationsList from './components/ApplicationsList';
import CompaniesList from './components/CompaniesList';
import CompanyDetail from './components/CompanyDetail';
import Modal from './components/Modal';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Button from './components/ui/Button';
import SearchInput from './components/SearchInput';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalType, setModalType] = useState<'company' | 'application' | 'confirmation'>('application');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // State for delete confirmation
  const [deleteIntent, setDeleteIntent] = useState<{ type: 'company' | 'application', id: string } | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const initializeApp = async () => {
      await hybridStorage.init();
      
      const storedUserId = localStorage.getItem('currentUserId');
      if (storedUserId) {
        const userData = await hybridStorage.exportUserData(storedUserId);
        if (userData) {
          setCurrentUser(userData.user);
          setCompanies(userData.companies);
          setApplications(userData.applications);
          setIsAuthenticated(true);
          await hybridStorage.updateUserLastLogin(storedUserId);
        }
      }
    };
    
    initializeApp();
  }, []);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUserId', user.id);
    
    // Load user data
    const userData = await hybridStorage.exportUserData(user.id);
    if (userData) {
      setCompanies(userData.companies);
      setApplications(userData.applications);
    }
  };

  const handleRegister = async (user: User) => {
    await handleLogin(user);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // Handle search suggestion selection with navigation
  const handleSearchSuggestionSelect = useCallback((suggestion: any) => {
    setSearchQuery(suggestion.text);
    
    // Navigate based on suggestion type
    if (suggestion.type === 'company' && suggestion.data) {
      // Navigate to company detail page
      setSelectedCompanyId(suggestion.data.id);
      setView('company-detail');
    } else if (suggestion.type === 'role' || suggestion.type === 'status' || suggestion.type === 'type') {
      // Navigate to applications page with filter
      setView('applications');
    } else if (suggestion.type === 'location' || suggestion.type === 'salary' || suggestion.type === 'custom') {
      // Navigate to companies page with filter
      setView('companies');
    }
  }, [setSearchQuery, setSelectedCompanyId, setView]);

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCompanies([]);
    setApplications([]);
    localStorage.removeItem('currentUserId');
    setView('dashboard');
  };

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    
    const query = searchQuery.toLowerCase();
    return companies.filter(c => {
      // Basic company info
      const nameMatch = c.name.toLowerCase().includes(query);
      const descriptionMatch = c.description.toLowerCase().includes(query);
      const locationMatch = c.location.toLowerCase().includes(query);
      const employeeRangeMatch = c.employeeRange.toLowerCase().includes(query);
      const salaryMatch = c.fresherSalary.toLowerCase().includes(query);
      const typeMatch = c.type.toLowerCase().includes(query);
      
      // Culture rating (convert to string for search)
      const cultureMatch = c.cultureRating.toString().includes(query);
      
      // Website and careers link
      const websiteMatch = c.website?.toLowerCase().includes(query) ?? false;
      const careersLinkMatch = c.careersLink?.toLowerCase().includes(query) ?? false;
      
      // Custom fields
      const customFieldsMatch = c.customFields.some(field => 
        field.label.toLowerCase().includes(query) || 
        field.value.toLowerCase().includes(query)
      );
      
      return nameMatch || descriptionMatch || locationMatch || 
             employeeRangeMatch || salaryMatch || typeMatch || 
             cultureMatch || websiteMatch || careersLinkMatch || customFieldsMatch;
    });
  }, [companies, searchQuery]);

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    
    const query = searchQuery.toLowerCase();
    return applications.filter(app => {
      const company = companies.find(c => c.id === app.companyId);
      if (!company) return false;
      
      // Application-specific fields
      const roleMatch = app.role.toLowerCase().includes(query);
      const typeMatch = app.type.toLowerCase().includes(query);
      const statusMatch = app.status.toLowerCase().includes(query);
      const notesMatch = app.notes.toLowerCase().includes(query);
      const salaryMatch = app.expectedSalary?.toLowerCase().includes(query) ?? false;
      
      // Company fields (same comprehensive search as filteredCompanies)
      const companyNameMatch = company.name.toLowerCase().includes(query);
      const descriptionMatch = company.description.toLowerCase().includes(query);
      const locationMatch = company.location.toLowerCase().includes(query);
      const employeeRangeMatch = company.employeeRange.toLowerCase().includes(query);
      const companySalaryMatch = company.fresherSalary.toLowerCase().includes(query);
      const typeMatchCompany = company.type.toLowerCase().includes(query);
      const cultureMatch = company.cultureRating.toString().includes(query);
      const websiteMatch = company.website?.toLowerCase().includes(query) ?? false;
      const careersLinkMatch = company.careersLink?.toLowerCase().includes(query) ?? false;
      const customFieldsMatch = company.customFields.some(field => 
        field.label.toLowerCase().includes(query) || 
        field.value.toLowerCase().includes(query)
      );
      
      return roleMatch || typeMatch || statusMatch || notesMatch || salaryMatch ||
             companyNameMatch || descriptionMatch || locationMatch || 
             employeeRangeMatch || companySalaryMatch || typeMatchCompany || 
             cultureMatch || websiteMatch || careersLinkMatch || customFieldsMatch;
    });
  }, [applications, companies, searchQuery]);

  const handleAddCompany = async (newCompany: Omit<Company, 'id'>) => {
    if (!currentUser) return;
    
    const company = { ...newCompany, id: Math.random().toString(36).substr(2, 9) };
    await hybridStorage.saveCompany(currentUser.id, company);
    setCompanies(prev => [...prev, company]);
    setIsModalOpen(false);
  };

  const handleUpdateCompany = async (updatedCompany: Company) => {
    if (!currentUser) return;
    
    await hybridStorage.updateCompany(updatedCompany);
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    setIsModalOpen(false);
  };

  const handleCleanupOrphanedApps = async () => {
    if (!currentUser) return;
    
    const orphanedApps = applications.filter(app => 
      !companies.find(c => c.id === app.companyId)
    );
    
    if (orphanedApps.length === 0) return;
    
    if (confirm(`Delete ${orphanedApps.length} orphaned application${orphanedApps.length !== 1 ? 's' : ''} with missing company data? This action cannot be undone.`)) {
      for (const app of orphanedApps) {
        await hybridStorage.deleteApplication(currentUser.id, app.id);
      }
      setApplications(prev => prev.filter(app => 
        companies.find(c => c.id === app.companyId)
      ));
    }
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

  const handleConfirmDelete = async () => {
    if (!deleteIntent || !currentUser) return;

    if (deleteIntent.type === 'company') {
      const id = deleteIntent.id;
      await hybridStorage.deleteCompany(currentUser.id, id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      setApplications(prev => prev.filter(a => a.companyId !== id));
      if (selectedCompanyId === id) {
        setView('companies');
        setSelectedCompanyId(null);
      }
    } else if (deleteIntent.type === 'application') {
      const id = deleteIntent.id;
      await hybridStorage.deleteApplication(currentUser.id, id);
      setApplications(prev => prev.filter(a => a.id !== id));
    }
    
    setIsModalOpen(false);
    setDeleteIntent(null);
  };

  const handleAddApplication = async (newApp: Omit<Application, 'id'>) => {
    if (!currentUser) return;
    
    const app = { ...newApp, id: Math.random().toString(36).substr(2, 9) };
    await hybridStorage.saveApplication(currentUser.id, app);
    setApplications(prev => [...prev, app]);
    setIsModalOpen(false);
  };

  const handleUpdateApplication = async (updatedApp: Application) => {
    if (!currentUser) return;
    
    await hybridStorage.updateApplication(updatedApp);
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

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login 
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthView('register')}
        />
      );
    } else {
      return (
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        currentView={view} 
        setView={(v) => { setView(v); setSelectedCompanyId(null); }}
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(v => !v)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center flex-1 max-w-xl">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSelectSuggestion={handleSearchSuggestionSelect}
              companies={companies}
              applications={applications}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => openCreateModal('company')}
              variant="outline"
              size="sm"
            >
              Add Company
            </Button>
            <Button 
              onClick={() => openCreateModal('application')}
              variant="primary"
              size="sm"
            >
              New Application
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-6">
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
              onUpdateStatus={async (id, status) => {
                if (currentUser) {
                  await hybridStorage.updateApplicationStatus(currentUser.id, id, status);
                  setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
                }
              }}
              onEdit={(app) => openEditModal('application', app)}
              onDelete={initiateDeleteApplication}
              onCompanyClick={(id) => { setSelectedCompanyId(id); setView('company-detail'); }}
              onCleanupOrphanedApps={handleCleanupOrphanedApps}
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
          {view === 'profile' && currentUser && (
            <Profile 
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
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
