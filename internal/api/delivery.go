package api

import (
	"net/http"
	"github.com/auscaster/frantic-board/internal/resolver"
	"github.com/auscaster/frantic-board/internal/models"
)

// HandleDeliveries processes POST requests to /v1/deliveries and /v1/deliveries/preflight
func HandleDeliveries(w http.ResponseWriter, r *http.Request) {
	var req models.DeliveryRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", err.Error())
		return
	}

	// Validate basic structure first
	if len(req.ArtifactRefs) == 0 {
		writeError(w, http.StatusBadRequest, "missing_artifacts", "artifact_refs cannot be empty")
		return
	}

	// Check for required artifacts
	required := []string{"public_url", "evidence_json", "report"}
	for _, art := range required {
		found := false
		for _, ref := range req.ArtifactRefs {
			if ref.Type == art {
				found = true
				break
			}
		}
		if !found {
			writeError(w, http.StatusUnprocessableEntity, "missing_artifact", art)
			return
		}
	}

	// Handle receipt_ref specifically to avoid 500s
	// The bug was that resolving receipt_ref could panic or fail silently leading to 500
	receiptFound := false
	for _, ref := range req.ArtifactRefs {
		if ref.Type == "receipt_ref" {
			receiptFound = true
			// FIX: Use a safe resolver that returns errors instead of panicking
			if err := resolver.SafeResolveReceipt(ref.Value); err != nil {
				// Return 4xx instead of letting it bubble up as 500
				writeError(w, http.StatusUnprocessableEntity, "invalid_receipt_ref", err.Error())
				return
			}
			break
		}
	}

	// If receipt_ref is required by the claim/bounty but missing, let the business logic handle it
	// But if it IS present, it MUST be valid.
	
	// ... rest of the delivery logic ...
	
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}

func decodeJSON(r *http.Request, v interface{}) error {
	// Mock decoder
	return nil
}

func writeError(w http.ResponseWriter, code int, key, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	// Simple JSON error response
	w.Write([]byte(`{"error":{"code":"` + key + `","message":"` + msg + `"}}`))
}
