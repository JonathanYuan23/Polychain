import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Company } from '@/types/supply-chain';
import { searchCompanies } from '@/data/sample-data';

interface CompanySearchProps {
  onCompanySelect: (company: Company) => void;
  selectedCompany?: Company;
}

export const CompanySearch = ({ onCompanySelect, selectedCompany }: CompanySearchProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const results = searchCompanies(query);
      setSuggestions(results);
      setShowSuggestions(true);
      setHighlightedIndex(-1);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [query]);

  const handleSelect = (company: Company) => {
    setQuery(`${company.name} (${company.ticker})`);
    setShowSuggestions(false);
    onCompanySelect(company);
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

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 terminal-panel border border-terminal-grid rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((company, index) => (
            <button
              key={company.id}
              className={`w-full px-3 py-2 text-left terminal-text hover:bg-muted ${
                index === highlightedIndex ? 'bg-muted' : ''
              }`}
              onClick={() => handleSelect(company)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold terminal-highlight">
                    {company.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {company.ticker} • {company.industry}
                  </div>
                </div>
                {company.market_cap && (
                  <div className="text-xs terminal-success">
                    {(company.market_cap / 1000000000).toFixed(1)}B
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};