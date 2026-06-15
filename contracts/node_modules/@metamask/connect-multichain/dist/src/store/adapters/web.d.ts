import { StoreAdapter } from '../../domain';
type KvStores = 'sdk-kv-store' | 'key-value-pairs';
export declare class StoreAdapterWeb extends StoreAdapter {
    private readonly storeName;
    static readonly stores: KvStores[];
    static readonly DB_NAME = "mmconnect";
    readonly platform = "web";
    readonly dbPromise: Promise<IDBDatabase>;
    private get internal();
    constructor(dbNameSuffix?: `-${string}`, storeName?: KvStores);
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
export {};
//# sourceMappingURL=web.d.ts.map