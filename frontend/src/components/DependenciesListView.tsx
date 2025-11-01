import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Company, SupplyChainRelationship } from '@/types/supply-chain';
import { formatCurrency } from '@/data/sample-data';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, Download } from 'lucide-react';

interface DependenciesListViewProps {
  companies: Company[];
  relationships: SupplyChainRelationship[];
  selectedCompany?: Company;
  onCompanyClick: (companyId: string) => void;
}

type SortField = 'company' | 'type' | 'value' | 'direction';
type SortDirection = 'asc' | 'desc' | null;

export const DependenciesListView = ({ 
  companies, 
  relationships, 
  selectedCompany,
  onCompanyClick 
}: DependenciesListViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const enrichedRelationships = useMemo(() => {
    return relationships.map(rel => {
      const fromCompany = companies.find(c => c.id === rel.from);
      const toCompany = companies.find(c => c.id === rel.to);
      
      return {
        ...rel,
        fromCompany,
        toCompany,
        direction: rel.from === selectedCompany?.id ? 'outbound' : 'inbound',
        counterparty: rel.from === selectedCompany?.id ? toCompany : fromCompany,
        counterpartyType: rel.from === selectedCompany?.id ? 'customer' : 'supplier'
      };
    });
  }, [relationships, companies, selectedCompany]);

  const filteredAndSortedRelationships = useMemo(() => {
    let filtered = enrichedRelationships;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(rel => 
        rel.counterparty?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rel.counterparty?.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(rel => rel.counterpartyType === typeFilter);
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'company':
            aValue = a.counterparty?.name || '';
            bValue = b.counterparty?.name || '';
            break;
          case 'type':
            aValue = a.counterpartyType;
            bValue = b.counterpartyType;
            break;
          case 'value':
            aValue = a.value;
            bValue = b.value;
            break;
          case 'direction':
            aValue = a.direction;
            bValue = b.direction;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [enrichedRelationships, searchQuery, typeFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc'
      );
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-3 w-3" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-3 w-3" />;
    return <ArrowUpDown className="h-3 w-3" />;
  };

  const totalValue = filteredAndSortedRelationships.reduce((sum, rel) => sum + rel.value, 0);
  const supplierCount = filteredAndSortedRelationships.filter(rel => rel.counterpartyType === 'supplier').length;
  const customerCount = filteredAndSortedRelationships.filter(rel => rel.counterpartyType === 'customer').length;

  if (!selectedCompany) {
    return (
      <div className="h-full flex items-center justify-center terminal-panel">
        <div className="text-center text-muted-foreground">
          <div className="terminal-text">Select a company to view dependencies</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col terminal-panel">
      {/* Header */}
      <div className="terminal-header border-b border-terminal-grid">
        <div className="flex items-center justify-between">
          <h3 className="terminal-highlight font-bold">DEPENDENCIES LIST</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="terminal-text border-terminal-grid">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 border-b border-terminal-grid space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 terminal-text bg-input border-terminal-grid text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <Button
              size="sm"
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('all')}
              className="h-8 px-3 text-xs terminal-text"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={typeFilter === 'supplier' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('supplier')}
              className="h-8 px-3 text-xs terminal-text"
            >
              Suppliers
            </Button>
            <Button
              size="sm"
              variant={typeFilter === 'customer' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('customer')}
              className="h-8 px-3 text-xs terminal-text"
            >
              Customers
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-6 text-xs terminal-text">
          <span>Total: <span className="terminal-highlight">{formatCurrency(totalValue)}</span></span>
          <span>Suppliers: <span className="terminal-success">{supplierCount}</span></span>
          <span>Customers: <span className="terminal-info">{customerCount}</span></span>
          <span>Records: <span className="terminal-warning">{filteredAndSortedRelationships.length}</span></span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full data-grid">
          <thead className="sticky top-0">
            <tr>
              <th className="text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('company')}
                  className="h-6 p-1 terminal-text hover:bg-muted"
                >
                  Company {getSortIcon('company')}
                </Button>
              </th>
              <th className="text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('type')}
                  className="h-6 p-1 terminal-text hover:bg-muted"
                >
                  Type {getSortIcon('type')}
                </Button>
              </th>
              <th className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('value')}
                  className="h-6 p-1 terminal-text hover:bg-muted"
                >
                  Value {getSortIcon('value')}
                </Button>
              </th>
              <th className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('direction')}
                  className="h-6 p-1 terminal-text hover:bg-muted"
                >
                  Flow {getSortIcon('direction')}
                </Button>
              </th>
              <th className="text-left w-16">Industry</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRelationships.map((rel) => (
              <tr 
                key={rel.id} 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => rel.counterparty && onCompanyClick(rel.counterparty.id)}
              >
                <td className="font-medium">
                  <div>
                    <div className="terminal-highlight">{rel.counterparty?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {rel.counterparty?.ticker}
                    </div>
                  </div>
                </td>
                <td>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      rel.counterpartyType === 'supplier' 
                        ? 'border-terminal-green text-terminal-green'
                        : 'border-terminal-blue text-terminal-blue'
                    }`}
                  >
                    {rel.counterpartyType}
                  </Badge>
                </td>
                <td className="text-right font-mono">
                  <div className={`font-semibold ${
                    rel.value > 15000000000 
                      ? 'text-destructive'
                      : rel.value > 8000000000
                        ? 'terminal-warning'
                        : 'terminal-success'
                  }`}>
                    {formatCurrency(rel.value)}
                  </div>
                </td>
                <td className="text-center">
                  <div className={`text-xs ${
                    rel.direction === 'inbound' ? 'terminal-success' : 'terminal-info'
                  }`}>
                    {rel.direction === 'inbound' ? '← IN' : 'OUT →'}
                  </div>
                </td>
                <td className="text-xs text-muted-foreground">
                  {rel.counterparty?.industry.split(' ')[0]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedRelationships.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-muted-foreground">
              <div className="terminal-text">No dependencies found</div>
              <div className="text-xs mt-1">Try adjusting your search or filters</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};