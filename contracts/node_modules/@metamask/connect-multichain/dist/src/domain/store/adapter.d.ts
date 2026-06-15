export type StoreOptions = Record<string, any>;
export declare abstract class StoreAdapter {
    options?: StoreOptions | undefined;
    abstract platform: 'web' | 'rn' | 'node';
    constructor(options?: StoreOptions | undefined);
    abstract get(key: string): Promise<string | null>;
    abstract set(key: string, value: string): Promise<void>;
    abstract delete(key: string): Promise<void>;
}
//# sourceMappingURL=adapter.d.ts.map