import type { Json } from '@metamask/utils';
import type { InvokeMethodOptions, MultichainOptions } from '../../../domain';
/**
 * Gets the next RPC ID for request tracking.
 *
 * @returns The next unique RPC ID.
 */
export declare function getNextRpcId(): number;
export declare class MissingRpcEndpointErr extends Error {
}
export declare class RpcClient {
    private readonly config;
    private readonly sdkInfo;
    constructor(config: MultichainOptions, sdkInfo: string);
    /**
     * Routes the request to a configured RPC node.
     *
     * @param options - The invoke method options.
     * @returns The JSON response from the RPC node.
     */
    request(options: InvokeMethodOptions): Promise<Json>;
    private getRpcEndpoint;
    private fetchWithTimeout;
    private parseResponse;
    private getHeaders;
}
//# sourceMappingURL=rpcClient.d.ts.map