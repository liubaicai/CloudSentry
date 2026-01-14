// Package main provides the entry point for the syslog collector.
package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/liubaicai/CloudSentry/syslog-collector/config"
	"github.com/liubaicai/CloudSentry/syslog-collector/internal/buffer"
	"github.com/liubaicai/CloudSentry/syslog-collector/internal/forwarder"
	"github.com/liubaicai/CloudSentry/syslog-collector/internal/parser"
	"github.com/liubaicai/CloudSentry/syslog-collector/internal/server"
)

func main() {
	// Parse command line flags
	configPath := flag.String("config", "", "Path to configuration file")
	flag.Parse()

	// Load configuration
	var cfg *config.Config
	var err error

	if *configPath != "" {
		cfg, err = config.Load(*configPath)
		if err != nil {
			log.Fatalf("Failed to load config: %v", err)
		}
	} else {
		cfg = config.DefaultConfig()
	}

	// Create context with cancellation
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Create HTTP forwarder
	fwd := forwarder.NewHTTPForwarder(
		cfg.Forwarder.BackendURL,
		cfg.Forwarder.Timeout,
		cfg.Forwarder.RetryCount,
		cfg.Forwarder.RetryDelay,
	)

	// Create buffer queue with forwarder as handler
	queue := buffer.NewQueue(
		cfg.Buffer.MaxSize,
		cfg.Buffer.FlushSize,
		cfg.Buffer.FlushInterval,
		func(messages []*parser.SyslogMessage) {
			if err := fwd.Forward(ctx, messages); err != nil {
				log.Printf("Forward error: %v", err)
			}
		},
	)

	// Start buffer queue flush timer
	go queue.Start(ctx)

	// Message handler that pushes to queue
	messageHandler := func(msg *parser.SyslogMessage) {
		queue.Push(msg)
	}

	// Start UDP server
	if cfg.Server.UDP.Enabled {
		udpServer := server.NewUDPServer(
			cfg.Server.UDP.Port,
			cfg.Server.UDP.BufferSize,
			messageHandler,
		)
		if err := udpServer.Start(ctx); err != nil {
			log.Fatalf("Failed to start UDP server: %v", err)
		}
		defer udpServer.Stop()
	}

	// Start TCP server
	if cfg.Server.TCP.Enabled {
		tcpServer := server.NewTCPServer(
			cfg.Server.TCP.Port,
			cfg.Server.TCP.MaxConnections,
			messageHandler,
		)
		if err := tcpServer.Start(ctx); err != nil {
			log.Fatalf("Failed to start TCP server: %v", err)
		}
		defer tcpServer.Stop()
	}

	log.Printf("Syslog collector started, forwarding to %s", cfg.Forwarder.BackendURL)

	// Wait for shutdown signal
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	log.Println("Shutting down...")
	cancel()

	// Flush remaining messages
	queue.Stop()

	log.Println("Goodbye!")
}
