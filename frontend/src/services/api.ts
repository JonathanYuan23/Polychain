// API service for communicating with the Go backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface Relationship {
  buyer: string;
  supplier: string;
  relation_type: string;
  role: string;
  evidence_span: string;
  doc_url: string;
  effective_start: string | null;
  effective_end: string | null;
  confidence: number;
}

export interface CompanyRelationshipsResponse {
  company: string;
  buyers: Relationship[];
  suppliers: Relationship[];
}

export interface BulkLoadRequest {
  relationships: Relationship[];
}

export interface BulkLoadResponse {
  success: number;
  failed: number;
  errors: string[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

/**
 * Check API health
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Create a single relationship
 */
export const createRelationship = async (relationship: Relationship): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/relationships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(relationship),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create relationship');
  }

  return response.json();
};

/**
 * Bulk load multiple relationships
 */
export const bulkLoadRelationships = async (
  relationships: Relationship[]
): Promise<BulkLoadResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/relationships/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ relationships }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk load relationships');
  }

  return response.json();
};

/**
 * Get all relationships for a company (both as buyer and supplier)
 */
export const getCompanyRelationships = async (
  companyName: string
): Promise<CompanyRelationshipsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/companies/${encodeURIComponent(companyName)}/relationships`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch company relationships');
  }

  return response.json();
};

/**
 * Search for companies by name
 */
export const searchCompanies = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/companies/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      console.error(`Search failed with status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.companies || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};
