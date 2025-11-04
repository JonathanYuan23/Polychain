# Polychain API - Quick Reference

## 🚀 Getting Started (30 seconds)

```bash
cd server
cp .env.example .env
# Edit .env: Set NEO4J_PASSWORD
make deps && make run
# In new terminal: make seed
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/relationships` | Create single relationship |
| POST | `/api/relationships/bulk` | Bulk load relationships |
| GET | `/api/companies/{name}/relationships` | Get company's buyers & suppliers |

## 💾 Data Format

```json
{
  "buyer": "Apple",
  "supplier": "TSMC", 
  "relation_type": "manufactures_for",
  "product": ["A17 Chip", "M3 Chip"],
  "reason": "Chip manufacturing",
  "value": "$25B",
  "extracted_from": "Apple 10-K 2023",
  "evidence": "TSMC manufactures our chips."
}
```

## 🔧 Make Commands

```bash
make help          # Show all commands
make deps          # Install dependencies
make run           # Start server
make seed          # Load seed data
make build         # Build binary
make test          # Run tests
make example-get   # Example GET request
make example-create # Example POST request
```

## 🌐 Example Requests

### Create Relationship
```bash
curl -X POST http://localhost:8080/api/relationships \
  -H "Content-Type: application/json" \
  -d '{"buyer":"Apple","supplier":"TSMC",...}'
```

### Bulk Load (from file)
```bash
curl -X POST http://localhost:8080/api/relationships/bulk \
  -H "Content-Type: application/json" \
  -d @seed_data.json
```

### Get Company Data
```bash
curl http://localhost:8080/api/companies/Apple/relationships | jq
```

## 🗄️ Neo4j

**Connection:** neo4j://136.111.70.101:7687

**Browser:** http://136.111.70.101:7474

### Common Cypher Queries

```cypher
// View all nodes and relationships
MATCH (n) RETURN n LIMIT 25

// Find suppliers for a company
MATCH (s:Company)-[r:SUPPLIES]->(b:Company {name: "Apple"})
RETURN s.name, r.product, r.value

// Find buyers for a company  
MATCH (s:Company {name: "TSMC"})-[r:SUPPLIES]->(b:Company)
RETURN b.name, r.product, r.value

// Find supply chain paths
MATCH path = (s)-[:SUPPLIES*..3]->(b)
WHERE s.name = "TSMC" AND b.name = "Microsoft"
RETURN path
```

## 📦 Environment Variables

```env
NEO4J_URI=neo4j://136.111.70.101:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
PORT=8080
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused | Check Neo4j running, verify .env |
| Port in use | Change PORT in .env |
| go: command not found | Install Go 1.21+ |
| Auth failed | Check NEO4J_PASSWORD |

## 📁 Files

```
server/
├── main.go              # Entry point
├── seed_data.json       # 12 sample relationships
├── .env                 # Your config (create this!)
├── README.md            # Full API docs
├── SETUP.md             # Detailed setup
├── SUMMARY.md           # Implementation details
└── Makefile             # Build commands
```

## 🎯 Key Features

✅ Create single or bulk relationships
✅ Query bidirectional (buyers + suppliers)
✅ 12 real-world seed relationships
✅ Neo4j graph database
✅ RESTful JSON API
✅ CORS enabled
✅ Docker ready

## 📊 Seed Data (12 relationships)

- Apple ← TSMC, Foxconn, Samsung
- NVIDIA ← TSMC, SK Hynix
- Tesla ← Panasonic, CATL
- Microsoft ← NVIDIA
- Amazon ← Intel
- Google ← Broadcom
- Ford ← LG Energy Solution
- Boeing ← GE Aerospace

## 🔗 Related Types

- `manufactures_for`
- `assembles_for`
- `supplies_components`
- `purchases_from`
- `distributes_for`
- `provides_logistics`

---

**Need more details?** See README.md or SETUP.md
