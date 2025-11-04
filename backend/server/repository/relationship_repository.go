package repository

import (
	"context"
	"fmt"
	"polychain-server/models"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// RelationshipRepository handles relationship operations
type RelationshipRepository struct {
	driver neo4j.DriverWithContext
}

// NewRelationshipRepository creates a new relationship repository
func NewRelationshipRepository(driver neo4j.DriverWithContext) *RelationshipRepository {
	return &RelationshipRepository{driver: driver}
}

// CreateRelationship creates a new relationship in Neo4j
func (r *RelationshipRepository) CreateRelationship(ctx context.Context, rel models.Relationship) error {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	query := `
		MERGE (buyer:Company {name: $buyer})
		MERGE (supplier:Company {name: $supplier})
		CREATE (supplier)-[rel:SUPPLIES {
			relation_type: $relation_type,
			role: $role,
			evidence_span: $evidence_span,
			doc_url: $doc_url,
			effective_start: $effective_start,
			effective_end: $effective_end,
			confidence: $confidence
		}]->(buyer)
		RETURN rel
	`

	params := map[string]interface{}{
		"buyer":           rel.Buyer,
		"supplier":        rel.Supplier,
		"relation_type":   rel.RelationType,
		"role":            rel.Role,
		"evidence_span":   rel.EvidenceSpan,
		"doc_url":         rel.DocURL,
		"effective_start": rel.EffectiveStart,
		"effective_end":   rel.EffectiveEnd,
		"confidence":      rel.Confidence,
	}

	_, err := session.Run(ctx, query, params)
	if err != nil {
		return fmt.Errorf("failed to create relationship: %w", err)
	}

	return nil
}

// BulkCreateRelationships creates multiple relationships
func (r *RelationshipRepository) BulkCreateRelationships(ctx context.Context, relationships []models.Relationship) (int, []string, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	created := 0
	var failed []string

	for i, rel := range relationships {
		err := r.CreateRelationship(ctx, rel)
		if err != nil {
			failed = append(failed, fmt.Sprintf("Record %d: %s -> %s (error: %v)", i, rel.Supplier, rel.Buyer, err))
		} else {
			created++
		}
	}

	return created, failed, nil
}

// GetCompanyRelationships retrieves all relationships for a company
func (r *RelationshipRepository) GetCompanyRelationships(ctx context.Context, companyName string) (*models.CompanyRelationships, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result := &models.CompanyRelationships{
		Company:   companyName,
		Buyers:    []models.Relationship{},
		Suppliers: []models.Relationship{},
	}

	// Get suppliers (companies that supply TO this company)
	suppliersQuery := `
		MATCH (supplier:Company)-[rel:SUPPLIES]->(buyer:Company {name: $company})
		RETURN supplier.name AS supplier,
		       buyer.name AS buyer,
		       rel.relation_type AS relation_type,
		       rel.role AS role,
		       rel.evidence_span AS evidence_span,
		       rel.doc_url AS doc_url,
		       rel.effective_start AS effective_start,
		       rel.effective_end AS effective_end,
		       rel.confidence AS confidence
	`

	suppliersResult, err := session.Run(ctx, suppliersQuery, map[string]interface{}{"company": companyName})
	if err != nil {
		return nil, fmt.Errorf("failed to query suppliers: %w", err)
	}

	for suppliersResult.Next(ctx) {
		record := suppliersResult.Record()
		result.Suppliers = append(result.Suppliers, models.Relationship{
			Supplier:       getStringValue(record, "supplier"),
			Buyer:          getStringValue(record, "buyer"),
			RelationType:   getStringValue(record, "relation_type"),
			Role:           getStringValue(record, "role"),
			EvidenceSpan:   getStringValue(record, "evidence_span"),
			DocURL:         getStringValue(record, "doc_url"),
			EffectiveStart: getStringPointer(record, "effective_start"),
			EffectiveEnd:   getStringPointer(record, "effective_end"),
			Confidence:     getFloat64Value(record, "confidence"),
		})
	}

	// Get buyers (companies that this company supplies TO)
	buyersQuery := `
		MATCH (supplier:Company {name: $company})-[rel:SUPPLIES]->(buyer:Company)
		RETURN supplier.name AS supplier,
		       buyer.name AS buyer,
		       rel.relation_type AS relation_type,
		       rel.role AS role,
		       rel.evidence_span AS evidence_span,
		       rel.doc_url AS doc_url,
		       rel.effective_start AS effective_start,
		       rel.effective_end AS effective_end,
		       rel.confidence AS confidence
	`

	buyersResult, err := session.Run(ctx, buyersQuery, map[string]interface{}{"company": companyName})
	if err != nil {
		return nil, fmt.Errorf("failed to query buyers: %w", err)
	}

	for buyersResult.Next(ctx) {
		record := buyersResult.Record()
		result.Buyers = append(result.Buyers, models.Relationship{
			Supplier:       getStringValue(record, "supplier"),
			Buyer:          getStringValue(record, "buyer"),
			RelationType:   getStringValue(record, "relation_type"),
			Role:           getStringValue(record, "role"),
			EvidenceSpan:   getStringValue(record, "evidence_span"),
			DocURL:         getStringValue(record, "doc_url"),
			EffectiveStart: getStringPointer(record, "effective_start"),
			EffectiveEnd:   getStringPointer(record, "effective_end"),
			Confidence:     getFloat64Value(record, "confidence"),
		})
	}

	return result, nil
}

// SearchCompanies searches for companies by name (fuzzy matching)
func (r *RelationshipRepository) SearchCompanies(ctx context.Context, query string) ([]string, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	// Get all unique company names that match the query (case-insensitive)
	searchQuery := `
		MATCH (c:Company)
		WHERE toLower(c.name) CONTAINS toLower($query)
		RETURN DISTINCT c.name AS name
		ORDER BY c.name
		LIMIT 20
	`

	result, err := session.Run(ctx, searchQuery, map[string]interface{}{"query": query})
	if err != nil {
		return nil, fmt.Errorf("failed to search companies: %w", err)
	}

	var companies []string
	for result.Next(ctx) {
		record := result.Record()
		if name := getStringValue(record, "name"); name != "" {
			companies = append(companies, name)
		}
	}

	return companies, nil
}

// Helper functions to safely extract values from Neo4j records
func getStringValue(record *neo4j.Record, key string) string {
	val, ok := record.Get(key)
	if !ok {
		return ""
	}
	if str, ok := val.(string); ok {
		return str
	}
	return ""
}

func getStringPointer(record *neo4j.Record, key string) *string {
	val, ok := record.Get(key)
	if !ok || val == nil {
		return nil
	}
	if str, ok := val.(string); ok {
		return &str
	}
	return nil
}

func getFloat64Value(record *neo4j.Record, key string) float64 {
	val, ok := record.Get(key)
	if !ok {
		return 0.0
	}
	// Try float64 first
	if f64, ok := val.(float64); ok {
		return f64
	}
	// Try int64 (Neo4j might return integers)
	if i64, ok := val.(int64); ok {
		return float64(i64)
	}
	// Try int
	if i, ok := val.(int); ok {
		return float64(i)
	}
	return 0.0
}
