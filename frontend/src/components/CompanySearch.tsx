import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Company } from '@/types/supply-chain';
import { createCompanyFromName } from '@/utils/data-transform';
import { searchCompanies } from '@/services/api';

interface CompanySearchProps {
  onCompanySelect: (company: Company) => void;
  selectedCompany?: Company;
}

export const CompanySearch = ({ onCompanySelect, selectedCompany }: CompanySearchProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchDebounced = async () => {
      if (query.length > 0) {
        setIsLoading(true);
        try {
          const results = await searchCompanies(query);
          setSuggestions(results);
          setShowSuggestions(true);
          setHighlightedIndex(-1);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(searchDebounced, 300); // Debounce search by 300ms
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (companyName: string) => {
    setQuery(companyName);
    setShowSuggestions(false);
    onCompanySelect(createCompanyFromName(companyName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search companies (e.g., AAPL, Apple)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          className="pl-10 terminal-text bg-input border-terminal-grid focus:border-terminal-yellow focus:ring-terminal-yellow"
        />
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 terminal-panel border border-terminal-grid rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-center terminal-text text-muted-foreground">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((companyName, index) => (
              <button
                key={companyName}
                className={`w-full px-3 py-2 text-left terminal-text hover:bg-muted ${
                  index === highlightedIndex ? 'bg-muted' : ''
                }`}
                onClick={() => handleSelect(companyName)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold terminal-highlight">
                      {companyName}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-center terminal-text text-muted-foreground">
              No companies found
            </div>
          )}
        </div>
      )}
    </div>
  );
};