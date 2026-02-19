import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Clock, Building, Briefcase, MapPin, DollarSign, Star, ExternalLink } from 'lucide-react';
import { Company, Application, ApplicationRole, ApplicationType, ApplicationStatus, CompanyType } from '../types';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'company' | 'role' | 'location' | 'type' | 'status' | 'salary' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  data?: any;
}

interface SearchSuggestionsProps {
  query: string;
  companies: Company[];
  applications: Application[];
  onSelect: (suggestion: SearchSuggestion) => void;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  companies,
  applications,
  onSelect,
  isVisible,
  onVisibilityChange,
  onMouseDown,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Generate suggestions based on query
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const q = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];
    const seenTexts = new Set<string>();

    // Company names
    companies.slice(0, 5).forEach(company => {
      if (company.name.toLowerCase().includes(q) && !seenTexts.has(company.name)) {
        suggestions.push({
          id: `company-${company.id}`,
          text: company.name,
          type: 'company',
          icon: Building,
          category: 'Company',
          data: company,
        });
        seenTexts.add(company.name);
      }
    });

    // Locations
    const locationSet = new Set<string>();
    companies.forEach(company => {
      if (company.location && !locationSet.has(company.location)) {
        locationSet.add(company.location);
      }
    });
    const locations = Array.from(locationSet);
    locations.slice(0, 5).forEach(location => {
      if (location.toLowerCase().includes(q) && !seenTexts.has(location)) {
        suggestions.push({
          id: `location-${location}`,
          text: location,
          type: 'location',
          icon: MapPin,
          category: 'Location',
        });
        seenTexts.add(location);
      }
    });

    // Roles
    const roleSet = new Set<string>();
    applications.forEach(app => {
      if (app.role && !roleSet.has(app.role)) {
        roleSet.add(app.role);
      }
    });
    const roles = Array.from(roleSet);
    roles.slice(0, 5).forEach(role => {
      if (role.toLowerCase().includes(q) && !seenTexts.has(role)) {
        suggestions.push({
          id: `role-${role}`,
          text: role,
          type: 'role',
          icon: Briefcase,
          category: 'Role',
        });
        seenTexts.add(role);
      }
    });

    // Application types
    const types: ApplicationType[] = ['internship', 'full time', 'part time'];
    types.forEach(type => {
      if (type.toLowerCase().includes(q) && !seenTexts.has(type)) {
        suggestions.push({
          id: `type-${type}`,
          text: type,
          type: 'type',
          icon: Briefcase,
          category: 'Type',
        });
        seenTexts.add(type);
      }
    });

    // Application statuses
    const statuses: ApplicationStatus[] = ['Applied', 'Screening', 'Interviewing', 'Technical', 'HR', 'Offer', 'Rejected', 'Ghosted'];
    statuses.forEach(status => {
      if (status.toLowerCase().includes(q) && !seenTexts.has(status)) {
        suggestions.push({
          id: `status-${status}`,
          text: status,
          type: 'status',
          icon: Clock,
          category: 'Status',
        });
        seenTexts.add(status);
      }
    });

    // Company types
    const companyTypes: CompanyType[] = ['Startup', 'Product', 'Consultancy', 'FAANG', 'Other'];
    companyTypes.forEach(type => {
      if (type.toLowerCase().includes(q) && !seenTexts.has(type)) {
        suggestions.push({
          id: `company-type-${type}`,
          text: type,
          type: 'type',
          icon: Building,
          category: 'Company Type',
        });
        seenTexts.add(type);
      }
    });

    // Salary ranges
    const salarySet = new Set<string>();
    companies.forEach(company => {
      if (company.fresherSalary && !salarySet.has(company.fresherSalary)) {
        salarySet.add(company.fresherSalary);
      }
    });
    const salaries = Array.from(salarySet);
    salaries.slice(0, 3).forEach(salary => {
      if (salary.toLowerCase().includes(q) && !seenTexts.has(salary)) {
        suggestions.push({
          id: `salary-${salary}`,
          text: salary,
          type: 'salary',
          icon: DollarSign,
          category: 'Salary',
        });
        seenTexts.add(salary);
      }
    });

    // Custom fields
    companies.forEach(company => {
      company.customFields.forEach(field => {
        if ((field.label.toLowerCase().includes(q) || field.value.toLowerCase().includes(q)) && 
            !seenTexts.has(field.value)) {
          suggestions.push({
            id: `custom-${field.label}-${field.value}`,
            text: field.value,
            type: 'custom',
            icon: Star,
            category: field.label,
          });
          seenTexts.add(field.value);
        }
      });
    });

    return suggestions.slice(0, 8); // Limit to 8 suggestions for performance
  }, [query, companies, applications]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion, e: React.MouseEvent) => {
    console.log('Suggestion clicked:', suggestion.text); // Debug log
    e.preventDefault();
    e.stopPropagation();
    onSelect(suggestion);
  }, [onSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isVisible || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          onSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onVisibilityChange(false);
        break;
    }
  }, [isVisible, suggestions, highlightedIndex, onSelect, onVisibilityChange]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onVisibilityChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onVisibilityChange]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-hidden"
      role="listbox"
      aria-label="Search suggestions"
    >
      <ul
        ref={listRef}
        className="py-1"
        role="presentation"
      >
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          const isHighlighted = index === highlightedIndex;
          
          return (
            <li
              key={suggestion.id}
              role="option"
              aria-selected={isHighlighted}
              className={`
                px-3 py-2 cursor-pointer transition-colors
                ${isHighlighted ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-900'}
                focus:outline-none focus:bg-blue-50 focus:text-blue-900
              `}
              onMouseDown={onMouseDown}
              onClick={(e) => handleSuggestionClick(suggestion, e)}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseLeave={() => setHighlightedIndex(-1)}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {suggestion.text}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {suggestion.category}
                  </div>
                </div>
                {suggestion.type === 'company' && suggestion.data?.website && (
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      
      {suggestions.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-500">
            <span aria-live="polite">
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} available
            </span>
            <span className="ml-2">
              Use ↑↓ to navigate, Enter to select, Escape to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchSuggestions);
