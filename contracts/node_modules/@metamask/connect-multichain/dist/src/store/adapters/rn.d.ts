import { StoreAdapter } from '../../domain';
export declare class StoreAdapterRN extends StoreAdapter {
    readonly platform = "rn";
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
//# sourceMappingURL=rn.d.ts.map