// Package buffer provides message buffering and batching functionality.
package buffer

import (
	"context"
	"sync"
	"time"

	"github.com/liubaicai/CloudSentry/syslog-collector/internal/parser"
)

// FlushHandler is called when the buffer should be flushed.
type FlushHandler func(messages []*parser.SyslogMessage)

// Queue represents an in-memory message buffer queue.
type Queue struct {
	maxSize       int
	flushInterval time.Duration
	flushSize     int
	handler       FlushHandler

	messages []*parser.SyslogMessage
	mu       sync.Mutex

	stopCh chan struct{}

	// Semaphore to limit concurrent flush goroutines
	flushSem chan struct{}
}

// NewQueue creates a new buffer queue.
func NewQueue(maxSize, flushSize int, flushInterval time.Duration, handler FlushHandler) *Queue {
	return &Queue{
		maxSize:       maxSize,
		flushSize:     flushSize,
		flushInterval: flushInterval,
		handler:       handler,
		messages:      make([]*parser.SyslogMessage, 0, flushSize),
		stopCh:        make(chan struct{}),
		flushSem:      make(chan struct{}, 10), // Limit to 10 concurrent flush operations
	}
}

// Push adds a message to the queue.
func (q *Queue) Push(msg *parser.SyslogMessage) {
	q.mu.Lock()
	defer q.mu.Unlock()

	// If queue is full, drop oldest messages
	if len(q.messages) >= q.maxSize {
		// Drop first 10% of messages
		dropCount := q.maxSize / 10
		if dropCount < 1 {
			dropCount = 1
		}
		q.messages = q.messages[dropCount:]
	}

	q.messages = append(q.messages, msg)

	// Flush if we've reached flush size
	if len(q.messages) >= q.flushSize {
		q.flushLocked()
	}
}

// Start starts the periodic flush timer.
func (q *Queue) Start(ctx context.Context) {
	ticker := time.NewTicker(q.flushInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			q.Flush()
			return
		case <-q.stopCh:
			q.Flush()
			return
		case <-ticker.C:
			q.Flush()
		}
	}
}

// Flush flushes all buffered messages.
func (q *Queue) Flush() {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.flushLocked()
}

// flushLocked flushes messages (must be called with lock held).
func (q *Queue) flushLocked() {
	if len(q.messages) == 0 {
		return
	}

	// Copy messages for handler
	messages := make([]*parser.SyslogMessage, len(q.messages))
	copy(messages, q.messages)

	// Clear buffer
	q.messages = q.messages[:0]

	// Use semaphore to limit concurrent flush goroutines
	select {
	case q.flushSem <- struct{}{}:
		go func() {
			defer func() { <-q.flushSem }()
			q.handler(messages)
		}()
	default:
		// If all goroutine slots are busy, run synchronously
		// This provides backpressure when the forwarder can't keep up
		q.handler(messages)
	}
}

// Stop stops the queue.
func (q *Queue) Stop() {
	close(q.stopCh)
}

// Size returns the current queue size.
func (q *Queue) Size() int {
	q.mu.Lock()
	defer q.mu.Unlock()
	return len(q.messages)
}
