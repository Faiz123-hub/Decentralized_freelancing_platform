import { parseCaipAccountId, parseCaipChainId, } from '@metamask/utils';
import { deflate } from 'pako';
import { getPlatformType, PlatformType, } from '../../domain';
/**
 * Returns the global object for the current JS environment.
 *
 * @returns The global object as a record for indexing
 */
export function getGlobalObject() {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    throw new Error('Unable to locate global object');
}
/**
 * Cross-platform base64 encoding
 * Works in browser, Node.js, and React Native environments
 *
 * @param str
 */
function base64Encode(str) {
    if (typeof btoa !== 'undefined') {
        // Browser and React Native with polyfills
        return btoa(str);
    }
    else if (typeof Buffer !== 'undefined') {
        // Node.js
        return Buffer.from(str).toString('base64');
    }
    throw new Error('No base64 encoding method available');
}
/**
 * Compress a string using pako (deflateRaw)
 * Returns a base64-encoded compressed string
 *
 * @param str
 */
export function compressString(str) {
    const compressed = deflate(str);
    // Convert Uint8Array to string for base64 encoding
    const binaryString = String.fromCharCode.apply(null, Array.from(compressed));
    return base64Encode(binaryString);
}
/**
 *
 * @param dapp
 */
export function getDappId(dapp) {
    var _a;
    return (_a = dapp.url) !== null && _a !== void 0 ? _a : dapp.name;
}
/**
 *
 * @param options
 * @param deeplink
 * @param universalLink
 */
export function openDeeplink(options, deeplink, universalLink) {
    var _a;
    const { mobile } = options;
    const useDeeplink = (_a = mobile === null || mobile === void 0 ? void 0 : mobile.useDeeplink) !== null && _a !== void 0 ? _a : true;
    if (useDeeplink) {
        if (typeof window !== 'undefined') {
            // We don't need to open a deeplink in a new tab
            // It avoid the browser to display a blank page
            window.location.href = deeplink;
        }
    }
    else if (typeof document !== 'undefined') {
        // Workaround for https://github.com/rainbow-me/rainbowkit/issues/524.
        // Using 'window.open' causes issues on iOS in non-Safari browsers and
        // WebViews where a blank tab is left behind after connecting.
        // This is especially bad in some WebView scenarios (e.g. following a
        // link from Twitter) where the user doesn't have any mechanism for
        // closing the blank tab.
        // For whatever reason, links with a target of "_blank" don't suffer
        // from this problem, and programmatically clicking a detached link
        // element with the same attributes also avoids the issue.
        const link = document.createElement('a');
        link.href = universalLink;
        link.target = '_self';
        link.rel = 'noreferrer noopener';
        link.click();
    }
}
/**
 * Merges existing session (from getCaipSession) with newly requested scopes, accounts, and session properties.
 * Derives existing scopes/accounts from sessionData.sessionScopes, then merges with requested values.
 *
 * @param sessionData - Current CAIP session data
 * @param scopes - Newly requested scopes
 * @param caipAccountIds - Newly requested account IDs
 * @param sessionProperties - New session properties to merge over existing
 * @returns requestedScopes, requestedCaipAccountIds, and requestedSessionProperties
 */
export function mergeRequestedSessionWithExisting(sessionData, scopes, caipAccountIds, sessionProperties) {
    const existingCaipChainIds = Object.keys(sessionData.sessionScopes);
    const existingCaipAccountIds = [];
    Object.values(sessionData.sessionScopes).forEach((scopeObject) => {
        if ((scopeObject === null || scopeObject === void 0 ? void 0 : scopeObject.accounts) && Array.isArray(scopeObject.accounts)) {
            scopeObject.accounts.forEach((account) => {
                existingCaipAccountIds.push(account);
            });
        }
    });
    const mergedScopes = Array.from(new Set([...existingCaipChainIds, ...scopes]));
    const mergedCaipAccountIds = Array.from(new Set([...existingCaipAccountIds, ...caipAccountIds]));
    const mergedSessionProperties = Object.assign(Object.assign({}, sessionData.sessionProperties), sessionProperties);
    return {
        mergedScopes,
        mergedCaipAccountIds,
        mergedSessionProperties,
    };
}
/**
 *
 * @param scopes
 */
export function getOptionalScopes(scopes) {
    return scopes.reduce((prev, scope) => (Object.assign(Object.assign({}, prev), { [scope]: {
            methods: [],
            notifications: [],
            accounts: [],
        } })), {});
}
export const extractFavicon = () => {
    var _a;
    if (typeof document === 'undefined') {
        return undefined;
    }
    let favicon;
    const nodeList = document.getElementsByTagName('link');
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i].getAttribute('rel') === 'icon' ||
            nodeList[i].getAttribute('rel') === 'shortcut icon') {
            favicon = (_a = nodeList[i].getAttribute('href')) !== null && _a !== void 0 ? _a : undefined;
        }
    }
    return favicon;
};
/**
 * Normalizes a non-http(s) URL from a React Native app into a valid https URL.
 * Extracts the scheme, sanitizes it to a DNS-safe label, and builds a .rn.dapp.local URL.
 *
 * @param url - The original URL to normalize
 * @returns An object with the normalized URL and original scheme, or undefined if no normalization needed
 */
function normalizeNativeUrl(url) {
    var _a;
    // Matches "http://" or "https://"
    const httpPattern = /^https?:\/\//u;
    if (httpPattern.test(url)) {
        return undefined;
    }
    // Captures the scheme before "://" — e.g. "myapp" from "myapp://path"
    const schemeMatch = url.match(/^([^:]*):\/\//u);
    const rawScheme = (_a = schemeMatch === null || schemeMatch === void 0 ? void 0 : schemeMatch[1]) !== null && _a !== void 0 ? _a : url;
    const sanitized = rawScheme
        .toLowerCase()
        // Replace non-DNS chars with hyphens — e.g. "My.App" -> "my-app"
        .replace(/[^a-z0-9-]/gu, '-')
        // Strip leading/trailing hyphens — e.g. "-my-app-" -> "my-app"
        .replace(/^-+|-+$/gu, '');
    const subdomain = (sanitized || 'unknown').slice(0, 63).replace(/-+$/u, '');
    return {
        url: `https://${subdomain}.rn.dapp.local`,
        nativeScheme: url,
    };
}
/**
 *
 * @param options
 */
export function setupDappMetadata(options) {
    var _a, _b;
    const platform = getPlatformType();
    const isBrowser = platform === PlatformType.DesktopWeb ||
        platform === PlatformType.MobileWeb ||
        platform === PlatformType.MetaMaskMobileWebview;
    if (!((_a = options.dapp) === null || _a === void 0 ? void 0 : _a.name)) {
        throw new Error('You must provide dapp name');
    }
    if (isBrowser) {
        options.dapp = Object.assign(Object.assign({}, options.dapp), { url: `${window.location.protocol}//${window.location.host}` });
    }
    if (!((_b = options.dapp) === null || _b === void 0 ? void 0 : _b.url)) {
        throw new Error('You must provide dapp url');
    }
    // Normalize non-http(s) URLs on React Native platforms
    if (platform === PlatformType.ReactNative && options.dapp.url) {
        const normalized = normalizeNativeUrl(options.dapp.url);
        if (normalized) {
            console.info(`Normalizing dapp URL for React Native: "${options.dapp.url}" -> "${normalized.url}"`);
            options.dapp = Object.assign(Object.assign({}, options.dapp), { url: normalized.url, nativeScheme: normalized.nativeScheme });
        }
    }
    const BASE_64_ICON_MAX_LENGTH = 163400;
    // Check if iconUrl and url are valid
    const urlPattern = /^(http|https):\/\/[^\s]*$/u; // Regular expression for URLs starting with http:// or https://
    if (options.dapp) {
        if ('iconUrl' in options.dapp) {
            if (options.dapp.iconUrl && !urlPattern.test(options.dapp.iconUrl)) {
                console.warn('Invalid dappMetadata.iconUrl: URL must start with http:// or https://');
                options.dapp.iconUrl = undefined;
            }
        }
        // This check ensures that the base64Icon string in the dappMetadata does not exceed 163,400 characters.
        // The character limit is important because a longer base64-encoded string causes the connection to the mobile app to fail.
        // Keeping the base64Icon string length below this threshold ensures reliable communication and functionality.
        if ('base64Icon' in options.dapp) {
            if (options.dapp.base64Icon &&
                options.dapp.base64Icon.length > BASE_64_ICON_MAX_LENGTH) {
                console.warn('Invalid dappMetadata.base64Icon: Base64-encoded icon string length must be less than 163400 characters');
                options.dapp.base64Icon = undefined;
            }
        }
        if (options.dapp.url && !urlPattern.test(options.dapp.url)) {
            console.warn('Invalid dappMetadata.url: URL must start with http:// or https://');
        }
        const favicon = extractFavicon();
        if (favicon &&
            !('iconUrl' in options.dapp) &&
            !('base64Icon' in options.dapp)) {
            const faviconUrl = `${window.location.protocol}//${window.location.host}${favicon}`;
            // @ts-expect-error -- iconUrl may not exist on all dapp types
            options.dapp.iconUrl = faviconUrl;
        }
    }
    return options;
}
/**
 * Enhanced scope checking function that validates both scopes and accounts
 *
 * @param currentScopes - Current scopes from the existing session
 * @param proposedScopes - Proposed scopes from the connect options
 * @param walletSession - The existing wallet session data
 * @param proposedCaipAccountIds - Proposed account IDs from the connect options
 * @returns true if scopes and accounts match, false otherwise
 */
export function isSameScopesAndAccounts(currentScopes, proposedScopes, walletSession, proposedCaipAccountIds) {
    const isSameScopes = currentScopes.every((scope) => proposedScopes.includes(scope)) &&
        proposedScopes.every((scope) => currentScopes.includes(scope));
    if (!isSameScopes) {
        return false;
    }
    const existingAccountIds = Object.values(walletSession.sessionScopes)
        .filter(({ accounts }) => Boolean(accounts))
        .flatMap(({ accounts }) => accounts !== null && accounts !== void 0 ? accounts : []);
    const allProposedAccountsIncluded = proposedCaipAccountIds.every((proposedAccountId) => existingAccountIds.includes(proposedAccountId));
    return allProposedAccountsIncluded;
}
/**
 *
 * @param caipAccountIds
 */
export function getValidAccounts(caipAccountIds) {
    return caipAccountIds.reduce((caipAccounts, caipAccountId) => {
        try {
            // biome-ignore lint/performance/noAccumulatingSpread: Needed
            return [...caipAccounts, parseCaipAccountId(caipAccountId)];
        }
        catch (error) {
            const stringifiedAccountId = JSON.stringify(caipAccountId);
            console.error(`Invalid CAIP account ID: ${stringifiedAccountId}`, error);
            return caipAccounts;
        }
    }, []);
}
/**
 * Adds valid accounts to their corresponding scopes based on chain namespace and reference.
 * Returns a new OptionalScopes object without modifying the input.
 *
 * @param optionalScopes - The scopes to add accounts to
 * @param validAccounts - Array of parsed valid accounts
 * @returns A new OptionalScopes object with accounts added to matching scopes
 */
export function addValidAccounts(optionalScopes, validAccounts) {
    var _a;
    if (!optionalScopes || !(validAccounts === null || validAccounts === void 0 ? void 0 : validAccounts.length)) {
        return optionalScopes;
    }
    const result = Object.fromEntries(Object.entries(optionalScopes).map(([scope, scopeData]) => {
        var _a, _b, _c;
        return [
            scope,
            {
                methods: [...((_a = scopeData === null || scopeData === void 0 ? void 0 : scopeData.methods) !== null && _a !== void 0 ? _a : [])],
                notifications: [...((_b = scopeData === null || scopeData === void 0 ? void 0 : scopeData.notifications) !== null && _b !== void 0 ? _b : [])],
                accounts: [...((_c = scopeData === null || scopeData === void 0 ? void 0 : scopeData.accounts) !== null && _c !== void 0 ? _c : [])],
            },
        ];
    }));
    // Group accounts by their chain identifier for efficient lookup
    const accountsByChain = new Map();
    for (const account of validAccounts) {
        const chainKey = `${account.chain.namespace}:${account.chain.reference}`;
        const accountId = `${account.chainId}:${account.address}`;
        if (!accountsByChain.has(chainKey)) {
            accountsByChain.set(chainKey, []);
        }
        (_a = accountsByChain.get(chainKey)) === null || _a === void 0 ? void 0 : _a.push(accountId);
    }
    // Add accounts to matching scopes
    for (const [scopeKey, scopeData] of Object.entries(result)) {
        if (!(scopeData === null || scopeData === void 0 ? void 0 : scopeData.accounts)) {
            continue;
        }
        try {
            const scope = scopeKey;
            const scopeDetails = parseCaipChainId(scope);
            const chainKey = `${scopeDetails.namespace}:${scopeDetails.reference}`;
            const matchingAccounts = accountsByChain.get(chainKey);
            if (matchingAccounts) {
                const existingAccounts = new Set(scopeData.accounts);
                const newAccounts = matchingAccounts.filter((account) => !existingAccounts.has(account));
                scopeData.accounts.push(...newAccounts);
            }
        }
        catch (error) {
            console.error(`Invalid scope format: ${scopeKey}`, error);
        }
    }
    return result;
}
// uint32 (two's complement) max
// more conservative than Number.MAX_SAFE_INTEGER
const MAX = 4294967295;
let idCounter = Math.floor(Math.random() * MAX);
export const getUniqueRequestId = () => {
    idCounter = (idCounter + 1) % MAX;
    return idCounter;
};
//# sourceMappingURL=index.js.map