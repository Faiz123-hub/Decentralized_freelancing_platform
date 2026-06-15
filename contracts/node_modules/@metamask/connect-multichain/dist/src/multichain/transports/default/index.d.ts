import type { Session } from '@metamask/mobile-wallet-protocol-core';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-dapp-client';
import { type SessionProperties, type TransportRequest, type TransportResponse } from '@metamask/multichain-api-client';
import type { CaipAccountId } from '@metamask/utils';
import type { ExtendedTransport, Scope } from 'src/domain';
export declare class DefaultTransport implements ExtendedTransport {
    #private;
    sendEip1193Message<TRequest extends TransportRequest, TResponse extends TransportResponse>(payload: TRequest, options?: {
        timeout?: number;
    }): Promise<TResponse>;
    init(): Promise<void>;
    connect(options?: {
        scopes: Scope[];
        caipAccountIds: CaipAccountId[];
        sessionProperties?: SessionProperties;
        forceRequest?: boolean;
    }): Promise<void>;
    disconnect(scopes?: Scope[]): Promise<void>;
    isConnected(): boolean;
    request<TRequest extends TransportRequest, TResponse extends TransportResponse>(request: TRequest, options?: {
        timeout?: number;
    }): Promise<TResponse>;
    onNotification(callback: (data: unknown) => void): () => void;
    getActiveSession(): Promise<Session | undefined>;
    getStoredPendingSessionRequest(): Promise<SessionRequest | null>;
}
//# sourceMappingURL=index.d.ts.map