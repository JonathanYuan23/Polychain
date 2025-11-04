package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func main() {
	// Read seed data - try both relative paths
	seedFile := "../../seed_data.json" // Path from cmd/seed/
	data, err := os.ReadFile(seedFile)
	if err != nil {
		// Try current directory as fallback
		seedFile = "seed_data.json"
		data, err = os.ReadFile(seedFile)
		if err != nil {
			fmt.Printf("Error reading seed_data.json: %v\n", err)
			fmt.Println("Make sure seed_data.json exists in the server root directory")
			os.Exit(1)
		}
	}

	// Parse to validate JSON
	var relationships []map[string]interface{}
	if err := json.Unmarshal(data, &relationships); err != nil {
		fmt.Printf("Error parsing JSON: %v\n", err)
		os.Exit(1)
	}

	// Prepare bulk load request
	bulkRequest := map[string]interface{}{
		"relationships": relationships,
	}

	jsonData, err := json.Marshal(bulkRequest)
	if err != nil {
		fmt.Printf("Error marshaling request: %v\n", err)
		os.Exit(1)
	}

	// Send request
	serverURL := os.Getenv("SERVER_URL")
	if serverURL == "" {
		serverURL = "http://localhost:8080"
	}

	url := fmt.Sprintf("%s/api/relationships/bulk", serverURL)
	fmt.Printf("Sending bulk load request to %s\n", url)
	fmt.Printf("Loading %d relationships...\n", len(relationships))

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("\nResponse Status: %s\n", resp.Status)
	fmt.Printf("Response Body:\n%s\n", string(body))

	if resp.StatusCode != http.StatusOK {
		os.Exit(1)
	}

	fmt.Println("\n✓ Seed data loaded successfully!")
}
