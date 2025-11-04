.PHONY: help run build test clean seed deps

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

deps: ## Download Go dependencies
	go mod download
	go mod tidy

run: ## Run the server
	go run main.go

build: ## Build the server binary
	go build -o bin/polychain-server main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -rf bin/
	go clean

seed: ## Load seed data into the database (server must be running)
	@echo "Loading seed data..."
	@cd cmd/seed && go run main.go

seed-curl: ## Load seed data using curl
	curl -X POST http://localhost:8080/api/relationships/bulk \
		-H "Content-Type: application/json" \
		-d @seed_data.json

dev: deps run ## Setup and run in development mode

docker-build: ## Build Docker image
	docker build -t polychain-server .

docker-run: ## Run Docker container
	docker run -p 8080:8080 --env-file .env polychain-server

# Example API calls
example-create: ## Example: Create a single relationship
	curl -X POST http://localhost:8080/api/relationships \
		-H "Content-Type: application/json" \
		-d '{"buyer":"Apple","supplier":"TSMC","relation_type":"manufactures_for","product":["A17 Chip"],"reason":"Chip manufacturing","value":"$$25B","extracted_from":"Apple 10-K","evidence":"TSMC manufactures our chips."}'

example-get: ## Example: Get company relationships
	curl http://localhost:8080/api/companies/Apple/relationships | jq

example-health: ## Example: Health check
	curl http://localhost:8080/api/health | jq
