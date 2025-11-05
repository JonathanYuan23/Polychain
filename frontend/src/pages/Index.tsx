import { useState, useCallback } from 'react';
import { CompanySearch } from '@/components/CompanySearch';
import { SupplyChainGraph } from '@/components/SupplyChainGraph';
import { ControlPanel } from '@/components/ControlPanel';
import { DependenciesListView } from '@/components/DependenciesListView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Company } from '@/types/supply-chain';
import { useCompanyRelationships, useHealthCheck } from '@/hooks/use-api';
import { transformCompanyRelationships } from '@/utils/data-transform';
import { Activity, Globe, TrendingUp, Network, List, Loader2, AlertCircle } from 'lucide-react';

const Index = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [networkDepth, setNetworkDepth] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['suppliers', 'customers']);

  const handleCompanySelect = useCallback((company: Company) => {
    setSelectedCompany(company);
  }, []);

  const handleNodeClick = useCallback((companyId: string) => {
    // In a real app, this would fetch new data for the clicked company
    console.log('Clicked node:', companyId);
  }, []);

  // Fetch data from backend API with specified network depth
  const { data: relationshipsData, isLoading, isError, error } = useCompanyRelationships(
    selectedCompany?.name,
    networkDepth
  );
  const { data: health, isError: healthError } = useHealthCheck();

  // Transform backend data to frontend format
  const currentNetwork = relationshipsData 
    ? transformCompanyRelationships(relationshipsData)
    : { companies: [], relationships: [] };

  // Filter relationships based on controls
  const filteredRelationships = currentNetwork.relationships.filter(rel => {
    // If no filters selected, show all
    if (selectedFilters.length === 0) return true;
    
    // For multi-degree networks, check if relationship involves selected company
    if (selectedCompany) {
      const isSupplierToSelected = rel.to === selectedCompany.id; // Someone supplying TO selected company
      const isCustomerOfSelected = rel.from === selectedCompany.id; // Selected company supplying TO someone
      
      // If this relationship doesn't involve the selected company at all, include it
      // (it's a second-degree or higher relationship)
      if (!isSupplierToSelected && !isCustomerOfSelected) {
        return true;
      }
      
      // If it involves the selected company, filter based on user's selection
      if (selectedFilters.includes('suppliers') && isSupplierToSelected) return true;
      if (selectedFilters.includes('customers') && isCustomerOfSelected) return true;
      
      return false;
    }
    
    return true;
  });

  // Filter companies to only show those involved in filtered relationships
  const filteredCompanies = currentNetwork.companies.filter(company => {
    // Always show the selected company
    if (company.id === selectedCompany?.id) return true;
    
    // Show company if it's part of any filtered relationship
    return filteredRelationships.some(rel => 
      rel.from === company.id || rel.to === company.id
    );
  });

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Terminal Header */}
      <header className="terminal-header border-b border-terminal-grid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-terminal-yellow" />
              <h1 className="text-xl font-bold terminal-highlight">SUPPLY CHAIN TERMINAL</h1>
            </div>
            <div className="hidden md:flex items-center gap-6 text-xs terminal-text">
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span>GLOBAL</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>REAL-TIME</span>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${
                healthError 
                  ? 'bg-terminal-red text-white' 
                  : 'bg-terminal-green text-black'
              }`}>
                {healthError ? 'OFFLINE' : 'LIVE'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CompanySearch 
              onCompanySelect={handleCompanySelect}
              selectedCompany={selectedCompany}
            />
            <div className="text-xs terminal-text">
              {new Date().toLocaleString('en-US', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })} UTC
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <div className="w-80 border-r border-terminal-grid bg-terminal-panel">
          <ControlPanel
            networkDepth={networkDepth}
            onNetworkDepthChange={setNetworkDepth}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />
        </div>

        {/* Center Graph/List Area */}
        <div className="flex-1 flex flex-col">
          <div className="terminal-header border-b border-terminal-grid">
            <div className="flex items-center justify-between">
              <h2 className="terminal-text font-semibold">
                {selectedCompany ? `${selectedCompany.name} Supply Chain Network` : 'Select a company to visualize network'}
              </h2>
              <div className="flex items-center gap-4 text-xs terminal-text">
                <span>Nodes: {filteredCompanies.length}</span>
                <span>Edges: {filteredRelationships.length}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-background">
            {!selectedCompany ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Supply Chain Intelligence Dashboard</h3>
                  <p className="text-muted-foreground max-w-md">
                    Search and select a company above to visualize its supply chain network, 
                    relationships, and financial flows in real-time.
                  </p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-16 w-16 text-terminal-yellow mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold mb-2 text-terminal-yellow">Loading Network...</h3>
                  <p className="text-muted-foreground">Fetching supply chain data for {selectedCompany.name}</p>
                </div>
              </div>
            ) : isError ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-terminal-red mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-terminal-red">Connection Error</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    {error?.message || 'Failed to fetch data from backend'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Make sure the backend server is running at http://localhost:8080
                  </p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="graph" className="h-full flex flex-col">
                <div className="border-b border-terminal-grid px-4">
                  <TabsList className="bg-terminal-panel border border-terminal-grid">
                    <TabsTrigger value="graph" className="terminal-text data-[state=active]:bg-terminal-yellow data-[state=active]:text-black">
                      <Network className="h-4 w-4 mr-2" />
                      Network Graph
                    </TabsTrigger>
                    <TabsTrigger value="list" className="terminal-text data-[state=active]:bg-terminal-yellow data-[state=active]:text-black">
                      <List className="h-4 w-4 mr-2" />
                      Dependencies List
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="graph" className="flex-1 m-0">
                  <SupplyChainGraph
                    companies={filteredCompanies}
                    relationships={filteredRelationships}
                    selectedCompanyId={selectedCompany.id}
                    onNodeClick={handleNodeClick}
                  />
                </TabsContent>
                <TabsContent value="list" className="flex-1 m-0">
                  <DependenciesListView
                    companies={filteredCompanies}
                    relationships={filteredRelationships}
                    selectedCompany={selectedCompany}
                    onCompanyClick={handleNodeClick}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <footer className="terminal-header border-t border-terminal-grid">
        <div className="flex items-center justify-between text-xs terminal-text">
          <div className="flex items-center gap-4">
            <span className={healthError ? 'text-terminal-red' : 'text-terminal-green'}>
              ● {healthError ? 'DISCONNECTED' : 'CONNECTED'}
            </span>
            <span>Backend: {healthError ? 'Offline' : health?.status || 'Online'}</span>
            <span>Data as of: {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Polychain v0.1.1</span>
            <span className="text-terminal-yellow">© 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;