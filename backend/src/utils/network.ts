
import { Request } from 'express';

/**
 * Checks if an IP address is a private IP or Docker bridge IP.
 * Private ranges:
 * 10.0.0.0 - 10.255.255.255
 * 172.16.0.0 - 172.31.255.255 (Docker default is 172.17.x.x, 172.18.x.x, etc.)
 * 192.168.0.0 - 192.168.255.255
 * 127.0.0.0 - 127.255.255.255
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip) return false;
  
  // Localhost
  if (ip === '::1' || ip.startsWith('127.')) return true;

  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;

  // 10.x.x.x
  if (parts[0] === 10) return true;

  // 172.16.x.x - 172.31.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // 192.168.x.x
  if (parts[0] === 192 && parts[1] === 168) return true;

  return false;
}

/**
 * Specifically checks for Docker Gateway IPs (often x.x.x.1 in private ranges)
 * This is a heuristic.
 */
export function isDockerGateway(ip: string): boolean {
  if (!isPrivateIp(ip)) return false;
  // Docker gateways usually end in .1
  return ip.endsWith('.1');
}

/**
 * Extracts the real client IP from an Express request,
 * handling various proxy headers.
 */
export function getClientIp(req: Request): string {
  // 1. Try standard X-Forwarded-For header (standard for proxies like Caddy, Nginx)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // Header can contain multiple IPs: "client, proxy1, proxy2"
    // The first one is the original client
    const ips = (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor).split(',');
    return ips[0].trim();
  }

  // 2. Try X-Real-IP (common alternative)
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
  }

  // 3. Try CF-Connecting-IP (Cloudflare)
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) {
    return Array.isArray(cfIp) ? cfIp[0] : cfIp;
  }

  // 4. Fallback to Express req.ip or socket remoteAddress
  return req.ip || req.connection.remoteAddress || 'unknown';
}
