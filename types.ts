
export type CompanyType = 'Startup' | 'Product' | 'Consultancy' | 'FAANG' | 'Other';

export interface CustomField {
  label: string;
  value: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  employeeRange: string;
  fresherSalary: string;
  location: string;
  type: CompanyType;
  cultureRating: number; // 1-5
  website?: string;
  customFields: CustomField[];
}

export type ApplicationStatus = 'Applied' | 'Screening' | 'Interviewing' | 'Technical' | 'HR' | 'Offer' | 'Rejected' | 'Ghosted';

export type ApplicationType = 'internship' | 'full time' | 'part time';

export type ApplicationRole = 'AI/ML' | 'ML' | 'Data' | 'Frontend' | 'Backend' | 'System' | 'Software' | 'Devops' | 'AI Engineer';

export interface Application {
  id: string;
  companyId: string;
  position: string;
  dateApplied: string;
  status: ApplicationStatus;
  type: ApplicationType;
  role: ApplicationRole;
  notes: string;
  expectedSalary?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
}

export interface UserData {
  user: User;
  companies: Company[];
  applications: Application[];
}

export type ViewState = 'dashboard' | 'applications' | 'companies' | 'company-detail' | 'profile';
