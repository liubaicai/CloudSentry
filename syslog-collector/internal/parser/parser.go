// Package parser provides syslog message parsing functionality.
// Supports RFC 3164 (BSD syslog) and RFC 5424 (modern syslog) formats.
package parser

import (
	"time"

	"github.com/influxdata/go-syslog/v3"
	"github.com/influxdata/go-syslog/v3/rfc3164"
	"github.com/influxdata/go-syslog/v3/rfc5424"
)

// SyslogMessage represents a parsed syslog message.
type SyslogMessage struct {
	Timestamp      time.Time         `json:"timestamp"`
	Severity       string            `json:"severity"`
	Category       string            `json:"category"`
	Source         string            `json:"source"`
	Message        string            `json:"message"`
	RawLog         string            `json:"rawLog"`
	Protocol       string            `json:"protocol"`
	Metadata       map[string]any    `json:"metadata"`
}

// Parser provides syslog message parsing.
type Parser struct {
	rfc3164Parser syslog.Machine
	rfc5424Parser syslog.Machine
}

// New creates a new Parser instance.
func New() *Parser {
	return &Parser{
		rfc3164Parser: rfc3164.NewParser(rfc3164.WithBestEffort()),
		rfc5424Parser: rfc5424.NewParser(rfc5424.WithBestEffort()),
	}
}

// severityMap maps syslog severity levels to application severity strings.
var severityMap = map[uint8]string{
	0: "critical", // Emergency
	1: "critical", // Alert
	2: "critical", // Critical
	3: "high",     // Error
	4: "medium",   // Warning
	5: "low",      // Notice
	6: "info",     // Informational
	7: "info",     // Debug
}

// facilityMap maps syslog facility codes to category names.
var facilityMap = map[uint8]string{
	0:  "kernel",
	1:  "user",
	2:  "mail",
	3:  "daemon",
	4:  "auth",
	5:  "syslog",
	6:  "printer",
	7:  "news",
	8:  "uucp",
	9:  "cron",
	10: "authpriv",
	11: "ftp",
	12: "ntp",
	13: "audit",
	14: "alert",
	15: "clock",
	16: "local0",
	17: "local1",
	18: "local2",
	19: "local3",
	20: "local4",
	21: "local5",
	22: "local6",
	23: "local7",
}

// Parse parses a syslog message and returns a structured SyslogMessage.
func (p *Parser) Parse(raw []byte, remoteAddr string) (*SyslogMessage, error) {
	rawStr := string(raw)

	// Try RFC 5424 first (more modern format)
	msg, err := p.rfc5424Parser.Parse(raw)
	if err == nil && msg != nil {
		return p.convertRFC5424(msg.(*rfc5424.SyslogMessage), rawStr, remoteAddr), nil
	}

	// Fall back to RFC 3164
	msg, err = p.rfc3164Parser.Parse(raw)
	if err == nil && msg != nil {
		return p.convertRFC3164(msg.(*rfc3164.SyslogMessage), rawStr, remoteAddr), nil
	}

	// If both parsers fail, return a basic message
	return &SyslogMessage{
		Timestamp: time.Now(),
		Severity:  "info",
		Category:  "unknown",
		Source:    remoteAddr,
		Message:   rawStr,
		RawLog:    rawStr,
		Protocol:  "syslog",
		Metadata: map[string]any{
			"originalFormat": "unknown",
			"parseError":     "failed to parse as RFC 3164 or RFC 5424",
		},
	}, nil
}

// convertRFC5424 converts an RFC 5424 message to SyslogMessage.
func (p *Parser) convertRFC5424(msg *rfc5424.SyslogMessage, raw, remoteAddr string) *SyslogMessage {
	severity := uint8(6) // default to info
	facility := uint8(1) // default to user
	if msg.Priority != nil {
		severity = uint8(*msg.Priority % 8)
		facility = uint8(*msg.Priority / 8)
	}

	hostname := remoteAddr
	if msg.Hostname != nil {
		hostname = *msg.Hostname
	}

	message := raw
	if msg.Message != nil {
		message = *msg.Message
	}

	timestamp := time.Now()
	if msg.Timestamp != nil {
		timestamp = *msg.Timestamp
	}

	metadata := map[string]any{
		"originalFormat": "RFC5424",
		"facility":       facility,
		"facilityName":   facilityMap[facility],
		"severityLevel":  severity,
	}

	if msg.Hostname != nil {
		metadata["hostname"] = *msg.Hostname
	}
	if msg.Appname != nil {
		metadata["appName"] = *msg.Appname
	}
	if msg.ProcID != nil {
		metadata["pid"] = *msg.ProcID
	}
	if msg.MsgID != nil {
		metadata["msgId"] = *msg.MsgID
	}
	if msg.StructuredData != nil {
		metadata["structuredData"] = *msg.StructuredData
	}

	return &SyslogMessage{
		Timestamp: timestamp,
		Severity:  severityMap[severity],
		Category:  facilityMap[facility],
		Source:    hostname,
		Message:   message,
		RawLog:    raw,
		Protocol:  "syslog",
		Metadata:  metadata,
	}
}

// convertRFC3164 converts an RFC 3164 message to SyslogMessage.
func (p *Parser) convertRFC3164(msg *rfc3164.SyslogMessage, raw, remoteAddr string) *SyslogMessage {
	severity := uint8(6) // default to info
	facility := uint8(1) // default to user
	if msg.Priority != nil {
		severity = uint8(*msg.Priority % 8)
		facility = uint8(*msg.Priority / 8)
	}

	hostname := remoteAddr
	if msg.Hostname != nil {
		hostname = *msg.Hostname
	}

	message := raw
	if msg.Message != nil {
		message = *msg.Message
	}

	timestamp := time.Now()
	if msg.Timestamp != nil {
		timestamp = *msg.Timestamp
	}

	metadata := map[string]any{
		"originalFormat": "RFC3164",
		"facility":       facility,
		"facilityName":   facilityMap[facility],
		"severityLevel":  severity,
	}

	if msg.Hostname != nil {
		metadata["hostname"] = *msg.Hostname
	}
	if msg.Appname != nil {
		metadata["appName"] = *msg.Appname
	}
	if msg.ProcID != nil {
		metadata["pid"] = *msg.ProcID
	}

	return &SyslogMessage{
		Timestamp: timestamp,
		Severity:  severityMap[severity],
		Category:  facilityMap[facility],
		Source:    hostname,
		Message:   message,
		RawLog:    raw,
		Protocol:  "syslog",
		Metadata:  metadata,
	}
}
