package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"polychain-server/models"
	"polychain-server/repository"

	"github.com/gorilla/mux"
)

// RelationshipHandler handles relationship HTTP requests
type RelationshipHandler struct {
	repo *repository.RelationshipRepository
}

// NewRelationshipHandler creates a new relationship handler
func NewRelationshipHandler(repo *repository.RelationshipRepository) *RelationshipHandler {
	return &RelationshipHandler{repo: repo}
}

// CreateRelationship handles POST /api/relationships
func (h *RelationshipHandler) CreateRelationship(w http.ResponseWriter, r *http.Request) {
	var rel models.Relationship
	if err := json.NewDecoder(r.Body).Decode(&rel); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	ctx := context.Background()
	if err := h.repo.CreateRelationship(ctx, rel); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"success": true,
		"message": "Relationship created successfully",
		"data":    rel,
	})
}

// BulkLoadRelationships handles POST /api/relationships/bulk
func (h *RelationshipHandler) BulkLoadRelationships(w http.ResponseWriter, r *http.Request) {
	var req models.BulkLoadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if len(req.Relationships) == 0 {
		respondWithError(w, http.StatusBadRequest, "No relationships provided")
		return
	}

	ctx := context.Background()
	created, failed, err := h.repo.BulkCreateRelationships(ctx, req.Relationships)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := models.BulkLoadResponse{
		Success:       len(failed) == 0,
		Created:       created,
		Failed:        len(failed),
		FailedRecords: failed,
		Message:       fmt.Sprintf("Created %d relationships, %d failed", created, len(failed)),
	}

	respondWithJSON(w, http.StatusOK, response)
}

// GetCompanyRelationships handles GET /api/companies/{name}/relationships
func (h *RelationshipHandler) GetCompanyRelationships(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	companyName := vars["name"]

	if companyName == "" {
		respondWithError(w, http.StatusBadRequest, "Company name is required")
		return
	}

	ctx := context.Background()
	result, err := h.repo.GetCompanyRelationships(ctx, companyName)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, result)
}

// Helper functions
func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, models.ErrorResponse{
		Error:   http.StatusText(code),
		Message: message,
	})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}
