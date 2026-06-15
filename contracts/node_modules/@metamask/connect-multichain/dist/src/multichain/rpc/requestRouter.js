var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RequestRouter_instances, _RequestRouter_withAnalyticsTracking, _RequestRouter_trackWalletActionRequested, _RequestRouter_trackWalletActionSucceeded, _RequestRouter_trackWalletActionFailed, _RequestRouter_trackWalletActionRejected;
/* eslint-disable no-restricted-syntax -- Private class properties use established patterns */
/* eslint-disable @typescript-eslint/parameter-properties -- Constructor shorthand is intentional */
/* eslint-disable jsdoc/require-param-description -- Auto-generated JSDoc */
/* eslint-disable jsdoc/require-returns -- Auto-generated JSDoc */
/* eslint-disable @typescript-eslint/no-misused-promises -- setTimeout callback is async intentionally */
import { analytics } from '@metamask/analytics';
import { METAMASK_CONNECT_BASE_URL, METAMASK_DEEPLINK_BASE, } from '../../config';
import { isSecure, RPC_HANDLED_METHODS, RPCInvokeMethodErr, SDK_HANDLED_METHODS, } from '../../domain';
import { openDeeplink } from '../utils';
import { getWalletActionAnalyticsProperties, isRejectionError, } from '../utils/analytics';
import { MissingRpcEndpointErr } from './handlers/rpcClient';
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
export class RequestRouter {
    constructor(transport, rpcClient, config, transportType) {
        _RequestRouter_instances.add(this);
        this.transport = transport;
        this.rpcClient = rpcClient;
        this.config = config;
        this.transportType = transportType;
    }
    /**
     * The main entry point for invoking an RPC method.
     * This method acts as a router, determining the correct handling strategy
     * for the request and delegating to the appropriate private handler.
     *
     * @param options
     */
    invokeMethod(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { method } = options.request;
            if (RPC_HANDLED_METHODS.has(method)) {
                return this.handleWithRpcNode(options);
            }
            if (SDK_HANDLED_METHODS.has(method)) {
                return this.handleWithSdkState(options);
            }
            return this.handleWithWallet(options);
        });
    }
    /**
     * Forwards the request directly to the wallet via the transport.
     *
     * @param options
     */
    handleWithWallet(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return __classPrivateFieldGet(this, _RequestRouter_instances, "m", _RequestRouter_withAnalyticsTracking).call(this, options, () => __awaiter(this, void 0, void 0, function* () {
                const request = this.transport.request({
                    method: 'wallet_invokeMethod',
                    params: options,
                });
                const { ui, mobile } = this.config;
                const { showInstallModal = false } = ui !== null && ui !== void 0 ? ui : {};
                const secure = isSecure();
                const shouldOpenDeeplink = secure && !showInstallModal;
                if (shouldOpenDeeplink) {
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        const session = yield this.transport.getActiveSession();
                        if (!session) {
                            throw new Error('No active session found');
                        }
                        const url = `${METAMASK_DEEPLINK_BASE}/mwp?id=${encodeURIComponent(session.id)}`;
                        if (mobile === null || mobile === void 0 ? void 0 : mobile.preferredOpenLink) {
                            mobile.preferredOpenLink(url, '_self');
                        }
                        else {
                            openDeeplink(this.config, url, METAMASK_CONNECT_BASE_URL);
                        }
                    }), 10); // small delay to ensure the message encryption and dispatch completes
                }
                const response = yield request;
                if (response.error) {
                    const { error } = response;
                    throw new RPCInvokeMethodErr(`RPC Request failed with code ${error.code}: ${error.message}`, error.code, error.message);
                }
                return response.result;
            }));
        });
    }
    /**
     * Routes the request to a configured RPC node.
     *
     * @param options
     */
    handleWithRpcNode(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.rpcClient.request(options);
            }
            catch (error) {
                if (error instanceof MissingRpcEndpointErr) {
                    return this.handleWithWallet(options);
                }
                throw error;
            }
        });
    }
    /**
     * Responds directly from the SDK's session state.
     *
     * @param options
     */
    handleWithSdkState(options) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: to be implemented
            console.warn(`Method "${options.request.method}" is configured for SDK state handling, but this is not yet implemented. Falling back to wallet passthrough.`);
            // Fallback to wallet
            return this.handleWithWallet(options);
        });
    }
}
_RequestRouter_instances = new WeakSet(), _RequestRouter_withAnalyticsTracking = function _RequestRouter_withAnalyticsTracking(options, execute) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        yield __classPrivateFieldGet(this, _RequestRouter_instances, "m", _RequestRouter_trackWalletActionRequested).call(this, options);
        try {
            const result = yield execute();
            yield __classPrivateFieldGet(this, _RequestRouter_instances, "m", _RequestRouter_trackWalletActionSucceeded).call(this, options);
            return result;
        }
        catch (error) {
            const isRejection = isRejectionError(error);
            if (isRejection) {
                yield __classPrivateFieldGet(this, _RequestRouter_instances, "m", _RequestRouter_trackWalletActionRejected).call(this, options);
            }
            else {
                yield __classPrivateFieldGet(this, _RequestRouter_instances, "m", _RequestRouter_trackWalletActionFailed).call(this, options);
            }
            if (error instanceof RPCInvokeMethodErr) {
                throw error;
            }
            const castError = error;
            throw new RPCInvokeMethodErr((_a = castError.message) !== null && _a !== void 0 ? _a : 'Unknown error', castError.code);
        }
    });
}, _RequestRouter_trackWalletActionRequested = function _RequestRouter_trackWalletActionRequested(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const props = yield getWalletActionAnalyticsProperties(this.config, this.config.storage, options, this.transportType);
        analytics.track('mmconnect_wallet_action_requested', props);
    });
}, _RequestRouter_trackWalletActionSucceeded = function _RequestRouter_trackWalletActionSucceeded(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const props = yield getWalletActionAnalyticsProperties(this.config, this.config.storage, options, this.transportType);
        analytics.track('mmconnect_wallet_action_succeeded', props);
    });
}, _RequestRouter_trackWalletActionFailed = function _RequestRouter_trackWalletActionFailed(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const props = yield getWalletActionAnalyticsProperties(this.config, this.config.storage, options, this.transportType);
        analytics.track('mmconnect_wallet_action_failed', props);
    });
}, _RequestRouter_trackWalletActionRejected = function _RequestRouter_trackWalletActionRejected(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const props = yield getWalletActionAnalyticsProperties(this.config, this.config.storage, options, this.transportType);
        analytics.track('mmconnect_wallet_action_rejected', props);
    });
};
//# sourceMappingURL=requestRouter.js.map