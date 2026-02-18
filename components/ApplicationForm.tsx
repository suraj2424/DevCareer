import React, { useState, useMemo } from 'react';
import { Application, ApplicationStatus, ApplicationType, ApplicationRole, Company } from '../types';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import CustomDropdown from './CustomDropdown';
import { AlertCircle, Save } from 'lucide-react';

interface ApplicationFormProps {
  initialData?: Application;
  companies: Company[];
  onSave: (application: Omit<Application, 'id'>) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const statusOptions = [
  { value: 'Applied' as ApplicationStatus, label: 'Applied' },
  { value: 'Screening' as ApplicationStatus, label: 'Screening' },
  { value: 'Technical' as ApplicationStatus, label: 'Technical' },
  { value: 'HR' as ApplicationStatus, label: 'HR' },
  { value: 'Interviewing' as ApplicationStatus, label: 'Interviewing' },
  { value: 'Offer' as ApplicationStatus, label: 'Offer' },
  { value: 'Rejected' as ApplicationStatus, label: 'Rejected' },
] as const;

const typeOptions = [
  { value: 'full time' as ApplicationType, label: 'Full Time' },
  { value: 'part time' as ApplicationType, label: 'Part Time' },
  { value: 'internship' as ApplicationType, label: 'Internship' },
  { value: 'contract' as ApplicationType, label: 'Contract' },
] as const;

const roleOptions = [
  { value: 'AI/ML' as ApplicationRole, label: 'AI/ML' },
  { value: 'ML' as ApplicationRole, label: 'ML' },
  { value: 'Data' as ApplicationRole, label: 'Data' },
  { value: 'Frontend' as ApplicationRole, label: 'Frontend' },
  { value: 'Backend' as ApplicationRole, label: 'Backend' },
  { value: 'System' as ApplicationRole, label: 'System' },
  { value: 'Software' as ApplicationRole, label: 'Software' },
  { value: 'Devops' as ApplicationRole, label: 'Devops' },
  { value: 'AI Engineer' as ApplicationRole, label: 'AI Engineer' },
] as const;

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  initialData,
  companies,
  onSave,
  onCancel,
  mode
}) => {
  const [companyId, setCompanyId] = useState(initialData?.companyId || companies[0]?.id || '');
  const [position, setPosition] = useState(initialData?.position || '');
  const [dateApplied, setDateApplied] = useState(initialData?.dateApplied || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ApplicationStatus>(initialData?.status || 'Applied');
  const [type, setType] = useState<ApplicationType>(initialData?.type || 'full time');
  const [role, setRole] = useState<ApplicationRole>(initialData?.role || 'Software');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!companyId) {
      newErrors.companyId = 'Please select a company';
    }
    if (!position.trim()) {
      newErrors.position = 'Position is required';
    }
    if (!dateApplied) {
      newErrors.dateApplied = 'Date applied is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const applicationData = {
      companyId,
      position: position.trim(),
      dateApplied,
      status,
      type,
      role,
      notes: notes.trim()
    };

    onSave(applicationData);
  };

  const companyOptions = useMemo(() => {
    return companies.map((company) => ({
      value: company.id,
      label: company.name
    }));
  }, [companies]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
      aria-label={mode === 'edit' ? 'Edit application' : 'Add new application'}
    >
      <CustomDropdown<string>
        id="application-company"
        label="Company"
        value={companyId}
        onChange={(val) => {
          setCompanyId(val);
          if (errors.companyId) setErrors((prev) => ({ ...prev, companyId: '' }));
        }}
        options={companyOptions}
        placeholder="Select a company…"
        buttonClassName="w-full"
      />
      {errors.companyId && (
        <p
          id="application-company-error"
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" focusable="false" />
          <span>{errors.companyId}</span>
        </p>
      )}

      <Input
        id="application-position"
        label="Position"
        placeholder="e.g., Software Engineer"
        value={position}
        error={errors.position}
        required
        autoComplete="organization-title"
        onChange={(e) => {
          setPosition(e.target.value);
          if (errors.position) setErrors((prev) => ({ ...prev, position: '' }));
        }}
      />

      <Input
        id="application-date"
        label="Date Applied"
        type="date"
        value={dateApplied}
        error={errors.dateApplied}
        required
        onChange={(e) => {
          setDateApplied(e.target.value);
          if (errors.dateApplied) setErrors((prev) => ({ ...prev, dateApplied: '' }));
        }}
      />

      <fieldset>
        <legend className="mb-3 block text-sm font-medium text-slate-700">
          Classification
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CustomDropdown<ApplicationStatus>
            id="application-status"
            label="Status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
            buttonClassName="w-full"
          />

          <CustomDropdown<ApplicationType>
            id="application-type"
            label="Type"
            value={type}
            onChange={setType}
            options={typeOptions}
            buttonClassName="w-full"
          />

          <CustomDropdown<ApplicationRole>
            id="application-role"
            label="Role"
            value={role}
            onChange={setRole}
            options={roleOptions}
            buttonClassName="w-full"
          />

        </div>
      </fieldset>

      <div>
        <label
          htmlFor="application-notes"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Notes
        </label>
        <textarea
          id="application-notes"
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          placeholder="Add any notes about this application…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          <Save className="h-4 w-4 shrink-0" aria-hidden="true" focusable="false" />
          {mode === 'edit' ? 'Update Application' : 'Add Application'}
        </Button>
      </div>
    </form>
  );
};

export default ApplicationForm;
