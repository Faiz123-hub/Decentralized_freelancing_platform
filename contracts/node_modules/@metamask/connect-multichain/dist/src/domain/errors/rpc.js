/* eslint-disable @typescript-eslint/parameter-properties */
import { BaseErr } from './base';
export class RPCHttpErr extends BaseErr {
    constructor(rpcEndpoint, method, httpStatus) {
        super(`RPCErr${RPCHttpErr.code}: ${httpStatus} on ${rpcEndpoint} for method ${method}`, RPCHttpErr.code);
        this.rpcEndpoint = rpcEndpoint;
        this.method = method;
        this.httpStatus = httpStatus;
    }
}
RPCHttpErr.code = 50;
export class RPCReadonlyResponseErr extends BaseErr {
    constructor(reason) {
        super(`RPCErr${RPCReadonlyResponseErr.code}: RPC Client response reason ${reason}`, RPCReadonlyResponseErr.code);
        this.reason = reason;
    }
}
RPCReadonlyResponseErr.code = 51;
export class RPCReadonlyRequestErr extends BaseErr {
    constructor(reason) {
        super(`RPCErr${RPCReadonlyRequestErr.code}: RPC Client fetch reason ${reason}`, RPCReadonlyRequestErr.code);
        this.reason = reason;
    }
}
RPCReadonlyRequestErr.code = 52;
export class RPCInvokeMethodErr extends BaseErr {
    constructor(reason, rpcCode, rpcMessage) {
        super(`RPCErr${RPCInvokeMethodErr.code}: RPC Client invoke method reason (${reason})`, RPCInvokeMethodErr.code);
        this.reason = reason;
        this.rpcCode = rpcCode;
        this.rpcMessage = rpcMessage;
    }
}
RPCInvokeMethodErr.code = 53;
//# sourceMappingURL=rpc.js.map