# Polychain Supply Chain API

A Go-based HTTP API server for managing buyer-supplier relationships using Neo4j graph database.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Data Model](#data-model)
- [Usage Examples](#usage-examples)

## Overview

This API provides endpoints to:
- Store buyer-supplier relationships in Neo4j
- Retrieve all relationships for a given company (both as buyer and supplier)
- Bulk load relationship data
- Query the supply chain graph

## Prerequisites

- Go 1.21 or higher
- Neo4j database (hosted on GCP VM at 136.111.70.101:7687)
- Neo4j credentials

## Setup

### 1. Clone and Navigate to Server Directory

```bash
cd server
```

### 2. Configure Environment Variables

Copy the example environment file and update with your Neo4j credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
NEO4J_URI=neo4j://136.111.70.101:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_actual_password
PORT=8080
```

### 3. Install Dependencies

```bash
go mod download
```

### 4. Run the Server

```bash
go run main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "healthy"
}
```

---

### 2. Create Single Relationship

**POST** `/api/relationships`

Create a single buyer-supplier relationship.

**Request Body:**
```json
{
  "buyer": "Apple",
  "supplier": "TSMC",
  "relation_type": "manufactures_for",
  "product": ["A17 Pro Chip", "M3 Chip"],
  "reason": "Advanced semiconductor manufacturing",
  "value": "$25 billion",
  "extracted_from": "Apple 10-K 2023",
  "evidence": "TSMC manufactures our custom silicon chips."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Relationship created successfully",
  "data": {
    "buyer": "Apple",
    "supplier": "TSMC",
    ...
  }
}
```

---

### 3. Bulk Load Relationships

**POST** `/api/relationships/bulk`

Load multiple relationships at once.

**Request Body:**
```json
{
  "relationships": [
    {
      "buyer": "Apple",
      "supplier": "TSMC",
      "relation_type": "manufactures_for",
      "product": ["A17 Pro Chip"],
      "reason": "Chip manufacturing",
      "value": "$25B",
      "extracted_from": "Apple 10-K",
      "evidence": "TSMC manufactures our chips."
    },
    {
      "buyer": "NVIDIA",
      "supplier": "TSMC",
      "relation_type": "manufactures_for",
      "product": ["H100 GPU"],
      "reason": "GPU manufacturing",
      "value": "$30B",
      "extracted_from": "NVIDIA 10-K",
      "evidence": "TSMC manufactures our GPUs."
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "created": 2,
  "failed": 0,
  "failed_records": [],
  "message": "Created 2 relationships, 0 failed"
}
```

---

### 4. Get Company Relationships

**GET** `/api/companies/{name}/relationships`

Retrieve all relationships for a company (both as buyer and supplier).

**Example Request:**
```bash
GET /api/companies/Apple/relationships
```

**Response (200 OK):**
```json
{
  "company": "Apple",
  "buyers": [
    {
      "buyer": "Verizon",
      "supplier": "Apple",
      "relation_type": "purchases_from",
      "product": ["iPhone 15"],
      "reason": "Consumer device retail",
      "value": "$10B",
      "extracted_from": "Verizon Contract",
      "evidence": "Verizon purchases iPhones for retail."
    }
  ],
  "suppliers": [
    {
      "buyer": "Apple",
      "supplier": "TSMC",
      "relation_type": "manufactures_for",
      "product": ["A17 Pro Chip", "M3 Chip"],
      "reason": "Advanced semiconductor manufacturing",
      "value": "$25 billion",
      "extracted_from": "Apple 10-K 2023",
      "evidence": "TSMC manufactures our custom silicon chips."
    },
    {
      "buyer": "Apple",
      "supplier": "Foxconn",
      "relation_type": "assembles_for",
      "product": ["iPhone 15"],
      "reason": "Contract manufacturing",
      "value": "$18B",
      "extracted_from": "Apple 10-K",
      "evidence": "Foxconn assembles our iPhones."
    }
  ]
}
```

## Data Model

### Relationship Object

| Field | Type | Description |
|-------|------|-------------|
| `buyer` | string | Name of the buying company |
| `supplier` | string | Name of the supplying company |
| `relation_type` | string | Type of relationship (e.g., "manufactures_for", "assembles_for", "supplies_components", "purchases_from") |
| `product` | string[] | Array of products involved in the relationship |
| `reason` | string | Reason for the relationship |
| `value` | string | Monetary value of the relationship |
| `extracted_from` | string | Source document (e.g., "Apple 10-K 2023") |
| `evidence` | string | Evidence/quote supporting the relationship |

### Common Relation Types

- `manufactures_for` - Supplier manufactures products for buyer
- `assembles_for` - Supplier assembles products for buyer
- `supplies_components` - Supplier provides components to buyer
- `purchases_from` - Buyer purchases from supplier
- `distributes_for` - Supplier distributes products for buyer
- `provides_logistics` - Supplier provides logistics services

## Usage Examples

### Using cURL

#### 1. Create a Single Relationship

```bash
curl -X POST http://localhost:8080/api/relationships \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": "Tesla",
    "supplier": "Panasonic",
    "relation_type": "supplies_components",
    "product": ["Battery Cells"],
    "reason": "EV battery production",
    "value": "$7 billion",
    "extracted_from": "Tesla 10-K 2023",
    "evidence": "Panasonic supplies battery cells for Model 3 and Y."
  }'
```

#### 2. Bulk Load from Seed Data

```bash
curl -X POST http://localhost:8080/api/relationships/bulk \
  -H "Content-Type: application/json" \
  -d @seed_data.json
```

#### 3. Get Company Relationships

```bash
curl http://localhost:8080/api/companies/Apple/relationships
```

### Using HTTPie

```bash
# Create relationship
http POST localhost:8080/api/relationships \
  buyer="Apple" \
  supplier="TSMC" \
  relation_type="manufactures_for" \
  product:='["A17 Chip"]' \
  reason="Chip manufacturing" \
  value="$25B" \
  extracted_from="Apple 10-K" \
  evidence="TSMC manufactures chips"

# Get relationships
http GET localhost:8080/api/companies/Apple/relationships
```

### Loading Seed Data

The repository includes sample seed data in `seed_data.json`. Load it with:

```bash
# Using curl
curl -X POST http://localhost:8080/api/relationships/bulk \
  -H "Content-Type: application/json" \
  -d @seed_data.json

# Or using a Go script
go run cmd/seed/main.go
```

## Neo4j Graph Structure

The API creates the following graph structure:

```
(Company:Company {name: "Apple"})
(Company:Company {name: "TSMC"})

(TSMC)-[:SUPPLIES {
  relation_type: "manufactures_for",
  product: ["A17 Chip"],
  reason: "Chip manufacturing",
  value: "$25B",
  extracted_from: "Apple 10-K",
  evidence: "..."
}]->(Apple)
```

### Querying in Neo4j

```cypher
// Find all suppliers for Apple
MATCH (s:Company)-[r:SUPPLIES]->(b:Company {name: "Apple"})
RETURN s.name, r.product, r.value

// Find all companies TSMC supplies to
MATCH (s:Company {name: "TSMC"})-[r:SUPPLIES]->(b:Company)
RETURN b.name, r.product, r.value

// Find supply chain paths between two companies
MATCH path = (s:Company {name: "TSMC"})-[:SUPPLIES*..3]->(b:Company {name: "Microsoft"})
RETURN path
```

## Error Handling

### Error Response Format

```json
{
  "error": "Bad Request",
  "message": "Invalid request payload"
}
```

### Common Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request format
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Development

### Project Structure

```
server/
├── main.go                 # Application entry point
├── go.mod                  # Go module definition
├── go.sum                  # Dependency checksums
├── .env.example           # Environment variables template
├── seed_data.json         # Sample seed data
├── README.md              # This file
├── database/              # Database connection
│   └── neo4j.go
├── models/                # Data models
│   └── relationship.go
├── repository/            # Data access layer
│   └── relationship_repository.go
└── handlers/              # HTTP handlers
    └── relationship_handler.go
```

### Running Tests

```bash
go test ./...
```

### Building for Production

```bash
# Build binary
go build -o polychain-server main.go

# Run binary
./polychain-server
```

## Deployment

### Using Docker

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o server main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

Build and run:
```bash
docker build -t polychain-server .
docker run -p 8080:8080 --env-file .env polychain-server
```

## License

MIT

## Support

For issues or questions, please contact the development team.
