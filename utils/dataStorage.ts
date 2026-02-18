import { User, UserData, Company, Application } from '../types';

export class DataStorage {
  private static instance: DataStorage;
  
  private constructor() {}
  
  static getInstance(): DataStorage {
    if (!DataStorage.instance) {
      DataStorage.instance = new DataStorage();
    }
    return DataStorage.instance;
  }

  // User authentication data
  saveUser(user: User, password: string): void {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[user.email] = { ...user, password };
    localStorage.setItem('users', JSON.stringify(users));
  }

  getUser(email: string, password: string): User | null {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[email];
    
    if (userData && userData.password === password) {
      const { password: _, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    }
    
    return null;
  }

  userExists(email: string): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return !!users[email];
  }

  updateUserLastLogin(userId: string): void {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userKey = Object.keys(users).find(key => users[key].id === userId);
    
    if (userKey) {
      users[userKey].lastLogin = new Date().toISOString();
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  // User data storage
  saveUserData(userId: string, userData: UserData): void {
    localStorage.setItem(`userData_${userId}`, JSON.stringify(userData));
  }

  getUserData(userId: string): UserData | null {
    const data = localStorage.getItem(`userData_${userId}`);
    return data ? JSON.parse(data) : null;
  }

  // Company operations
  saveCompany(userId: string, company: Company): void {
    const userData = this.getUserData(userId);
    if (userData) {
      userData.companies.push(company);
      this.saveUserData(userId, userData);
    }
  }

  updateCompany(userId: string, updatedCompany: Company): void {
    const userData = this.getUserData(userId);
    if (userData) {
      userData.companies = userData.companies.map(c => 
        c.id === updatedCompany.id ? updatedCompany : c
      );
      this.saveUserData(userId, userData);
    }
  }

  deleteCompany(userId: string, companyId: string): void {
    const userData = this.getUserData(userId);
    if (userData) {
      userData.companies = userData.companies.filter(c => c.id !== companyId);
      userData.applications = userData.applications.filter(a => a.companyId !== companyId);
      this.saveUserData(userId, userData);
    }
  }

  // Application operations
  saveApplication(userId: string, application: Application): void {
    const userData = this.getUserData(userId);
    if (userData) {
      userData.applications.push(application);
      this.saveUserData(userId, userData);
    }
  }

  updateApplication(userId: string, updatedApplication: Application): void {
    const userData = this.getUserData(userId);
    if (userData) {
      userData.applications = userData.applications.map(a => 
        a.id === updatedApplication.id ? updatedApplication : a
      );
      this.saveUserData(userId, userData);
    }
  }

  deleteApplication(userId: string, applicationId: string): void {
    const userData = this.getUserData(userId);
    if (userData) {
      userData.applications = userData.applications.filter(a => a.id !== applicationId);
      this.saveUserData(userId, userData);
    }
  }

  updateApplicationStatus(userId: string, applicationId: string, status: Application['status']): void {
    const userData = this.getUserData(userId);
    if (userData) {
      userData.applications = userData.applications.map(a => 
        a.id === applicationId ? { ...a, status } : a
      );
      this.saveUserData(userId, userData);
    }
  }

  // Export/Import functionality
  exportUserData(userId: string): string | null {
    const userData = this.getUserData(userId);
    return userData ? JSON.stringify(userData, null, 2) : null;
  }

  importUserData(userId: string, jsonData: string): boolean {
    try {
      const userData: UserData = JSON.parse(jsonData);
      // Validate data structure
      if (userData.user && userData.companies && userData.applications) {
        this.saveUserData(userId, userData);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Clear all data (for testing)
  clearAllData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('userData_') || key === 'users') {
        localStorage.removeItem(key);
      }
    });
  }
}

export default DataStorage.getInstance();
