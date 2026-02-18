
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

export interface Application {
  id: string;
  companyId: string;
  position: string;
  dateApplied: string;
  status: ApplicationStatus;
  notes: string;
  expectedSalary?: string;
}

export type ViewState = 'dashboard' | 'applications' | 'companies' | 'company-detail';
