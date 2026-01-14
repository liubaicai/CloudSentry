// Package server provides UDP and TCP syslog server implementations.
package server

import (
	"context"
	"log"
	"net"

	"github.com/liubaicai/CloudSentry/syslog-collector/internal/parser"
)

// MessageHandler is a function that handles parsed syslog messages.
type MessageHandler func(msg *parser.SyslogMessage)

// UDPServer represents a UDP syslog server.
type UDPServer struct {
	port       int
	bufferSize int
	parser     *parser.Parser
	handler    MessageHandler
	conn       *net.UDPConn
}

// NewUDPServer creates a new UDP syslog server.
func NewUDPServer(port, bufferSize int, handler MessageHandler) *UDPServer {
	return &UDPServer{
		port:       port,
		bufferSize: bufferSize,
		parser:     parser.New(),
		handler:    handler,
	}
}

// Start starts the UDP server.
func (s *UDPServer) Start(ctx context.Context) error {
	addr := &net.UDPAddr{
		Port: s.port,
		IP:   net.IPv4zero,
	}

	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		return err
	}
	s.conn = conn

	log.Printf("UDP syslog server listening on port %d", s.port)

	go s.listen(ctx)

	return nil
}

// listen handles incoming UDP messages.
func (s *UDPServer) listen(ctx context.Context) {
	buffer := make([]byte, s.bufferSize)

	for {
		select {
		case <-ctx.Done():
			return
		default:
			n, remoteAddr, err := s.conn.ReadFromUDP(buffer)
			if err != nil {
				log.Printf("UDP read error: %v", err)
				continue
			}

			// Parse message in goroutine to avoid blocking
			data := make([]byte, n)
			copy(data, buffer[:n])

			go func(data []byte, addr string) {
				msg, err := s.parser.Parse(data, addr)
				if err != nil {
					log.Printf("Parse error: %v", err)
					return
				}
				s.handler(msg)
			}(data, remoteAddr.IP.String())
		}
	}
}

// Stop stops the UDP server.
func (s *UDPServer) Stop() error {
	if s.conn != nil {
		return s.conn.Close()
	}
	return nil
}
