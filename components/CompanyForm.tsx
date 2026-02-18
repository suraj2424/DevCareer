import React, { useState } from 'react';
import { Company, CompanyType, CustomField } from '../types';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import CustomDropdown from './CustomDropdown';
import Badge from './ui/Badge';

interface CompanyFormProps {
  initialData?: Company;
  onSave: (company: Omit<Company, 'id'>) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const companyTypeOptions = [
  { value: 'Product' as CompanyType, label: 'Product' },
  { value: 'Service' as CompanyType, label: 'Service' },
  { value: 'Consulting' as CompanyType, label: 'Consulting' },
  { value: 'Startup' as CompanyType, label: 'Startup' },
] as const;

const CompanyForm: React.FC<CompanyFormProps> = ({
  initialData,
  onSave,
  onCancel,
  mode
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [fresherSalary, setFresherSalary] = useState(initialData?.fresherSalary || '');
  const [employeeRange, setEmployeeRange] = useState(initialData?.employeeRange || '');
  const [type, setType] = useState<CompanyType>(initialData?.type || 'Product');
  const [cultureRating, setCultureRating] = useState(initialData?.cultureRating || 3);
  const [customFields, setCustomFields] = useState<CustomField[]>(initialData?.customFields || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addField = () => setCustomFields([...customFields, { label: '', value: '' }]);
  
  const updateField = (index: number, key: 'label' | 'value', val: string) => {
    const next = [...customFields];
    next[index][key] = val;
    setCustomFields(next);
  };

  const removeField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Company name is required';
    }
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!fresherSalary.trim()) {
      newErrors.fresherSalary = 'Fresher salary is required';
    }
    if (!employeeRange.trim()) {
      newErrors.employeeRange = 'Employee range is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const companyData = {
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      fresherSalary: fresherSalary.trim(),
      employeeRange: employeeRange.trim(),
      type,
      cultureRating,
      customFields,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      lastLogin: initialData?.lastLogin || new Date().toISOString()
    };

    onSave(companyData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="company-name"
        label="Company Name"
        placeholder="Enter company name"
        value={name}
        error={errors.name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
        }}
      />

      <div>
        <label htmlFor="company-description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="company-description"
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the company"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="company-location"
          label="Location"
          placeholder="City, Country"
          value={location}
          error={errors.location}
          onChange={(e) => {
            setLocation(e.target.value);
            if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
          }}
        />

        <Input
          id="company-salary"
          label="Fresher Salary"
          placeholder="e.g., $60,000 - $80,000"
          value={fresherSalary}
          error={errors.fresherSalary}
          onChange={(e) => {
            setFresherSalary(e.target.value);
            if (errors.fresherSalary) setErrors(prev => ({ ...prev, fresherSalary: '' }));
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="company-range"
          label="Employee Range"
          placeholder="e.g., 100-500"
          value={employeeRange}
          error={errors.employeeRange}
          onChange={(e) => {
            setEmployeeRange(e.target.value);
            if (errors.employeeRange) setErrors(prev => ({ ...prev, employeeRange: '' }));
          }}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <CustomDropdown<CompanyType>
            value={type}
            onChange={setType}
            options={companyTypeOptions}
            buttonClassName="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Culture Rating</label>
        <div className="flex gap-2" role="radiogroup" aria-label="Culture Rating">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setCultureRating(rating)}
              className={`w-10 h-10 rounded-md border-2 transition-colors ${
                cultureRating === rating
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              aria-label={`Rating ${rating}`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      <Card padding="md">
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-slate-700">Custom Fields</h4>
            <Button type="button" variant="outline" size="sm" onClick={addField}>
              Add Field
            </Button>
          </div>
          <div className="space-y-2">
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) => updateField(index, 'label', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => updateField(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeField(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            {customFields.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No custom fields added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          {mode === 'edit' ? 'Update Company' : 'Add Company'}
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;
