/**
 * Enhanced Syslog Parser Module
 * 
 * This module provides comprehensive syslog message parsing with support for:
 * - RFC 3164 (BSD Syslog Protocol) - Traditional syslog format
 * - RFC 5424 (The Syslog Protocol) - Modern syslog with structured data
 * - Fallback parsing for malformed or non-standard messages
 * 
 * The parser uses the glossy library for professional-grade parsing and includes
 * an intelligent fallback mechanism to ensure all messages are processed, even
 * if they don't conform to RFC standards.
 * 
 * Key features:
 * - Extracts all standard syslog fields (priority, facility, severity, timestamp, etc.)
 * - Parses structured data from RFC 5424 messages
 * - Handles hostname, application name, process ID, and message ID
 * - Automatic format detection
 * - Graceful degradation for malformed messages
 * 
 * @module syslogParser
 */

import * as glossy from 'glossy';
import { logger } from './logger';
import { isDockerGateway } from './network';

/**
 * Extended Glossy parse result interface
 * 
 * The @types/glossy package exists but is incomplete - it's missing several
 * fields that the actual glossy library returns (prival, facilityID, severityID, etc.).
 * This interface extends the basic types with the actual fields we receive.
 */
interface GlossyParseResult {
  originalMessage?: string;
  type?: 'RFC3164' | 'RFC5424';
  prival?: number;
  facilityID?: number;
  severityID?: number;
  facility?: string;
  severity?: string;
  time?: Date | null;
  host?: string | null;
  appName?: string | null;
  pid?: string | null;
  msgID?: string | null;
  structuredData?: any;
  message?: string;
}

/**
 * Parsed syslog message with all standard fields
 */
export interface ParsedSyslogMessage {
  timestamp: Date;
  severity: string;
  category: string;
  source: string;
  message: string;
  rawLog: string;
  protocol: string;
  metadata: {
    priority?: number;
    facility?: number;
    facilityName?: string;
    severityLevel?: number;
    severityName?: string;
    hostname?: string;
    appName?: string;
    pid?: string;
    msgId?: string;
    structuredData?: any;
    originalFormat?: 'RFC3164' | 'RFC5424' | 'unknown';
  };
}

/**
 * Maps syslog severity level to our application severity
 */
const severityMap: Record<number, string> = {
  0: 'critical', // Emergency
  1: 'critical', // Alert
  2: 'critical', // Critical
  3: 'high',     // Error
  4: 'medium',   // Warning
  5: 'low',      // Notice
  6: 'info',     // Informational
  7: 'info',     // Debug
};

/**
 * Maps syslog facility to category
 */
const facilityMap: Record<number, string> = {
  0: 'kernel',
  1: 'user',
  2: 'mail',
  3: 'daemon',
  4: 'auth',
  5: 'syslog',
  6: 'printer',
  7: 'news',
  8: 'uucp',
  9: 'cron',
  10: 'authpriv',
  11: 'ftp',
  12: 'ntp',
  13: 'audit',
  14: 'alert',
  15: 'clock',
  16: 'local0',
  17: 'local1',
  18: 'local2',
  19: 'local3',
  20: 'local4',
  21: 'local5',
  22: 'local6',
  23: 'local7',
};

/**
 * Glossy parser instances
 */
const glossyParse = glossy.Parse;

/**
 * Parse syslog message using glossy library with fallback to basic parsing
 * Supports RFC3164 (BSD syslog) and RFC5424 (new syslog) formats
 * 
 * @param message Raw syslog message string
 * @param remoteAddress Source IP address
 * @returns Parsed syslog message with all extracted fields
 */
export function parseSyslogMessage(
  message: string,
  remoteAddress: string
): ParsedSyslogMessage {
  const rawMessage = message.trim();
  const cleanRemoteAddress = remoteAddress.replace(/^::ffff:/, '');
  
  try {
    // Try parsing with glossy
    const parsed = glossyParse.parse(rawMessage) as GlossyParseResult | undefined;
    
    if (parsed && parsed.prival !== undefined) {
      // Successfully parsed by glossy
      const facility = parsed.facilityID ?? 1; // Default to user
      const severity = parsed.severityID ?? 5; // Format RFC5424 timestamp
      if (parsed.time) {
        // RFC5424 provides reliable timestamp
      }

      return {
        timestamp: parsed.time || new Date(),
        severity: severityMap[severity] || 'info',
        category: facilityMap[facility] || 'unknown',
        source: cleanRemoteAddress,
        message: parsed.message || rawMessage,
        rawLog: rawMessage,
        protocol: 'syslog',
        metadata: {
          priority: parsed.prival,
          facility: facility,
          facilityName: parsed.facility || facilityMap[facility],
          severityLevel: severity,
          severityName: parsed.severity,
          hostname: parsed.host || undefined,
          appName: parsed.appName || undefined,
          pid: parsed.pid || undefined,
          msgId: parsed.msgID || undefined,
          structuredData: parsed.structuredData,
          originalFormat: parsed.type || 'unknown',
        },
      };
    }
  } catch (error) {
    // Glossy parsing failed, fall through to basic parsing
    logger.debug(`Glossy parsing failed, using fallback: ${error}`);
  }
  
  // Fallback to basic parsing for non-standard or malformed messages
  return parseBasicSyslog(rawMessage, cleanRemoteAddress);
}

/**
 * Basic fallback parser for malformed or non-standard syslog messages
 * This ensures we can still process messages even if they don't conform to RFC standards
 * 
 * @param message Raw syslog message
 * @param remoteAddress Source IP address
 * @returns Parsed message with basic fields
 */
function parseBasicSyslog(
  message: string,
  remoteAddress: string
): ParsedSyslogMessage {
  const rawMessage = message.trim();
  
  // Try to extract priority value from start of message
  const priorityMatch = rawMessage.match(/^<(\d+)>(.*)$/);
  
  let priority = 13; // Default to user.notice
  let content = rawMessage;
  
  if (priorityMatch) {
    priority = parseInt(priorityMatch[1], 10);
    content = priorityMatch[2];
  }
  
  // Calculate facility and severity from priority
  const facility = Math.floor(priority / 8);
  const severityLevel = priority % 8;
  
  // Try to extract timestamp, hostname, and message from RFC3164 format
  // Format: MMM DD HH:MM:SS hostname tag: message
  const rfc3164Match = content.match(
    /^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(.+)$/
  );
  
  let timestamp = new Date();
  let hostname = remoteAddress;
  
  // Logic to determine hostname (source)
  // If we found a hostname in the message, and remoteAddress is a Docker Gateway, use the found hostname
  // Otherwise default to remoteAddress (IP)
  
  let messageContent = content;
  
  if (rfc3164Match) {
    // Parse timestamp (add current year since RFC3164 doesn't include it)
    // NOTE: This is fallback parsing only for malformed messages. Standard RFC
    // messages are parsed by the glossy library which handles timestamps correctly.
    // For malformed messages, we do best-effort parsing. The Date constructor
    // works reliably for the RFC3164 format in most environments, but if timestamp
    // parsing becomes an issue, consider adding a dedicated date parsing library.
    const timestampStr = rfc3164Match[1];
    const year = new Date().getFullYear();
    try {
      // Using simple Date constructor for fallback parsing
      // This works in most environments for the limited RFC3164 format
      timestamp = new Date(`${timestampStr} ${year}`);
      // If parsed date is in the future, it's likely from last year
      if (timestamp > new Date()) {
        timestamp = new Date(`${timestampStr} ${year - 1}`);
      }
    } catch (e) {
      // Keep default timestamp if parsing fails
      // Since this is fallback code, using current time is acceptable
    }
    
    const foundHostname = rfc3164Match[2];
    hostname = foundHostname;
    messageContent = rfc3164Match[3];
  }
  
  // Try to extract application name and PID from tag
  // Format: appname[pid]: message or appname: message
  const tagMatch = messageContent.match(/^(\S+?)(\[(\d+)\])?\s*:\s*(.*)$/);
  let appName: string | undefined;
  let pid: string | undefined;
  
  if (tagMatch) {
    appName = tagMatch[1];
    pid = tagMatch[3];
    messageContent = tagMatch[4];
  }
  
  return {
    timestamp,
    severity: severityMap[severityLevel] || 'info',
    category: facilityMap[facility] || 'unknown',
    source: remoteAddress,
    message: messageContent,
    rawLog: rawMessage,
    protocol: 'syslog',
    metadata: {
      priority,
      facility,
      facilityName: facilityMap[facility],
      severityLevel,
      hostname,
      appName,
      pid,
      originalFormat: 'unknown',
    },
  };
}

/**
 * Batch parse multiple syslog messages
 * 
 * @param messages Array of raw syslog messages
 * @param remoteAddress Source IP address
 * @returns Array of parsed messages
 */
export function parseSyslogMessages(
  messages: string[],
  remoteAddress: string
): ParsedSyslogMessage[] {
  return messages.map((msg) => parseSyslogMessage(msg, remoteAddress));
}
