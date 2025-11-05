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
  // Create unique ID including relation_type and role to handle multiple relationships between same companies
  const id = `${rel.supplier}-${rel.buyer}-${rel.relation_type}-${rel.role}`;
  
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
  const relationshipsMap = new Map<string, SupplyChainRelationship>();

  // Add the selected company
  companies.set(data.company, {
    id: data.company,
    name: data.company,
    industry: 'Unknown', // TODO: Backend should provide this
    type: 'selected',
  });

  // Process suppliers (companies that supply TO the selected company)
  data.suppliers.forEach((rel) => {
    // Add supplier company if not already added
    if (!companies.has(rel.supplier)) {
      companies.set(rel.supplier, {
        id: rel.supplier,
        name: rel.supplier,
        industry: 'Unknown',
        type: 'supplier',
      });
    }
    
    // Also add buyer company if it's not the selected company
    if (rel.buyer !== data.company && !companies.has(rel.buyer)) {
      companies.set(rel.buyer, {
        id: rel.buyer,
        name: rel.buyer,
        industry: 'Unknown',
        type: 'customer',
      });
    }

    // Add relationship (supplier -> buyer) - deduplicate by ID
    const transformedRel = transformRelationship(rel, true);
    relationshipsMap.set(transformedRel.id, transformedRel);
  });

  // Process buyers (companies that BUY FROM the selected company)
  data.buyers.forEach((rel) => {
    // Add buyer company if not already added
    if (!companies.has(rel.buyer)) {
      companies.set(rel.buyer, {
        id: rel.buyer,
        name: rel.buyer,
        industry: 'Unknown',
        type: 'customer',
      });
    }
    
    // Also add supplier company if it's not the selected company
    if (rel.supplier !== data.company && !companies.has(rel.supplier)) {
      companies.set(rel.supplier, {
        id: rel.supplier,
        name: rel.supplier,
        industry: 'Unknown',
        type: 'supplier',
      });
    }

    // Add relationship (supplier -> buyer) - deduplicate by ID
    const transformedRel = transformRelationship(rel, false);
    relationshipsMap.set(transformedRel.id, transformedRel);
  });

  return {
    companies: Array.from(companies.values()),
    relationships: Array.from(relationshipsMap.values()),
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
