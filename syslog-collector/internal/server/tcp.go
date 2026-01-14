package server

import (
	"bufio"
	"context"
	"errors"
	"io"
	"log"
	"net"
	"sync"
	"time"

	"github.com/liubaicai/CloudSentry/syslog-collector/internal/parser"
)

// TCPServer represents a TCP syslog server.
type TCPServer struct {
	port           int
	maxConnections int
	parser         *parser.Parser
	handler        MessageHandler
	listener       net.Listener
	connections    map[net.Conn]struct{}
	connMu         sync.RWMutex
}

// NewTCPServer creates a new TCP syslog server.
func NewTCPServer(port, maxConnections int, handler MessageHandler) *TCPServer {
	return &TCPServer{
		port:           port,
		maxConnections: maxConnections,
		parser:         parser.New(),
		handler:        handler,
		connections:    make(map[net.Conn]struct{}),
	}
}

// Start starts the TCP server.
func (s *TCPServer) Start(ctx context.Context) error {
	addr := &net.TCPAddr{
		Port: s.port,
		IP:   net.IPv4zero,
	}

	listener, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return err
	}
	s.listener = listener

	log.Printf("TCP syslog server listening on port %d", s.port)

	go s.acceptConnections(ctx)

	return nil
}

// acceptConnections accepts incoming TCP connections.
func (s *TCPServer) acceptConnections(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
			conn, err := s.listener.Accept()
			if err != nil {
				log.Printf("TCP accept error: %v", err)
				continue
			}

			// Check connection limit
			s.connMu.RLock()
			connCount := len(s.connections)
			s.connMu.RUnlock()

			if connCount >= s.maxConnections {
				log.Printf("Max connections reached, rejecting connection from %s", conn.RemoteAddr())
				conn.Close()
				continue
			}

			s.connMu.Lock()
			s.connections[conn] = struct{}{}
			s.connMu.Unlock()

			go s.handleConnection(ctx, conn)
		}
	}
}

// handleConnection handles a single TCP connection.
func (s *TCPServer) handleConnection(ctx context.Context, conn net.Conn) {
	defer func() {
		conn.Close()
		s.connMu.Lock()
		delete(s.connections, conn)
		s.connMu.Unlock()
	}()

	remoteAddr := conn.RemoteAddr().String()
	host, _, _ := net.SplitHostPort(remoteAddr)

	reader := bufio.NewReader(conn)

	for {
		select {
		case <-ctx.Done():
			return
		default:
			// Set read deadline
			conn.SetReadDeadline(time.Now().Add(30 * time.Second))

			// Read until newline (common syslog framing)
			line, err := reader.ReadBytes('\n')
			if err != nil {
				if err == io.EOF {
					return
				}
				var netErr net.Error
				if errors.As(err, &netErr) && netErr.Timeout() {
					continue
				}
				log.Printf("TCP read error: %v", err)
				return
			}

			// Parse and handle message
			msg, err := s.parser.Parse(line, host)
			if err != nil {
				log.Printf("Parse error: %v", err)
				continue
			}
			s.handler(msg)
		}
	}
}

// Stop stops the TCP server.
func (s *TCPServer) Stop() error {
	if s.listener != nil {
		s.listener.Close()
	}

	// Close all connections
	s.connMu.Lock()
	for conn := range s.connections {
		conn.Close()
	}
	s.connections = make(map[net.Conn]struct{})
	s.connMu.Unlock()

	return nil
}
