// Package config provides configuration management for the syslog collector.
package config

import (
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

// Config represents the main configuration structure.
type Config struct {
	Server    ServerConfig    `yaml:"server"`
	Buffer    BufferConfig    `yaml:"buffer"`
	Forwarder ForwarderConfig `yaml:"forwarder"`
	Metrics   MetricsConfig   `yaml:"metrics"`
	Logging   LoggingConfig   `yaml:"logging"`
}

// ServerConfig contains syslog server settings.
type ServerConfig struct {
	UDP UDPConfig `yaml:"udp"`
	TCP TCPConfig `yaml:"tcp"`
}

// UDPConfig contains UDP server settings.
type UDPConfig struct {
	Enabled    bool `yaml:"enabled"`
	Port       int  `yaml:"port"`
	BufferSize int  `yaml:"buffer_size"`
}

// TCPConfig contains TCP server settings.
type TCPConfig struct {
	Enabled        bool `yaml:"enabled"`
	Port           int  `yaml:"port"`
	MaxConnections int  `yaml:"max_connections"`
}

// BufferConfig contains buffer queue settings.
type BufferConfig struct {
	Type          string        `yaml:"type"`
	MaxSize       int           `yaml:"max_size"`
	FlushInterval time.Duration `yaml:"flush_interval"`
	FlushSize     int           `yaml:"flush_size"`
}

// ForwarderConfig contains backend forwarder settings.
type ForwarderConfig struct {
	BackendURL string        `yaml:"backend_url"`
	Timeout    time.Duration `yaml:"timeout"`
	RetryCount int           `yaml:"retry_count"`
	RetryDelay time.Duration `yaml:"retry_delay"`
}

// MetricsConfig contains metrics endpoint settings.
type MetricsConfig struct {
	Enabled bool   `yaml:"enabled"`
	Port    int    `yaml:"port"`
	Path    string `yaml:"path"`
}

// LoggingConfig contains logging settings.
type LoggingConfig struct {
	Level  string `yaml:"level"`
	Format string `yaml:"format"`
}

// DefaultConfig returns the default configuration.
func DefaultConfig() *Config {
	return &Config{
		Server: ServerConfig{
			UDP: UDPConfig{
				Enabled:    true,
				Port:       514,
				BufferSize: 65535,
			},
			TCP: TCPConfig{
				Enabled:        true,
				Port:           514,
				MaxConnections: 1000,
			},
		},
		Buffer: BufferConfig{
			Type:          "memory",
			MaxSize:       10000,
			FlushInterval: time.Second,
			FlushSize:     100,
		},
		Forwarder: ForwarderConfig{
			BackendURL: "http://localhost:3000/api/syslog/bulk",
			Timeout:    10 * time.Second,
			RetryCount: 3,
			RetryDelay: time.Second,
		},
		Metrics: MetricsConfig{
			Enabled: true,
			Port:    9090,
			Path:    "/metrics",
		},
		Logging: LoggingConfig{
			Level:  "info",
			Format: "json",
		},
	}
}

// Load loads configuration from a YAML file.
func Load(path string) (*Config, error) {
	cfg := DefaultConfig()

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, err
	}

	// Override with environment variables if set
	cfg.applyEnvOverrides()

	return cfg, nil
}

// applyEnvOverrides applies environment variable overrides.
func (c *Config) applyEnvOverrides() {
	if url := os.Getenv("BACKEND_URL"); url != "" {
		c.Forwarder.BackendURL = url
	}
	if port := os.Getenv("UDP_PORT"); port != "" {
		// Parse and set UDP port
	}
	if port := os.Getenv("TCP_PORT"); port != "" {
		// Parse and set TCP port
	}
}
