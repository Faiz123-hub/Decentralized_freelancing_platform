import type { StoreAdapter, TransportType } from '../domain';
import { StoreClient } from '../domain/store/client';
export declare class Store extends StoreClient {
    adapter: StoreAdapter;
    constructor(adapter: StoreAdapter);
    getTransport(): Promise<TransportType | null>;
    setTransport(transport: TransportType): Promise<void>;
    removeTransport(): Promise<void>;
    getAnonId(): Promise<string>;
    getExtensionId(): Promise<string | null>;
    setAnonId(anonId: string): Promise<void>;
    setExtensionId(extensionId: string): Promise<void>;
    removeExtensionId(): Promise<void>;
    removeAnonId(): Promise<void>;
    getDebug(): Promise<string | null>;
}
//# sourceMappingURL=index.d.ts.map