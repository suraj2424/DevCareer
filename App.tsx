
import React, { useState, useMemo, useEffect } from 'react';
import { ViewState, Company, Application, ApplicationStatus, CompanyType, User, UserData } from './types';
import hybridStorage from './utils/hybridStorage';
import { Search } from 'lucide-react';
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
import Input from './components/ui/Input';

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

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCompanies([]);
    setApplications([]);
    localStorage.removeItem('currentUserId');
    setView('dashboard');
  };

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
            <Input
              type="text"
              placeholder="Search..."
              aria-label="Search companies and applications"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              icon={<Search className="w-5 h-5 text-slate-700" />}
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
