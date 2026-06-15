/* eslint-disable no-restricted-syntax -- Private class properties use established patterns */
/* eslint-disable @typescript-eslint/explicit-function-return-type -- Inferred types are sufficient */
/* eslint-disable @typescript-eslint/parameter-properties -- Constructor shorthand is intentional */
/* eslint-disable @typescript-eslint/no-shadow -- fetch import shadows global */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from 'cross-fetch';
import { RPCHttpErr, RPCReadonlyRequestErr, RPCReadonlyResponseErr, } from '../../../domain';
let rpcId = 1;
/**
 * Gets the next RPC ID for request tracking.
 *
 * @returns The next unique RPC ID.
 */
export function getNextRpcId() {
    rpcId += 1;
    return rpcId;
}
export class MissingRpcEndpointErr extends Error {
}
export class RpcClient {
    constructor(config, sdkInfo) {
        this.config = config;
        this.sdkInfo = sdkInfo;
    }
    /**
     * Routes the request to a configured RPC node.
     *
     * @param options - The invoke method options.
     * @returns The JSON response from the RPC node.
     */
    request(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { request } = options;
            const body = JSON.stringify({
                jsonrpc: '2.0',
                method: request.method,
                params: request.params,
                id: getNextRpcId(),
            });
            const rpcEndpoint = this.getRpcEndpoint(options.scope);
            const rpcRequest = yield this.fetchWithTimeout(rpcEndpoint, body, 'POST', this.getHeaders(rpcEndpoint), 30000); // 30 seconds default timeout
            const response = yield this.parseResponse(rpcRequest);
            return response;
        });
    }
    getRpcEndpoint(scope) {
        var _a, _b, _c;
        const supportedNetworks = (_c = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.api) === null || _b === void 0 ? void 0 : _b.supportedNetworks) !== null && _c !== void 0 ? _c : {};
        const rpcEndpoint = supportedNetworks[scope];
        if (!rpcEndpoint) {
            throw new MissingRpcEndpointErr(`No RPC endpoint found for scope ${scope}`);
        }
        return rpcEndpoint;
    }
    fetchWithTimeout(endpoint, body, method, headers, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            try {
                const response = yield fetch(endpoint, {
                    method,
                    headers,
                    body,
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new RPCHttpErr(endpoint, method, response.status);
                }
                return response;
            }
            catch (error) {
                clearTimeout(timeoutId);
                if (error instanceof RPCHttpErr) {
                    throw error;
                }
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new RPCReadonlyRequestErr(`Request timeout after ${timeout}ms`);
                }
                throw new RPCReadonlyRequestErr(error.message);
            }
        });
    }
    parseResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rpcResponse = (yield response.json());
                return rpcResponse.result;
            }
            catch (error) {
                throw new RPCReadonlyResponseErr(error.message);
            }
        });
    }
    getHeaders(rpcEndpoint) {
        const defaultHeaders = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
        if (rpcEndpoint.includes('infura')) {
            return Object.assign(Object.assign({}, defaultHeaders), { 'Metamask-Sdk-Info': this.sdkInfo });
        }
        return defaultHeaders;
    }
}
//# sourceMappingURL=rpcClient.js.map