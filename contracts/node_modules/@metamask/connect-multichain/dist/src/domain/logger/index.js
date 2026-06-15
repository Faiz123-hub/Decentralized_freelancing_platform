var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line import-x/no-extraneous-dependencies
import debug from 'debug';
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
export const createLogger = (namespace = 'metamask-sdk', color = '214') => {
    const logger = debug(namespace);
    logger.color = color; // Yellow color (basic ANSI)
    return logger;
};
/**
 * Enables debug logging for the specified namespace.
 *
 * This function activates debug output for the given namespace,
 * allowing debug messages to be displayed in the console.
 *
 * @param namespace - The debug namespace to enable
 */
export const enableDebug = (namespace = 'metamask-sdk') => {
    debug.enable(namespace);
};
/**
 * Checks if a specific namespace is enabled in the given debug value string.
 *
 * This function determines whether debug logging should be active for a namespace
 * by checking if the debug value contains the namespace, a wildcard pattern, or
 * the general MetaMask SDK wildcard.
 *
 * @param debugValue - The debug configuration string (e.g., from environment or storage)
 * @param namespace - The namespace to check for enablement
 * @returns True if the namespace should have debug logging enabled, false otherwise
 */
function isNamespaceEnabled(debugValue, namespace) {
    return (debugValue.includes(namespace) ||
        debugValue.includes('metamask-sdk:*') ||
        debugValue.includes('*'));
}
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
export const isEnabled = (namespace, storage) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ('process' in globalThis && ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.DEBUG)) {
        const { DEBUG } = process.env;
        return isNamespaceEnabled(DEBUG, namespace);
    }
    const storageDebug = yield storage.getDebug();
    if (storageDebug) {
        return isNamespaceEnabled(storageDebug, namespace);
    }
    return false;
});
//# sourceMappingURL=index.js.map