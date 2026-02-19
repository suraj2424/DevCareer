import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import SearchSuggestions from './SearchSuggestions';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'company' | 'role' | 'location' | 'type' | 'status' | 'salary' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  data?: any;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: any) => void;
  placeholder?: string;
  companies: any[];
  applications: any[];
  className?: string;
  debounceMs?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "Search companies, applications, roles, locations, salaries...",
  companies,
  applications,
  className = "",
  debounceMs = 300,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Debounce search input for performance (Core Web Vitals)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, debounceMs]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    console.log('Suggestion selected:', suggestion.text); // Debug log
    onChange(suggestion.text);
    
    // Call navigation callback if provided
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
    
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [onChange, onSelectSuggestion]);

  // Handle input changes with accessibility announcements
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Announce to screen readers when suggestions are available
    if (newValue.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, []);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (value.length >= 2) {
      setShowSuggestions(true);
    }
  }, [value]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't blur immediately - give time for click events to process
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowSuggestions(false);
      }
    }, 200); // Increased timeout
  }, []);

  // Handle mousedown on suggestions to prevent blur
  const handleSuggestionMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Clear search
  const handleClear = useCallback(() => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [onChange]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search 
            className="h-5 w-5 text-slate-400" 
            aria-hidden="true"
          />
        </div>

        {/* Main search input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg
            text-sm placeholder-slate-500 text-slate-900
            bg-white shadow-sm
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            focus:shadow-md
            hover:border-slate-400
            disabled:bg-slate-50 disabled:text-slate-500
            ${isFocused ? 'border-blue-500' : ''}
          `}
          aria-label="Search companies and applications"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-describedby="search-help"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          role="combobox"
          enterKeyHint="search"
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Clear search"
            title="Clear search"
          >
            <X 
              className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" 
              aria-hidden="true"
            />
          </button>
        )}

        {/* Loading indicator for debounced search */}
        {value !== debouncedValue && (
          <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
            <div 
              className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Search suggestions dropdown */}
      <SearchSuggestions
        query={debouncedValue}
        companies={companies}
        applications={applications}
        onSelect={handleSuggestionSelect}
        isVisible={showSuggestions && isFocused}
        onVisibilityChange={setShowSuggestions}
        onMouseDown={handleSuggestionMouseDown}
      />

      {/* Help text for screen readers */}
      <div 
        id="search-help" 
        className="sr-only"
        aria-live="polite"
      >
        Start typing to search companies and applications. Use arrow keys to navigate suggestions, Enter to select, Escape to close.
      </div>

      {/* Status announcement for screen readers */}
      <div 
        className="sr-only" 
        aria-live="assertive"
        aria-atomic="true"
      >
        {showSuggestions && debouncedValue.length >= 2 && 
          `Search suggestions available for "${debouncedValue}"`
        }
      </div>
    </div>
  );
};

export default React.memo(SearchInput);
