import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings, Filter, Layers, Zap } from 'lucide-react';

interface ControlPanelProps {
  networkDepth: number;
  onNetworkDepthChange: (depth: number) => void;
  minValue: number;
  onMinValueChange: (value: number) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

export const ControlPanel = ({
  networkDepth,
  onNetworkDepthChange,
  minValue,
  onMinValueChange,
  selectedFilters,
  onFilterChange
}: ControlPanelProps) => {
  const filterOptions = [
    { value: 'suppliers', label: 'Suppliers' },
    { value: 'customers', label: 'Customers' },
    { value: 'partners', label: 'Partners' },
    { value: 'high_value', label: 'High Value (>$10B)' },
    { value: 'medium_value', label: 'Medium Value ($1B-$10B)' },
    { value: 'low_value', label: 'Low Value (<$1B)' }
  ];

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      onFilterChange(selectedFilters.filter(f => f !== filter));
    } else {
      onFilterChange([...selectedFilters, filter]);
    }
  };

  return (
    <div className="terminal-panel p-4 space-y-4">
      <div className="terminal-header">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="terminal-highlight font-semibold">NETWORK CONTROLS</span>
        </div>
      </div>

      {/* Network Depth */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-terminal-blue" />
          <label className="terminal-text text-sm font-medium">Network Depth</label>
        </div>
        <Select 
          value={networkDepth.toString()} 
          onValueChange={(value) => onNetworkDepthChange(parseInt(value))}
        >
          <SelectTrigger className="terminal-text bg-input border-terminal-grid">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="terminal-panel border-terminal-grid">
            <SelectItem value="1">Direct relationships only</SelectItem>
            <SelectItem value="2">2 degrees of separation</SelectItem>
            <SelectItem value="3">3 degrees of separation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Minimum Value Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-terminal-orange" />
          <label className="terminal-text text-sm font-medium">
            Min Relationship Value: ${(minValue / 1000000000).toFixed(1)}B
          </label>
        </div>
        <Slider
          value={[minValue]}
          onValueChange={([value]) => onMinValueChange(value)}
          max={20000000000}
          min={0}
          step={1000000000}
          className="w-full"
        />
      </div>

      {/* Relationship Type Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-terminal-green" />
          <label className="terminal-text text-sm font-medium">Relationship Filters</label>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <Badge
              key={option.value}
              variant={selectedFilters.includes(option.value) ? "default" : "outline"}
              className={`cursor-pointer terminal-text text-xs ${
                selectedFilters.includes(option.value)
                  ? 'bg-terminal-yellow text-black hover:bg-terminal-yellow/80'
                  : 'border-terminal-grid hover:bg-muted'
              }`}
              onClick={() => toggleFilter(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <label className="terminal-text text-sm font-medium">Quick Actions</label>
        <div className="space-y-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start terminal-text border-terminal-grid hover:bg-muted"
            onClick={() => {
              onNetworkDepthChange(1);
              onMinValueChange(0);
              onFilterChange(['suppliers', 'customers']);
            }}
          >
            Reset to Default View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start terminal-text border-terminal-grid hover:bg-muted"
            onClick={() => {
              onFilterChange(['high_value']);
              onMinValueChange(10000000000);
            }}
          >
            High Value Only (&gt;$10B)
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start terminal-text border-terminal-grid hover:bg-muted"
            onClick={() => {
              onFilterChange(['suppliers']);
              onNetworkDepthChange(2);
            }}
          >
            Supplier Deep Dive
          </Button>
        </div>
      </div>
    </div>
  );
};