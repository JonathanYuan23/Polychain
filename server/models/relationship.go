package models

// Relationship represents a buyer-supplier relationship
type Relationship struct {
	Buyer         string   `json:"buyer"`
	Supplier      string   `json:"supplier"`
	RelationType  string   `json:"relation_type"`
	Product       []string `json:"product"`
	Reason        string   `json:"reason"`
	Value         string   `json:"value"`
	ExtractedFrom string   `json:"extracted_from"`
	Evidence      string   `json:"evidence"`
}

// CompanyRelationships represents all relationships for a company
type CompanyRelationships struct {
	Company   string         `json:"company"`
	Buyers    []Relationship `json:"buyers"`
	Suppliers []Relationship `json:"suppliers"`
}

// BulkLoadRequest represents a bulk load request
type BulkLoadRequest struct {
	Relationships []Relationship `json:"relationships"`
}

// BulkLoadResponse represents the response for bulk load
type BulkLoadResponse struct {
	Success       bool     `json:"success"`
	Created       int      `json:"created"`
	Failed        int      `json:"failed"`
	FailedRecords []string `json:"failed_records,omitempty"`
	Message       string   `json:"message"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}
