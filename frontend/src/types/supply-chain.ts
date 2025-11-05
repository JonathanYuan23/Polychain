export interface Company {
  id: string;
  name: string;
  ticker?: string;
  industry: string;
  market_cap?: number;
  type: 'supplier' | 'customer' | 'partner' | 'selected';
}

export interface SupplyChainRelationship {
  id: string;
  from: string;
  to: string;
  value: number; // USD amount
  relationship_type: 'supplier' | 'customer' | 'partner';
  // relation_type is the semantic relationship label extracted from docs
  // examples: "manufactures_for", "supplies_components_to", "contract_manufactures_for", etc.
  relation_type?: string;
  year: number;
}

export interface SupplyChainNetwork {
  companies: Company[];
  relationships: SupplyChainRelationship[];
}

export interface MetricsSummary {
  total_spend: number;
  supplier_count: number;
  top_suppliers: Array<{
    company: Company;
    spend: number;
    percentage: number;
  }>;
  concentration_risk: number; // 0-100 percentage
  avg_relationship_value: number;
}