import type { SessionProperties } from '@metamask/multichain-api-client';
import { type CaipAccountId, type CaipChainId } from '@metamask/utils';
import { type DappSettings, type MultichainOptions, type Scope, type SessionData } from '../../domain';
export type OptionalScopes = Record<Scope, SessionData['sessionScopes'][Scope]>;
/**
 * Returns the global object for the current JS environment.
 *
 * @returns The global object as a record for indexing
 */
export declare function getGlobalObject(): Record<string, unknown>;
/**
 * Compress a string using pako (deflateRaw)
 * Returns a base64-encoded compressed string
 *
 * @param str
 */
export declare function compressString(str: string): string;
/**
 *
 * @param dapp
 */
export declare function getDappId(dapp: DappSettings): string;
/**
 *
 * @param options
 * @param deeplink
 * @param universalLink
 */
export declare function openDeeplink(options: MultichainOptions, deeplink: string, universalLink: string): void;
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
export declare function mergeRequestedSessionWithExisting(sessionData: SessionData, scopes: Scope[], caipAccountIds: CaipAccountId[], sessionProperties?: SessionProperties): {
    mergedScopes: Scope[];
    mergedCaipAccountIds: CaipAccountId[];
    mergedSessionProperties: SessionProperties;
};
/**
 *
 * @param scopes
 */
export declare function getOptionalScopes(scopes: Scope[]): OptionalScopes;
export declare const extractFavicon: () => string | undefined;
/**
 *
 * @param options
 */
export declare function setupDappMetadata(options: MultichainOptions): MultichainOptions;
/**
 * Enhanced scope checking function that validates both scopes and accounts
 *
 * @param currentScopes - Current scopes from the existing session
 * @param proposedScopes - Proposed scopes from the connect options
 * @param walletSession - The existing wallet session data
 * @param proposedCaipAccountIds - Proposed account IDs from the connect options
 * @returns true if scopes and accounts match, false otherwise
 */
export declare function isSameScopesAndAccounts(currentScopes: Scope[], proposedScopes: Scope[], walletSession: SessionData, proposedCaipAccountIds: CaipAccountId[]): boolean;
/**
 *
 * @param caipAccountIds
 */
export declare function getValidAccounts(caipAccountIds: CaipAccountId[]): {
    address: import("@metamask/utils").CaipAccountAddress;
    chainId: CaipChainId;
    chain: {
        namespace: import("@metamask/utils").CaipNamespace;
        reference: import("@metamask/utils").CaipReference;
    };
}[];
/**
 * Adds valid accounts to their corresponding scopes based on chain namespace and reference.
 * Returns a new OptionalScopes object without modifying the input.
 *
 * @param optionalScopes - The scopes to add accounts to
 * @param validAccounts - Array of parsed valid accounts
 * @returns A new OptionalScopes object with accounts added to matching scopes
 */
export declare function addValidAccounts(optionalScopes: OptionalScopes, validAccounts: ReturnType<typeof getValidAccounts>): OptionalScopes;
export declare const getUniqueRequestId: () => number;
//# sourceMappingURL=index.d.ts.map