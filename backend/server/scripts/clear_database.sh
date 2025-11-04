#!/bin/bash

# Script to clear all relationships and companies from Neo4j database

echo "🗑️  Clearing Neo4j database..."
echo "This will delete all nodes and relationships."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled."
    exit 0
fi

# Neo4j connection details
NEO4J_URI="${NEO4J_URI:-neo4j://136.111.70.101:7687}"
NEO4J_USERNAME="${NEO4J_USERNAME:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-password}"

echo ""
echo "Connecting to Neo4j at: $NEO4J_URI"
echo "Username: $NEO4J_USERNAME"
echo ""

# Use cypher-shell to run the delete query
# Install cypher-shell if needed: https://neo4j.com/docs/operations-manual/current/tools/cypher-shell/

cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USERNAME" -p "$NEO4J_PASSWORD" \
"MATCH (n) DETACH DELETE n" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database cleared successfully!"
    echo ""
    echo "All nodes and relationships have been deleted."
else
    echo "❌ Failed to clear database."
    echo ""
    echo "Alternative method using curl:"
    echo "You can manually run this Cypher query in Neo4j Browser:"
    echo ""
    echo "  MATCH (n) DETACH DELETE n"
    echo ""
fi
