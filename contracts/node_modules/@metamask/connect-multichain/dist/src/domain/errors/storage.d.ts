import { BaseErr } from './base';
import type { StorageErrorCodes } from './types';
export declare class StorageGetErr extends BaseErr<'Storage', StorageErrorCodes> {
    readonly platform: 'web' | 'rn' | 'node';
    readonly key: string;
    readonly reason: string;
    static readonly code = 60;
    constructor(platform: 'web' | 'rn' | 'node', key: string, reason: string);
}
export declare class StorageSetErr extends BaseErr<'Storage', StorageErrorCodes> {
    readonly platform: 'web' | 'rn' | 'node';
    readonly key: string;
    readonly reason: string;
    static readonly code = 61;
    constructor(platform: 'web' | 'rn' | 'node', key: string, reason: string);
}
export declare class StorageDeleteErr extends BaseErr<'Storage', StorageErrorCodes> {
    readonly platform: 'web' | 'rn' | 'node';
    readonly key: string;
    readonly reason: string;
    static readonly code = 62;
    constructor(platform: 'web' | 'rn' | 'node', key: string, reason: string);
}
//# sourceMappingURL=storage.d.ts.map