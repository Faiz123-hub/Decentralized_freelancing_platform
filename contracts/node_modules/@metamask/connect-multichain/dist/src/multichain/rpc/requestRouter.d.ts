import type { Json } from '@metamask/utils';
import { type ExtendedTransport, type InvokeMethodOptions, type MultichainOptions, type TransportType } from '../../domain';
import type { RpcClient } from './handlers/rpcClient';
/**
 * Gets the next RPC ID for request tracking.
 *
 * @returns The next unique RPC ID.
 */
export declare function getNextRpcId(): number;
export declare class RequestRouter {
    #private;
    private readonly transport;
    private readonly rpcClient;
    private readonly config;
    private readonly transportType;
    constructor(transport: ExtendedTransport, rpcClient: RpcClient, config: MultichainOptions, transportType: TransportType);
    /**
     * The main entry point for invoking an RPC method.
     * This method acts as a router, determining the correct handling strategy
     * for the request and delegating to the appropriate private handler.
     *
     * @param options
     */
    invokeMethod(options: InvokeMethodOptions): Promise<Json>;
    /**
     * Forwards the request directly to the wallet via the transport.
     *
     * @param options
     */
    private handleWithWallet;
    /**
     * Routes the request to a configured RPC node.
     *
     * @param options
     */
    private handleWithRpcNode;
    /**
     * Responds directly from the SDK's session state.
     *
     * @param options
     */
    private handleWithSdkState;
}
//# sourceMappingURL=requestRouter.d.ts.map