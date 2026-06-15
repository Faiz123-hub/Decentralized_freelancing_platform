import { StoreAdapter } from '../../domain';
export declare class StoreAdapterNode extends StoreAdapter {
    #private;
    readonly platform = "node";
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
//# sourceMappingURL=node.d.ts.map