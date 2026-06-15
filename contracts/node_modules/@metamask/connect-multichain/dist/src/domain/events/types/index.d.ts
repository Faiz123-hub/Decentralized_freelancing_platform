import type { SessionData } from '@metamask/multichain-api-client';
export type SDKEvents = {
    display_uri: [evt: string];
    wallet_sessionChanged: [evt: SessionData | undefined];
    metamask_accountsChanged: [evt: string[]];
    metamask_chainChanged: [evt: {
        chainId: string;
    }];
    stateChanged: [
        evt: 'pending' | 'loaded' | 'disconnected' | 'connected' | 'connecting'
    ];
    [key: string]: [evt: unknown];
};
export type EventTypes = SDKEvents;
//# sourceMappingURL=index.d.ts.map