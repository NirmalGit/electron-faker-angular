import { Injectable, isDevMode } from '@angular/core';

/**
 * Logger Service - Environment-aware logging
 * 
 * Logs are only shown in development mode.
 * In production builds, all logs are suppressed for performance and security.
 * 
 * Usage:
 * ```typescript
 * constructor(private logger: LoggerService) {}
 * 
 * this.logger.log('🌐 [WEB API]', 'Fetching products');
 * this.logger.error('⚡ [ELECTRON IPC]', 'Error:', error);
 * this.logger.info('✓', 'Operation successful');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = isDevMode();
    
    if (this.isDevelopment) {
      console.log('🔧 [LOGGER] Development mode - Logging enabled');
    }
  }

  /**
   * Log informational messages (only in development)
   * @param prefix Log prefix (e.g., '🌐 [WEB API]')
   * @param message Main message
   * @param optionalParams Additional parameters
   */
  log(prefix: string, message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      console.log(`${prefix} ${message}`, ...optionalParams);
    }
  }

  /**
   * Log informational messages (alias for log)
   * @param prefix Log prefix
   * @param message Main message
   * @param optionalParams Additional parameters
   */
  info(prefix: string, message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      console.info(`${prefix} ${message}`, ...optionalParams);
    }
  }

  /**
   * Log warning messages (only in development)
   * @param prefix Log prefix
   * @param message Main message
   * @param optionalParams Additional parameters
   */
  warn(prefix: string, message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      console.warn(`${prefix} ${message}`, ...optionalParams);
    }
  }

  /**
   * Log error messages (shown in both dev and production for critical errors)
   * Note: Errors are always logged for debugging production issues
   * @param prefix Log prefix
   * @param message Main message
   * @param optionalParams Additional parameters
   */
  error(prefix: string, message: string, ...optionalParams: any[]): void {
    // Always log errors, even in production (for error tracking services)
    console.error(`${prefix} ${message}`, ...optionalParams);
  }

  /**
   * Log debug messages (only in development)
   * @param prefix Log prefix
   * @param message Main message
   * @param optionalParams Additional parameters
   */
  debug(prefix: string, message: string, ...optionalParams: any[]): void {
    if (this.isDevelopment) {
      console.debug(`${prefix} ${message}`, ...optionalParams);
    }
  }

  /**
   * Check if running in development mode
   * @returns true if development mode
   */
  isDev(): boolean {
    return this.isDevelopment;
  }

  /**
   * Log a group of messages (only in development)
   * @param groupName Group name
   * @param callback Function containing console logs
   */
  group(groupName: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.group(groupName);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Log a collapsed group of messages (only in development)
   * @param groupName Group name
   * @param callback Function containing console logs
   */
  groupCollapsed(groupName: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.groupCollapsed(groupName);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Log a table (only in development)
   * @param data Data to display as table
   * @param properties Optional properties to display
   */
  table(data: any, properties?: string[]): void {
    if (this.isDevelopment) {
      if (properties) {
        console.table(data, properties);
      } else {
        console.table(data);
      }
    }
  }

  /**
   * Start a timer (only in development)
   * @param label Timer label
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  /**
   * End a timer (only in development)
   * @param label Timer label
   */
  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}
