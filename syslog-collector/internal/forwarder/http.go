// Package forwarder provides HTTP forwarding functionality to the backend.
package forwarder

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/liubaicai/CloudSentry/syslog-collector/internal/parser"
)

// HTTPForwarder forwards syslog messages to the backend via HTTP.
type HTTPForwarder struct {
	backendURL string
	timeout    time.Duration
	retryCount int
	retryDelay time.Duration
	client     *http.Client
}

// NewHTTPForwarder creates a new HTTP forwarder.
func NewHTTPForwarder(backendURL string, timeout time.Duration, retryCount int, retryDelay time.Duration) *HTTPForwarder {
	return &HTTPForwarder{
		backendURL: backendURL,
		timeout:    timeout,
		retryCount: retryCount,
		retryDelay: retryDelay,
		client: &http.Client{
			Timeout: timeout,
		},
	}
}

// Forward sends a batch of messages to the backend.
func (f *HTTPForwarder) Forward(ctx context.Context, messages []*parser.SyslogMessage) error {
	if len(messages) == 0 {
		return nil
	}

	// Convert to JSON
	data, err := json.Marshal(messages)
	if err != nil {
		return fmt.Errorf("failed to marshal messages: %w", err)
	}

	// Retry loop
	var lastErr error
	for attempt := 0; attempt <= f.retryCount; attempt++ {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(f.retryDelay):
			}
			log.Printf("Retrying forward (attempt %d/%d)", attempt, f.retryCount)
		}

		err := f.send(ctx, data)
		if err == nil {
			log.Printf("Successfully forwarded %d messages", len(messages))
			return nil
		}
		lastErr = err
		log.Printf("Forward attempt failed: %v", err)
	}

	return fmt.Errorf("failed to forward after %d attempts: %w", f.retryCount+1, lastErr)
}

// send performs the actual HTTP POST.
func (f *HTTPForwarder) send(ctx context.Context, data []byte) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, f.backendURL, bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := f.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body for error messages
	body, readErr := io.ReadAll(resp.Body)
	if readErr != nil {
		log.Printf("Warning: failed to read response body: %v", readErr)
		body = []byte("<unreadable>")
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("backend returned status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}
