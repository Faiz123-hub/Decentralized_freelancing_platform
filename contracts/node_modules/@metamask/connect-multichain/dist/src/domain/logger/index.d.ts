import debug from 'debug';
import type { StoreClient } from '../store/client';
/**
 * Supported debug namespace types for the MetaMask SDK logger.
 * These namespaces help categorize and filter debug output.
 */
export type LoggerNameSpaces = 'metamask-sdk:*' | 'metamask-sdk' | 'metamask-sdk:core' | 'metamask-sdk:provider' | 'metamask-sdk:ui' | 'metamask-sdk:transport';
/**
 * Creates a debug logger instance with the specified namespace and color.
 *
 * This function initializes a debug logger using the 'debug' library,
 * which allows for conditional logging based on environment variables or storage settings.
 *
 * @param namespace - The debug namespace to use for this logger instance
 * @param color - The ANSI color code to use for log output (default: '214' for yellow)
 * @returns A configured debug logger instance
 */
export declare const createLogger: (namespace?: LoggerNameSpaces, color?: string) => debug.Debugger;
/**
 * Enables debug logging for the specified namespace.
 *
 * This function activates debug output for the given namespace,
 * allowing debug messages to be displayed in the console.
 *
 * @param namespace - The debug namespace to enable
 */
export declare const enableDebug: (namespace?: LoggerNameSpaces) => void;
/**
 * Determines if debug logging is enabled for a specific namespace.
 *
 * This function checks multiple sources to determine if debug logging should be active:
 * 1. First checks the process environment variable 'debug'
 * 2. Falls back to checking the debug setting in storage
 * 3. Returns false if neither source enables the namespace
 *
 * @param namespace - The namespace to check for debug enablement
 * @param storage - The storage client to check for debug settings
 * @returns Promise that resolves to true if debug logging is enabled, false otherwise
 */
export declare const isEnabled: (namespace: LoggerNameSpaces, storage: StoreClient) => Promise<boolean>;
//# sourceMappingURL=index.d.ts.map