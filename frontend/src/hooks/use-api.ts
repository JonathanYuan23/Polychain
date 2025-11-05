import { useQuery } from '@tanstack/react-query';
import { getCompanyRelationships, checkHealth } from '@/services/api';
import type { CompanyRelationshipsResponse, Relationship } from '@/services/api';

/**
 * Recursively fetch relationships up to a specified depth
 */
async function fetchNetworkAtDepth(
  rootCompany: string,
  depth: number,
  visited: Set<string> = new Set()
): Promise<CompanyRelationshipsResponse> {
  // Prevent infinite loops
  if (visited.has(rootCompany)) {
    return { company: rootCompany, buyers: [], suppliers: [] };
  }
  visited.add(rootCompany);

  // Fetch relationships for current company
  const currentData = await getCompanyRelationships(rootCompany);
  
  // If depth is 1, return current level only
  if (depth <= 1) {
    return currentData;
  }

  // Collect all related companies for next level
  const relatedCompanies = new Set<string>();
  currentData.suppliers.forEach(rel => relatedCompanies.add(rel.supplier));
  currentData.buyers.forEach(rel => relatedCompanies.add(rel.buyer));

  // Fetch next level for each related company
  const nextLevelPromises = Array.from(relatedCompanies).map(company =>
    fetchNetworkAtDepth(company, depth - 1, new Set(visited))
  );

  const nextLevelResults = await Promise.all(nextLevelPromises);

  // Merge all relationships, deduplicating by unique key
  const allSuppliers = new Map<string, Relationship>();
  const allBuyers = new Map<string, Relationship>();

  // Add current level
  currentData.suppliers.forEach(rel => {
    const key = `${rel.supplier}-${rel.buyer}-${rel.relation_type}-${rel.role}`;
    allSuppliers.set(key, rel);
  });
  currentData.buyers.forEach(rel => {
    const key = `${rel.supplier}-${rel.buyer}-${rel.relation_type}-${rel.role}`;
    allBuyers.set(key, rel);
  });

  // Add next levels
  nextLevelResults.forEach(result => {
    result.suppliers.forEach(rel => {
      const key = `${rel.supplier}-${rel.buyer}-${rel.relation_type}-${rel.role}`;
      allSuppliers.set(key, rel);
    });
    result.buyers.forEach(rel => {
      const key = `${rel.supplier}-${rel.buyer}-${rel.relation_type}-${rel.role}`;
      allBuyers.set(key, rel);
    });
  });

  return {
    company: rootCompany,
    suppliers: Array.from(allSuppliers.values()),
    buyers: Array.from(allBuyers.values()),
  };
}

/**
 * Hook to fetch company relationships from the backend with configurable depth
 */
export const useCompanyRelationships = (
  companyName: string | undefined,
  depth: number = 1
) => {
  return useQuery<CompanyRelationshipsResponse>({
    queryKey: ['company-relationships', companyName, depth],
    queryFn: () => {
      if (!companyName) {
        throw new Error('Company name is required');
      }
      return fetchNetworkAtDepth(companyName, depth);
    },
    enabled: !!companyName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to check API health
 */
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });
};
