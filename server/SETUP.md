# Polychain Server Setup Guide

Complete guide to setting up and running the Polychain supply chain relationship API server.

## Quick Start (TL;DR)

```bash
cd server
cp .env.example .env
# Edit .env with your Neo4j password
make deps
make run
# In another terminal:
make seed
```

## Detailed Setup

### Step 1: Prerequisites

Ensure you have the following installed:

- **Go 1.21+**: [Download here](https://golang.org/dl/)
- **Neo4j Database**: Running on GCP VM at `136.111.70.101:7687`
- **Neo4j Credentials**: Username and password for the database
- **curl or HTTPie** (optional): For testing API endpoints

Verify Go installation:
```bash
go version
# Should output: go version go1.21.x or higher
```

### Step 2: Navigate to Server Directory

```bash
cd /Users/muhammad/Documents/Coding/Polychain/server
```

### Step 3: Configure Environment

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your actual Neo4j credentials:
```bash
# Use your favorite editor
nano .env
# or
vim .env
# or
code .env
```

3. Update these values:
```env
NEO4J_URI=neo4j://136.111.70.101:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD={add password}  # ⚠️ CHANGE THIS!
PORT=8080
```

### Step 4: Install Dependencies

```bash
# Download and tidy Go dependencies
make deps

# Or manually:
go mod download
go mod tidy
```

This will download:
- `github.com/neo4j/neo4j-go-driver/v5` - Neo4j database driver
- `github.com/gorilla/mux` - HTTP router
- `github.com/rs/cors` - CORS middleware

### Step 5: Start the Server

#### Option A: Using Make (Recommended)
```bash
make run
```

#### Option B: Using the start script
```bash
chmod +x start.sh
./start.sh
```

#### Option C: Directly with Go
```bash
go run main.go
```

You should see output like:
```
Connecting to Neo4j...
Successfully connected to Neo4j
Server starting on port 8080
```

### Step 6: Verify Server is Running

Open a new terminal and test the health endpoint:

```bash
# Using curl
curl http://localhost:8080/api/health

# Using HTTPie
http GET localhost:8080/api/health
```

Expected response:
```json
{
  "status": "healthy"
}
```

### Step 7: Load Seed Data

With the server running, load the sample relationships:

#### Option A: Using Make
```bash
make seed
```

#### Option B: Using curl
```bash
make seed-curl

# Or directly:
curl -X POST http://localhost:8080/api/relationships/bulk \
  -H "Content-Type: application/json" \
  -d @seed_data.json
```

Expected response:
```json
{
  "success": true,
  "created": 12,
  "failed": 0,
  "failed_records": [],
  "message": "Created 12 relationships, 0 failed"
}
```

### Step 8: Test API Endpoints

#### Get relationships for a company:
```bash
curl http://localhost:8080/api/companies/Apple/relationships | jq
```

#### Create a new relationship:
```bash
curl -X POST http://localhost:8080/api/relationships \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": "Tesla",
    "supplier": "LG Energy Solution",
    "relation_type": "supplies_components",
    "product": ["Battery Packs"],
    "reason": "EV battery supply",
    "value": "$5B",
    "extracted_from": "Tesla Supplier Agreement",
    "evidence": "LG supplies battery packs for Model Y."
  }'
```

## Project Structure

```
server/
├── main.go                          # Entry point
├── go.mod                           # Go module definition
├── go.sum                           # Dependency checksums
├── .env                            # Environment variables (create this)
├── .env.example                    # Environment template
├── seed_data.json                  # Sample data (12 relationships)
├── start.sh                        # Quick start script
├── Makefile                        # Build automation
├── README.md                       # API documentation
├── SETUP.md                        # This file
│
├── database/
│   └── neo4j.go                   # Neo4j client
│
├── models/
│   └── relationship.go            # Data models
│
├── repository/
│   └── relationship_repository.go # Database operations
│
├── handlers/
│   └── relationship_handler.go    # HTTP handlers
│
└── cmd/
    └── seed/
        └── main.go                 # Seed data loader
```

## Available Make Commands

Run `make help` to see all available commands:

```bash
make help          # Show help
make deps          # Download dependencies
make run           # Run the server
make build         # Build binary
make test          # Run tests
make clean         # Clean build artifacts
make seed          # Load seed data
make seed-curl     # Load seed data with curl
make dev           # Setup and run in dev mode
make docker-build  # Build Docker image
make docker-run    # Run in Docker
```

## Troubleshooting

### Issue: "Failed to connect to Neo4j"

**Cause**: Neo4j connection parameters are incorrect or database is not accessible.

**Solutions**:
1. Verify Neo4j is running:
   ```bash
   # Try connecting with cypher-shell
   cypher-shell -a neo4j://136.111.70.101:7687 -u neo4j -p your_password
   ```

2. Check firewall rules on GCP VM
3. Verify credentials in `.env`
4. Ensure you're using `neo4j://` protocol (not `bolt://`)

### Issue: "Port 8080 already in use"

**Solution**: Change the port in `.env`:
```env
PORT=8081
```

### Issue: "go: command not found"

**Solution**: Install Go:
- macOS: `brew install go`
- Linux: Follow [official guide](https://golang.org/doc/install)
- Windows: Download installer from [golang.org](https://golang.org/dl/)

### Issue: Dependencies won't download

**Solution**:
```bash
# Clean module cache
go clean -modcache

# Re-download
go mod download
```

### Issue: "Module not found" errors

**Solution**:
```bash
# Reset go.mod
rm go.sum
go mod tidy
```

## Neo4j Graph Schema

The API creates the following graph structure:

### Node Type
- **Company**: Represents a company with property `name`

### Relationship Type
- **SUPPLIES**: Directed relationship from supplier to buyer

### Relationship Properties
- `relation_type`: Type of relationship (e.g., "manufactures_for")
- `product`: Array of products
- `reason`: Business reason
- `value`: Monetary value
- `extracted_from`: Source document
- `evidence`: Supporting evidence

### Example Cypher Queries

View all data:
```cypher
MATCH (n) RETURN n LIMIT 25
```

Find suppliers for Apple:
```cypher
MATCH (s:Company)-[r:SUPPLIES]->(b:Company {name: "Apple"})
RETURN s.name, r.product, r.value
```

Find all relationships:
```cypher
MATCH (s:Company)-[r:SUPPLIES]->(b:Company)
RETURN s.name AS Supplier, b.name AS Buyer, r.product AS Products
```

## Next Steps

1. **Explore the API**: Try different endpoints with curl or Postman
2. **Query Neo4j**: Connect to Neo4j Browser at `http://136.111.70.101:7474`
3. **Add More Data**: Use the bulk load endpoint to add your own relationships
4. **Build Frontend**: Connect a React/Vue frontend to visualize the graph
5. **Extend API**: Add search, filters, and analytics endpoints

## Production Deployment

### Build for Production

```bash
make build
# Binary created at: bin/polychain-server
```

### Run with Environment Variables

```bash
export NEO4J_URI="neo4j://136.111.70.101:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="your_password"
export PORT="8080"

./bin/polychain-server
```

### Docker Deployment

```bash
# Build image
make docker-build

# Run container
docker run -p 8080:8080 \
  -e NEO4J_URI="neo4j://136.111.70.101:7687" \
  -e NEO4J_USER="neo4j" \
  -e NEO4J_PASSWORD="your_password" \
  polychain-server
```

## API Examples

See the [README.md](README.md) for comprehensive API documentation and examples.

## Support

For issues or questions:
1. Check this setup guide
2. Review [README.md](README.md) for API specs
3. Check Neo4j connection with `cypher-shell`
4. Verify environment variables are loaded

## License

MIT
