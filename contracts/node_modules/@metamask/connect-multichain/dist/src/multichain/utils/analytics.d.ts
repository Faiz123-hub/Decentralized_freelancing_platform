import type { InvokeMethodOptions, MultichainOptions, PlatformType, StoreClient, TransportType } from '../../domain';
/**
 * Checks if an error represents a user rejection.
 *
 * @param error - The error object to check
 * @returns True if the error indicates a user rejection, false otherwise
 */
export declare function isRejectionError(error: unknown): boolean;
/**
 * Gets base analytics properties that are common across all events.
 *
 * @param options - Multichain options containing dapp and analytics config
 * @param storage - Storage client for getting anonymous ID
 * @returns Base analytics properties
 */
export declare function getBaseAnalyticsProperties(options: MultichainOptions, storage: StoreClient): Promise<{
    mmconnect_versions: Record<string, string>;
    dapp_id: string;
    platform: PlatformType;
    anon_id: string;
}>;
/**
 * Gets analytics properties specific to wallet action events.
 *
 * @param options - Multichain options containing dapp and analytics config
 * @param storage - Storage client for getting anonymous ID
 * @param invokeOptions - The invoke method options containing method and scope
 * @param transportType - The transport type to use for the analytics event
 * @returns Wallet action analytics properties
 */
export declare function getWalletActionAnalyticsProperties(options: MultichainOptions, storage: StoreClient, invokeOptions: InvokeMethodOptions, transportType: TransportType): Promise<{
    mmconnect_versions: Record<string, string>;
    dapp_id: string;
    method: string;
    caip_chain_id: string;
    anon_id: string;
    transport_type: TransportType;
}>;
//# sourceMappingURL=analytics.d.ts.map