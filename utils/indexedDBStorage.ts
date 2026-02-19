import { User, UserData, Company, Application } from '../types';

class IndexedDBStorage {
  private static instance: IndexedDBStorage;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'DevCareerDB';
  private readonly DB_VERSION = 1;
  private readonly STORES = {
    users: 'users',
    companies: 'companies',
    applications: 'applications'
  };

  private constructor() {}

  static getInstance(): IndexedDBStorage {
    if (!IndexedDBStorage.instance) {
      IndexedDBStorage.instance = new IndexedDBStorage();
    }
    return IndexedDBStorage.instance;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create users store
        if (!db.objectStoreNames.contains(this.STORES.users)) {
          const userStore = db.createObjectStore(this.STORES.users, { keyPath: 'email' });
          userStore.createIndex('id', 'id', { unique: true });
        }

        // Create companies store
        if (!db.objectStoreNames.contains(this.STORES.companies)) {
          const companyStore = db.createObjectStore(this.STORES.companies, { keyPath: 'id' });
          companyStore.createIndex('userId', 'userId', { unique: false });
          companyStore.createIndex('name', 'name', { unique: false });
          companyStore.createIndex('location', 'location', { unique: false });
        }

        // Create applications store
        if (!db.objectStoreNames.contains(this.STORES.applications)) {
          const appStore = db.createObjectStore(this.STORES.applications, { keyPath: 'id' });
          appStore.createIndex('userId', 'userId', { unique: false });
          appStore.createIndex('companyId', 'companyId', { unique: false });
          appStore.createIndex('status', 'status', { unique: false });
          appStore.createIndex('dateApplied', 'dateApplied', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // User operations
  async saveUser(user: User & { password: string }): Promise<void> {
    const store = await this.getStore(this.STORES.users, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(user);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(email: string): Promise<(User & { password: string }) | null> {
    const store = await this.getStore(this.STORES.users);
    return new Promise((resolve, reject) => {
      const request = store.get(email);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async userExists(email: string): Promise<boolean> {
    const user = await this.getUser(email);
    return user !== null;
  }

  // Company operations
  async saveCompany(userId: string, company: Company): Promise<void> {
    const store = await this.getStore(this.STORES.companies, 'readwrite');
    const companyWithUser = { ...company, userId };
    return new Promise((resolve, reject) => {
      const request = store.put(companyWithUser);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCompanies(userId: string): Promise<Company[]> {
    const store = await this.getStore(this.STORES.companies);
    return new Promise((resolve, reject) => {
      const request = store.index('userId').getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateCompany(company: Company): Promise<void> {
    const store = await this.getStore(this.STORES.companies, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(company);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCompany(userId: string, companyId: string): Promise<void> {
    const store = await this.getStore(this.STORES.companies, 'readwrite');
    
    // Delete company
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(companyId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Delete associated applications
    await this.deleteApplicationsByCompany(userId, companyId);
  }

  // Application operations
  async saveApplication(userId: string, application: Application): Promise<void> {
    const store = await this.getStore(this.STORES.applications, 'readwrite');
    const appWithUser = { ...application, userId };
    return new Promise((resolve, reject) => {
      const request = store.put(appWithUser);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getApplications(userId: string): Promise<Application[]> {
    const store = await this.getStore(this.STORES.applications);
    return new Promise((resolve, reject) => {
      const request = store.index('userId').getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateApplication(application: Application): Promise<void> {
    const store = await this.getStore(this.STORES.applications, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(application);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteApplication(userId: string, applicationId: string): Promise<void> {
    const store = await this.getStore(this.STORES.applications, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(applicationId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteApplicationsByCompany(userId: string, companyId: string): Promise<void> {
    const store = await this.getStore(this.STORES.applications, 'readwrite');
    const applications = await this.getApplications(userId);
    const appsToDelete = applications.filter(app => app.companyId === companyId);
    
    const promises = appsToDelete.map(app => 
      new Promise<void>((resolve, reject) => {
        const request = store.delete(app.id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    );
    
    await Promise.all(promises);
  }

  async updateApplicationStatus(userId: string, applicationId: string, status: Application['status']): Promise<void> {
    const store = await this.getStore(this.STORES.applications, 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(applicationId);
      getRequest.onsuccess = () => {
        const app = getRequest.result;
        if (app && app.userId === userId) {
          app.status = status;
          const updateRequest = store.put(app);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Application not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Search operations
  async searchCompanies(userId: string, query: string): Promise<Company[]> {
    const store = await this.getStore(this.STORES.companies);
    const companies = await this.getCompanies(userId);
    const lowerQuery = query.toLowerCase();
    
    return companies.filter(company => 
      company.name.toLowerCase().includes(lowerQuery) ||
      company.location.toLowerCase().includes(lowerQuery)
    );
  }

  async searchApplications(userId: string, query: string, companies: Company[]): Promise<Application[]> {
    const store = await this.getStore(this.STORES.applications);
    const applications = await this.getApplications(userId);
    const lowerQuery = query.toLowerCase();
    
    return applications.filter(app => {
      const company = companies.find(c => c.id === app.companyId);
      return (
        app.role.toLowerCase().includes(lowerQuery) ||
        (company?.name.toLowerCase().includes(lowerQuery) ?? false)
      );
    });
  }

  // Export/Import
  async exportUserData(userId: string): Promise<UserData | null> {
    const [companies, applications] = await Promise.all([
      this.getCompanies(userId),
      this.getApplications(userId)
    ]);

    const user = await this.getUserById(userId);
    
    if (!user) return null;

    return {
      user: { ...user, lastLogin: new Date().toISOString() },
      companies,
      applications
    };
  }

  private async getUserById(userId: string): Promise<User | null> {
    const store = await this.getStore(this.STORES.users);
    return new Promise((resolve, reject) => {
      const request = store.index('id').get(userId);
      request.onsuccess = () => {
        const user = request.result;
        if (user) {
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();
    
    const stores = Object.values(this.STORES);
    const transaction = this.db!.transaction(stores, 'readwrite');
    
    const promises = stores.map(store => 
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(store).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    );
    
    await Promise.all(promises);
  }
}

export default IndexedDBStorage.getInstance();
