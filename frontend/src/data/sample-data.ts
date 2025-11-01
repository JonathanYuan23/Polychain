import { Company, SupplyChainNetwork, SupplyChainRelationship } from '@/types/supply-chain';

export const companies: Company[] = [
  { id: 'AAPL', name: 'Apple Inc.', ticker: 'AAPL', industry: 'Technology', market_cap: 3000000000000, type: 'selected' },
  { id: 'TSMC', name: 'Taiwan Semiconductor', ticker: 'TSM', industry: 'Semiconductors', market_cap: 500000000000, type: 'supplier' },
  { id: 'FOXC', name: 'Foxconn Technology', ticker: 'FOXC', industry: 'Electronics Manufacturing', market_cap: 50000000000, type: 'supplier' },
  { id: 'INTC', name: 'Intel Corporation', ticker: 'INTC', industry: 'Semiconductors', market_cap: 200000000000, type: 'supplier' },
  { id: 'QCOM', name: 'Qualcomm Inc.', ticker: 'QCOM', industry: 'Semiconductors', market_cap: 150000000000, type: 'supplier' },
  { id: 'SONY', name: 'Sony Corporation', ticker: 'SONY', industry: 'Electronics', market_cap: 120000000000, type: 'supplier' },
  { id: 'CORNING', name: 'Corning Inc.', ticker: 'GLW', industry: 'Glass Manufacturing', market_cap: 30000000000, type: 'supplier' },
  { id: 'VZW', name: 'Verizon Wireless', ticker: 'VZ', industry: 'Telecommunications', market_cap: 180000000000, type: 'customer' },
  { id: 'TMUS', name: 'T-Mobile US', ticker: 'TMUS', industry: 'Telecommunications', market_cap: 170000000000, type: 'customer' },
  { id: 'ATT', name: 'AT&T Inc.', ticker: 'T', industry: 'Telecommunications', market_cap: 140000000000, type: 'customer' },
  { id: 'WMT', name: 'Walmart Inc.', ticker: 'WMT', industry: 'Retail', market_cap: 500000000000, type: 'customer' },
  { id: 'COST', name: 'Costco Wholesale', ticker: 'COST', industry: 'Retail', market_cap: 300000000000, type: 'customer' },
];

export const relationships: SupplyChainRelationship[] = [
  { id: 'rel1', from: 'TSMC', to: 'AAPL', value: 25000000000, relationship_type: 'supplier', year: 2023 },
  { id: 'rel2', from: 'FOXC', to: 'AAPL', value: 18000000000, relationship_type: 'supplier', year: 2023 },
  { id: 'rel3', from: 'INTC', to: 'AAPL', value: 8000000000, relationship_type: 'supplier', year: 2023 },
  { id: 'rel4', from: 'QCOM', to: 'AAPL', value: 12000000000, relationship_type: 'supplier', year: 2023 },
  { id: 'rel5', from: 'SONY', to: 'AAPL', value: 5000000000, relationship_type: 'supplier', year: 2023 },
  { id: 'rel6', from: 'CORNING', to: 'AAPL', value: 3000000000, relationship_type: 'supplier', year: 2023 },
  { id: 'rel7', from: 'AAPL', to: 'VZW', value: 15000000000, relationship_type: 'customer', year: 2023 },
  { id: 'rel8', from: 'AAPL', to: 'TMUS', value: 12000000000, relationship_type: 'customer', year: 2023 },
  { id: 'rel9', from: 'AAPL', to: 'ATT', value: 11000000000, relationship_type: 'customer', year: 2023 },
  { id: 'rel10', from: 'AAPL', to: 'WMT', value: 8000000000, relationship_type: 'customer', year: 2023 },
  { id: 'rel11', from: 'AAPL', to: 'COST', value: 6000000000, relationship_type: 'customer', year: 2023 },
];

export const getCompanyNetwork = (companyId: string): SupplyChainNetwork => {
  const companyRelationships = relationships.filter(
    rel => rel.from === companyId || rel.to === companyId
  );
  
  const relatedCompanyIds = new Set([
    companyId,
    ...companyRelationships.flatMap(rel => [rel.from, rel.to])
  ]);
  
  const networkCompanies = companies.filter(company => 
    relatedCompanyIds.has(company.id)
  );
  
  return {
    companies: networkCompanies,
    relationships: companyRelationships
  };
};

export const searchCompanies = (query: string): Company[] => {
  if (!query) return companies;
  
  const lowercaseQuery = query.toLowerCase();
  return companies.filter(company => 
    company.name.toLowerCase().includes(lowercaseQuery) ||
    company.ticker?.toLowerCase().includes(lowercaseQuery)
  );
};

export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
};