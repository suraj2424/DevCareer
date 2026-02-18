import { User, UserData, Company, Application } from '../types';
import indexedDBStorage from './indexedDBStorage';

class HybridStorage {
  private static instance: HybridStorage;
  private useIndexedDB: boolean = false;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): HybridStorage {
    if (!HybridStorage.instance) {
      HybridStorage.instance = new HybridStorage();
    }
    return HybridStorage.instance;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    // Check if IndexedDB is available and initialize
    if (typeof indexedDB !== 'undefined') {
      try {
        await indexedDBStorage.init();
        this.useIndexedDB = true;
        console.log('Using IndexedDB for storage');
      } catch (error) {
        console.warn('IndexedDB initialization failed, falling back to localStorage:', error);
        this.useIndexedDB = false;
      }
    } else {
      console.warn('IndexedDB not supported, using localStorage');
      this.useIndexedDB = false;
    }

    this.isInitialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  // User operations
  async saveUser(user: User & { password: string }): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.saveUser(user);
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      users[user.email] = user;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  async getUser(email: string): Promise<(User & { password: string }) | null> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.getUser(email);
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      return users[email] || null;
    }
  }

  async userExists(email: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.userExists(email);
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      return !!users[email];
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      // IndexedDB handles this automatically when getting user
      return;
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const userKey = Object.keys(users).find(key => users[key].id === userId);
      
      if (userKey) {
        users[userKey].lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  }

  // Company operations
  async saveCompany(userId: string, company: Company): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.saveCompany(userId, company);
    } else {
      const userData = this.getUserDataFromLS(userId);
      userData.companies.push(company);
      this.saveUserDataToLS(userId, userData);
    }
  }

  async getCompanies(userId: string): Promise<Company[]> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.getCompanies(userId);
    } else {
      const userData = this.getUserDataFromLS(userId);
      return userData.companies;
    }
  }

  async updateCompany(company: Company): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.updateCompany(company);
    } else {
      const userId = this.getCurrentUserId();
      if (!userId) throw new Error('No user logged in');
      
      const userData = this.getUserDataFromLS(userId);
      userData.companies = userData.companies.map(c => 
        c.id === company.id ? company : c
      );
      this.saveUserDataToLS(userId, userData);
    }
  }

  async deleteCompany(userId: string, companyId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.deleteCompany(userId, companyId);
    } else {
      const userData = this.getUserDataFromLS(userId);
      userData.companies = userData.companies.filter(c => c.id !== companyId);
      userData.applications = userData.applications.filter(a => a.companyId !== companyId);
      this.saveUserDataToLS(userId, userData);
    }
  }

  // Application operations
  async saveApplication(userId: string, application: Application): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.saveApplication(userId, application);
    } else {
      const userData = this.getUserDataFromLS(userId);
      userData.applications.push(application);
      this.saveUserDataToLS(userId, userData);
    }
  }

  async getApplications(userId: string): Promise<Application[]> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.getApplications(userId);
    } else {
      const userData = this.getUserDataFromLS(userId);
      return userData.applications;
    }
  }

  async updateApplication(application: Application): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.updateApplication(application);
    } else {
      const userId = this.getCurrentUserId();
      if (!userId) throw new Error('No user logged in');
      
      const userData = this.getUserDataFromLS(userId);
      userData.applications = userData.applications.map(a => 
        a.id === application.id ? application : a
      );
      this.saveUserDataToLS(userId, userData);
    }
  }

  async deleteApplication(userId: string, applicationId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.deleteApplication(userId, applicationId);
    } else {
      const userData = this.getUserDataFromLS(userId);
      userData.applications = userData.applications.filter(a => a.id !== applicationId);
      this.saveUserDataToLS(userId, userData);
    }
  }

  async updateApplicationStatus(userId: string, applicationId: string, status: Application['status']): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.updateApplicationStatus(userId, applicationId, status);
    } else {
      const userData = this.getUserDataFromLS(userId);
      userData.applications = userData.applications.map(a => 
        a.id === applicationId ? { ...a, status } : a
      );
      this.saveUserDataToLS(userId, userData);
    }
  }

  // Search operations
  async searchCompanies(userId: string, query: string): Promise<Company[]> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.searchCompanies(userId, query);
    } else {
      const userData = this.getUserDataFromLS(userId);
      const lowerQuery = query.toLowerCase();
      
      return userData.companies.filter(company => 
        company.name.toLowerCase().includes(lowerQuery) ||
        company.location.toLowerCase().includes(lowerQuery)
      );
    }
  }

  async searchApplications(userId: string, query: string, companies: Company[]): Promise<Application[]> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.searchApplications(userId, query, companies);
    } else {
      const userData = this.getUserDataFromLS(userId);
      const lowerQuery = query.toLowerCase();
      
      return userData.applications.filter(app => {
        const company = companies.find(c => c.id === app.companyId);
        return (
          app.position.toLowerCase().includes(lowerQuery) ||
          (company?.name.toLowerCase().includes(lowerQuery) ?? false)
        );
      });
    }
  }

  // Export/Import
  async exportUserData(userId: string): Promise<UserData | null> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.exportUserData(userId);
    } else {
      const userData = this.getUserDataFromLS(userId);
      return userData;
    }
  }

  async importUserData(userId: string, jsonData: string): Promise<boolean> {
    await this.ensureInitialized();
    
    try {
      const userData: UserData = JSON.parse(jsonData);
      
      if (!userData.user || !userData.companies || !userData.applications) {
        return false;
      }

      if (this.useIndexedDB) {
        // Clear existing data first
        const existingCompanies = await indexedDBStorage.getCompanies(userId);
        const existingApplications = await indexedDBStorage.getApplications(userId);
        
        for (const company of existingCompanies) {
          await indexedDBStorage.deleteCompany(userId, company.id);
        }
        
        for (const app of existingApplications) {
          await indexedDBStorage.deleteApplication(userId, app.id);
        }

        // Import new data
        for (const company of userData.companies) {
          await indexedDBStorage.saveCompany(userId, company);
        }
        
        for (const app of userData.applications) {
          await indexedDBStorage.saveApplication(userId, app);
        }
      } else {
        this.saveUserDataToLS(userId, userData);
      }
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  // Performance monitoring
  getStorageInfo(): { type: string; estimatedSize: string; features: string[] } {
    if (this.useIndexedDB) {
      return {
        type: 'IndexedDB',
        estimatedSize: '~50MB+ (browser dependent)',
        features: [
          'Async operations',
          'Indexing for fast queries',
          'Large storage capacity',
          'Transaction support',
          'Background operations'
        ]
      };
    } else {
      const used = JSON.stringify(localStorage).length;
      const available = 5 * 1024 * 1024; // 5MB estimate
      const percentage = ((used / available) * 100).toFixed(2);
      
      return {
        type: 'localStorage',
        estimatedSize: `${used} bytes used (${percentage}% of ~5MB)`,
        features: [
          'Synchronous operations',
          'Simple API',
          'Universal browser support',
          'Session persistence'
        ]
      };
    }
  }

  // Private localStorage helpers
  private getUserDataFromLS(userId: string): UserData {
    const data = localStorage.getItem(`userData_${userId}`);
    return data ? JSON.parse(data) : { user: { id: userId, email: '', name: '', createdAt: '', lastLogin: '' }, companies: [], applications: [] };
  }

  private saveUserDataToLS(userId: string, userData: UserData): void {
    localStorage.setItem(`userData_${userId}`, JSON.stringify(userData));
  }

  private getCurrentUserId(): string | null {
    return localStorage.getItem('currentUserId');
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return indexedDBStorage.clearAllData();
    } else {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('userData_') || key === 'users') {
          localStorage.removeItem(key);
        }
      });
    }
  }
}

export default HybridStorage.getInstance();
