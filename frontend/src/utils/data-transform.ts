/**
 * Data transformation utilities
 * Converts backend API responses to frontend component formats
 */

import type { CompanyRelationshipsResponse, Relationship } from '@/services/api';
import type { Company, SupplyChainNetwork, SupplyChainRelationship } from '@/types/supply-chain';

/**
 * Transform backend relationship to frontend format
 */
export const transformRelationship = (
  rel: Relationship,
  isSupplier: boolean
): SupplyChainRelationship => {
  const id = `${rel.supplier}-${rel.buyer}`;
  
  return {
    id,
    from: rel.supplier,
    to: rel.buyer,
    value: rel.confidence * 100, // Use confidence as a percentage for value
    relationship_type: isSupplier ? 'supplier' : 'customer',
    relation_type: rel.relation_type,
    year: new Date().getFullYear(),
  };
};

/**
 * Transform backend company relationships response to frontend network format
 */
export const transformCompanyRelationships = (
  data: CompanyRelationshipsResponse
): SupplyChainNetwork => {
  const companies = new Map<string, Company>();
  const relationships: SupplyChainRelationship[] = [];

  // Add the selected company
  companies.set(data.company, {
    id: data.company,
    name: data.company,
    industry: 'Unknown', // TODO: Backend should provide this
    type: 'selected',
  });

  // Process suppliers (companies that supply TO the selected company)
  data.suppliers.forEach((rel) => {
    // Add supplier company
    if (!companies.has(rel.supplier)) {
      companies.set(rel.supplier, {
        id: rel.supplier,
        name: rel.supplier,
        industry: 'Unknown',
        type: 'supplier',
      });
    }

    // Add relationship (supplier -> selected company)
    relationships.push(transformRelationship(rel, true));
  });

  // Process buyers (companies that BUY FROM the selected company)
  data.buyers.forEach((rel) => {
    // Add buyer company
    if (!companies.has(rel.buyer)) {
      companies.set(rel.buyer, {
        id: rel.buyer,
        name: rel.buyer,
        industry: 'Unknown',
        type: 'customer',
      });
    }

    // Add relationship (selected company -> buyer)
    relationships.push(transformRelationship(rel, false));
  });

  return {
    companies: Array.from(companies.values()),
    relationships,
  };
};

/**
 * Extract unique company names from relationships
 */
export const extractCompanyNames = (data: CompanyRelationshipsResponse): Set<string> => {
  const names = new Set<string>([data.company]);
  
  data.suppliers.forEach(rel => {
    names.add(rel.supplier);
    names.add(rel.buyer);
  });
  
  data.buyers.forEach(rel => {
    names.add(rel.buyer);
    names.add(rel.supplier);
  });
  
  return names;
};

/**
 * Create a Company object from a name (used for search results)
 */
export const createCompanyFromName = (name: string): Company => {
  return {
    id: name,
    name: name,
    industry: 'Unknown',
    type: 'selected',
  };
};
