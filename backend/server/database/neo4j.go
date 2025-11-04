package database

import (
	"context"
	"fmt"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// Neo4jClient represents a Neo4j database client
type Neo4jClient struct {
	Driver neo4j.DriverWithContext
}

// NewNeo4jClient creates a new Neo4j client
func NewNeo4jClient(uri, username, password string) (*Neo4jClient, error) {
	driver, err := neo4j.NewDriverWithContext(
		uri,
		neo4j.BasicAuth(username, password, ""),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create driver: %w", err)
	}

	// Verify connectivity
	ctx := context.Background()
	err = driver.VerifyConnectivity(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to verify connectivity: %w", err)
	}

	return &Neo4jClient{Driver: driver}, nil
}

// Close closes the Neo4j driver
func (c *Neo4jClient) Close(ctx context.Context) error {
	return c.Driver.Close(ctx)
}

// Session creates a new Neo4j session
func (c *Neo4jClient) Session(ctx context.Context) neo4j.SessionWithContext {
	return c.Driver.NewSession(ctx, neo4j.SessionConfig{
		AccessMode: neo4j.AccessModeWrite,
	})
}
