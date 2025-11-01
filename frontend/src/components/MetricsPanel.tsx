import { Card } from '@/components/ui/card';
import { Company, SupplyChainRelationship } from '@/types/supply-chain';
import { formatCurrency } from '@/data/sample-data';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface MetricsPanelProps {
  companies: Company[];
  relationships: SupplyChainRelationship[];
  selectedCompany?: Company;
}

export const MetricsPanel = ({ companies, relationships, selectedCompany }: MetricsPanelProps) => {
  if (!selectedCompany) {
    return (
      <div className="h-full flex items-center justify-center terminal-panel">
        <div className="text-center text-muted-foreground">
          <div className="terminal-text">Select a company to view metrics</div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const supplierRelationships = relationships.filter(rel => rel.to === selectedCompany.id);
  const customerRelationships = relationships.filter(rel => rel.from === selectedCompany.id);
  
  const totalSupplierSpend = supplierRelationships.reduce((sum, rel) => sum + rel.value, 0);
  const totalCustomerRevenue = customerRelationships.reduce((sum, rel) => sum + rel.value, 0);
  
  const topSuppliers = supplierRelationships
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(rel => {
      const supplier = companies.find(c => c.id === rel.from);
      return {
        company: supplier,
        spend: rel.value,
        percentage: (rel.value / totalSupplierSpend) * 100
      };
    });

  const topCustomers = customerRelationships
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(rel => {
      const customer = companies.find(c => c.id === rel.to);
      return {
        company: customer,
        revenue: rel.value,
        percentage: (rel.value / totalCustomerRevenue) * 100
      };
    });

  // Calculate concentration risk (top 3 suppliers as % of total spend)
  const top3SupplierSpend = topSuppliers.slice(0, 3).reduce((sum, s) => sum + s.spend, 0);
  const concentrationRisk = totalSupplierSpend > 0 ? (top3SupplierSpend / totalSupplierSpend) * 100 : 0;

  const avgSupplierValue = supplierRelationships.length > 0 
    ? totalSupplierSpend / supplierRelationships.length 
    : 0;

  return (
    <div className="h-full overflow-auto space-y-4 p-4">
      {/* Header */}
      <div className="terminal-header">
        <h2 className="terminal-highlight font-bold">SUPPLY CHAIN ANALYTICS</h2>
        <div className="terminal-text text-xs mt-1">
          {selectedCompany.name} ({selectedCompany.ticker})
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-3">
        <Card className="metric-card">
          <div className="metric-label">Total Supplier Spend</div>
          <div className="metric-value terminal-success">
            {formatCurrency(totalSupplierSpend)}
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-label">Total Customer Revenue</div>
          <div className="metric-value terminal-info">
            {formatCurrency(totalCustomerRevenue)}
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-label">Supplier Count</div>
          <div className="metric-value">{supplierRelationships.length}</div>
        </Card>

        <Card className="metric-card">
          <div className="metric-label">Avg Supplier Value</div>
          <div className="metric-value">{formatCurrency(avgSupplierValue)}</div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label">Concentration Risk</div>
              <div className={`metric-value ${concentrationRisk > 60 ? 'text-destructive' : concentrationRisk > 40 ? 'terminal-warning' : 'terminal-success'}`}>
                {concentrationRisk.toFixed(1)}%
              </div>
            </div>
            {concentrationRisk > 60 && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
          </div>
        </Card>
      </div>

      {/* Top Suppliers */}
      {topSuppliers.length > 0 && (
        <div>
          <h3 className="terminal-highlight font-semibold mb-2 text-sm">TOP SUPPLIERS</h3>
          <div className="space-y-2">
            {topSuppliers.map((supplier, index) => (
              <div key={supplier.company?.id} className="terminal-panel p-2 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="terminal-text font-medium truncate">
                      {supplier.company?.name}
                    </div>
                    <div className="terminal-text text-xs text-muted-foreground">
                      {supplier.company?.ticker}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="terminal-success font-semibold text-sm">
                      {formatCurrency(supplier.spend)}
                    </div>
                    <div className="terminal-text text-xs">
                      {supplier.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div>
          <h3 className="terminal-highlight font-semibold mb-2 text-sm">TOP CUSTOMERS</h3>
          <div className="space-y-2">
            {topCustomers.map((customer, index) => (
              <div key={customer.company?.id} className="terminal-panel p-2 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="terminal-text font-medium truncate">
                      {customer.company?.name}
                    </div>
                    <div className="terminal-text text-xs text-muted-foreground">
                      {customer.company?.ticker}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="terminal-info font-semibold text-sm">
                      {formatCurrency(customer.revenue)}
                    </div>
                    <div className="terminal-text text-xs">
                      {customer.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};