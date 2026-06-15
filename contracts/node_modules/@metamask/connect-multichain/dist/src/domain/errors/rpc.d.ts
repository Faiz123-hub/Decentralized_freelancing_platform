import { BaseErr } from './base';
import type { RPCErrorCodes } from './types';
export declare class RPCHttpErr extends BaseErr<'RPC', RPCErrorCodes> {
    readonly rpcEndpoint: string;
    readonly method: string;
    readonly httpStatus: number;
    static readonly code = 50;
    constructor(rpcEndpoint: string, method: string, httpStatus: number);
}
export declare class RPCReadonlyResponseErr extends BaseErr<'RPC', RPCErrorCodes> {
    readonly reason: string;
    static readonly code = 51;
    constructor(reason: string);
}
export declare class RPCReadonlyRequestErr extends BaseErr<'RPC', RPCErrorCodes> {
    readonly reason: string;
    static readonly code = 52;
    constructor(reason: string);
}
export declare class RPCInvokeMethodErr extends BaseErr<'RPC', RPCErrorCodes> {
    readonly reason: string;
    readonly rpcCode?: number | undefined;
    readonly rpcMessage?: string | undefined;
    static readonly code = 53;
    constructor(reason: string, rpcCode?: number | undefined, rpcMessage?: string | undefined);
}
//# sourceMappingURL=rpc.d.ts.map