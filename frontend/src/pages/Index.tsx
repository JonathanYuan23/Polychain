import { useState, useCallback } from 'react';
import { CompanySearch } from '@/components/CompanySearch';
import { SupplyChainGraph } from '@/components/SupplyChainGraph';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { DependenciesListView } from '@/components/DependenciesListView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Company } from '@/types/supply-chain';
import { getCompanyNetwork } from '@/data/sample-data';
import { Activity, Globe, TrendingUp, Network, List } from 'lucide-react';

const Index = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [networkDepth, setNetworkDepth] = useState(1);
  const [minValue, setMinValue] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['suppliers', 'customers']);

  const handleCompanySelect = useCallback((company: Company) => {
    setSelectedCompany(company);
  }, []);

  const handleNodeClick = useCallback((companyId: string) => {
    // In a real app, this would fetch new data for the clicked company
    console.log('Clicked node:', companyId);
  }, []);

  const currentNetwork = selectedCompany ? getCompanyNetwork(selectedCompany.id) : { companies: [], relationships: [] };

  // Filter relationships based on controls
  const filteredRelationships = currentNetwork.relationships.filter(rel => {
    if (rel.value < minValue) return false;
    
    if (selectedFilters.includes('high_value') && rel.value <= 10000000000) return false;
    if (selectedFilters.includes('medium_value') && (rel.value <= 1000000000 || rel.value > 10000000000)) return false;
    if (selectedFilters.includes('low_value') && rel.value > 1000000000) return false;
    
    if (selectedFilters.includes('suppliers') && rel.relationship_type !== 'supplier') return false;
    if (selectedFilters.includes('customers') && rel.relationship_type !== 'customer') return false;
    if (selectedFilters.includes('partners') && rel.relationship_type !== 'partner') return false;
    
    return true;
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
              <div className="px-2 py-1 bg-terminal-green text-black rounded text-xs font-semibold">
                LIVE
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
            minValue={minValue}
            onMinValueChange={setMinValue}
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
                <span>Nodes: {currentNetwork.companies.length}</span>
                <span>Edges: {filteredRelationships.length}</span>
                <span>Total Value: ${(filteredRelationships.reduce((sum, rel) => sum + rel.value, 0) / 1000000000).toFixed(1)}B</span>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-background">
            {selectedCompany ? (
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
                    companies={currentNetwork.companies}
                    relationships={filteredRelationships}
                    selectedCompanyId={selectedCompany.id}
                    onNodeClick={handleNodeClick}
                  />
                </TabsContent>
                <TabsContent value="list" className="flex-1 m-0">
                  <DependenciesListView
                    companies={currentNetwork.companies}
                    relationships={filteredRelationships}
                    selectedCompany={selectedCompany}
                    onCompanyClick={handleNodeClick}
                  />
                </TabsContent>
              </Tabs>
            ) : (
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
            )}
          </div>
        </div>

        {/* Right Metrics Panel */}
        <div className="w-96 border-l border-terminal-grid bg-terminal-panel">
          <MetricsPanel
            companies={currentNetwork.companies}
            relationships={filteredRelationships}
            selectedCompany={selectedCompany}
          />
        </div>
      </div>

      {/* Status Bar */}
      <footer className="terminal-header border-t border-terminal-grid">
        <div className="flex items-center justify-between text-xs terminal-text">
          <div className="flex items-center gap-4">
            <span className="text-terminal-green">● CONNECTED</span>
            <span>Data as of: {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Bloomberg Terminal for Supply Chain v1.0</span>
            <span className="text-terminal-yellow">© 2024</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;