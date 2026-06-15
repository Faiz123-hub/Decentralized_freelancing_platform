import type { Session, SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import type { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';
import { type SessionProperties, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { CaipAccountId } from '@metamask/utils';
import { type ExtendedTransport, type Scope, type StoreAdapter } from '../../../domain';
type PendingRequests = {
    request: {
        jsonrpc: string;
        id: string;
    } & TransportRequest;
    method: string;
    resolve: (value: TransportResponse) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
};
/**
 * Mobile Wallet Protocol transport implementation
 * Bridges the MWP DappClient with the multichain API client Transport interface
 */
export declare class MWPTransport implements ExtendedTransport {
    private dappClient;
    private kvstore;
    private options;
    private __pendingRequests;
    private notificationCallbacks;
    private currentSessionRequest;
    private windowFocusHandler;
    get pendingRequests(): Map<string, PendingRequests>;
    set pendingRequests(pendingRequests: Map<string, PendingRequests>);
    get sessionRequest(): SessionRequest | undefined;
    constructor(dappClient: DappClient, kvstore: StoreAdapter, options?: {
        requestTimeout: number;
        connectionTimeout: number;
        resumeTimeout: number;
    });
    /**
     * Returns the stored pending session request from the dappClient session_request event, if any.
     *
     * @returns The stored SessionRequest, or null if none or invalid.
     */
    getStoredPendingSessionRequest(): Promise<SessionRequest | null>;
    /**
     * Removes the stored pending session request from the KVStore.
     * This is necessary to ensure that ConnectMultichain is able to correctly
     * infer the MWP Transport connection attempt status.
     */
    private removeStoredPendingSessionRequest;
    private onWindowFocus;
    private notifyCallbacks;
    private rejectRequest;
    private parseWalletError;
    private handleMessage;
    private onResumeSuccess;
    init(): Promise<void>;
    sendEip1193Message<TRequest extends TransportRequest, TResponse extends TransportResponse>(payload: TRequest, options?: {
        timeout?: number;
    }): Promise<TResponse>;
    connect(options?: {
        scopes: Scope[];
        caipAccountIds: CaipAccountId[];
        sessionProperties?: SessionProperties;
        forceRequest?: boolean;
    }): Promise<void>;
    /**
     * Disconnects from the Mobile Wallet Protocol
     *
     * @param [scopes] - The scopes to revoke. If not provided or empty, all scopes will be revoked.
     * @returns Nothing
     */
    disconnect(scopes?: Scope[]): Promise<void>;
    /**
     * Checks if the transport is connected
     *
     * @returns True if transport is connected, false otherwise
     */
    isConnected(): boolean;
    /**
     * Attempts to re-establish a connection via DappClient
     *
     * @returns Nothing
     */
    private attemptResumeSession;
    private getCachedResponse;
    private storeWalletSession;
    request<TRequest extends TransportRequest, TResponse extends TransportResponse>(payload: TRequest, options?: {
        timeout?: number;
    }): Promise<TResponse>;
    onNotification(callback: (data: unknown) => void): () => void;
    getActiveSession(): Promise<Session | undefined>;
    private waitForWalletSessionIfNotCached;
}
export {};
//# sourceMappingURL=index.d.ts.map