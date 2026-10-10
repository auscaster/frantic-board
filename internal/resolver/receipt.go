package resolver

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

// SafeResolveReceipt validates and resolves a receipt reference.
// Previously, this function might have panicked on malformed URLs or network errors.
func SafeResolveReceipt(ref string) error {
	if ref == "" {
		return fmt.Errorf("receipt_ref cannot be empty")
	}

	// Parse the reference to ensure it's a valid URL or identifier
	// The bug report mentions various formats: sha256 hashes, URLs, garbage.
	// We need to handle all gracefully.
	
	u, err := url.Parse(ref)
	if err != nil {
		return fmt.Errorf("invalid receipt_ref format: %s", err.Error())
	}

	// If it's a URL, attempt to fetch and validate
	if u.Scheme != "" && u.Host != "" {
		resp, err := http.Get(ref)
		if err != nil {
			return fmt.Errorf("failed to fetch receipt from %s: %s", ref, err.Error())
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("receipt at %s returned status %d", ref, resp.StatusCode)
		}

		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read receipt body: %s", err.Error())
		}

		// Basic validation: check if it looks like JSON
		if !isValidJSON(body) {
			return fmt.Errorf("receipt at %s is not valid JSON", ref)
		}
	} else {
		// If it's not a URL, it might be a local ID or hash.
		// For now, we accept non-URL references if they are non-empty,
		// but in a real system, you'd check against a registry.
		// The previous crash might have been due to assuming it WAS a URL.
		if strings.Contains(ref, ":") {
			// Looks like a scheme-based ID (e.g., runx:...)
			// We can skip network fetch for now, but ensure it's not "garbage"
			if len(ref) < 5 {
				return fmt.Errorf("receipt_ref too short")
			}
		}
	}

	return nil
}

func isValidJSON(b []byte) bool {
	if len(b) == 0 {
		return false
	}
	// Simple check: starts with { or [
	c := b[0]
	return c == '{' || c == '['
}
