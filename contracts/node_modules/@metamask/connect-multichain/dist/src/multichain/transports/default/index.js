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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _DefaultTransport_instances, _DefaultTransport_notificationCallbacks, _DefaultTransport_transport, _DefaultTransport_defaultRequestOptions, _DefaultTransport_pendingRequests, _DefaultTransport_handleResponseListener, _DefaultTransport_handleNotificationListener, _DefaultTransport_notifyCallbacks, _DefaultTransport_isMetamaskProviderEvent, _DefaultTransport_handleResponse, _DefaultTransport_handleNotification, _DefaultTransport_setupMessageListener, _DefaultTransport_init;
import { getDefaultTransport, } from '@metamask/multichain-api-client';
import { addValidAccounts, getOptionalScopes, getUniqueRequestId, getValidAccounts, isSameScopesAndAccounts, } from '../../utils';
const DEFAULT_REQUEST_TIMEOUT = 60 * 1000;
export class DefaultTransport {
    constructor() {
        _DefaultTransport_instances.add(this);
        _DefaultTransport_notificationCallbacks.set(this, new Set());
        _DefaultTransport_transport.set(this, getDefaultTransport());
        _DefaultTransport_defaultRequestOptions.set(this, {
            timeout: DEFAULT_REQUEST_TIMEOUT,
        });
        _DefaultTransport_pendingRequests.set(this, new Map());
        _DefaultTransport_handleResponseListener.set(this, void 0);
        _DefaultTransport_handleNotificationListener.set(this, void 0);
    }
    sendEip1193Message(payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup message listener if not already set up
            __classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_setupMessageListener).call(this);
            // Generate unique request ID - increment counter to ensure uniqueness
            const requestId = String(getUniqueRequestId());
            // Create request with ID - MetaMask expects JSON-RPC format
            const request = Object.assign({ jsonrpc: '2.0', id: requestId }, payload);
            return new Promise((resolve, reject) => {
                var _a;
                const timeout = setTimeout(() => {
                    __classPrivateFieldGet(this, _DefaultTransport_pendingRequests, "f").delete(requestId);
                    reject(new Error('Request timeout'));
                }, (_a = options === null || options === void 0 ? void 0 : options.timeout) !== null && _a !== void 0 ? _a : __classPrivateFieldGet(this, _DefaultTransport_defaultRequestOptions, "f").timeout);
                __classPrivateFieldGet(this, _DefaultTransport_pendingRequests, "f").set(requestId, {
                    resolve: (response) => {
                        resolve(response);
                    },
                    reject,
                    timeout,
                });
                // eslint-disable-next-line no-restricted-globals
                window.postMessage({
                    target: 'metamask-contentscript',
                    data: {
                        name: 'metamask-provider',
                        data: request,
                    },
                }, 
                // eslint-disable-next-line no-restricted-globals
                location.origin);
            });
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_init).call(this);
            let walletSession = { sessionScopes: {} };
            try {
                const sessionRequest = yield this.request({ method: 'wallet_getSession' }, __classPrivateFieldGet(this, _DefaultTransport_defaultRequestOptions, "f"));
                walletSession = sessionRequest.result;
            }
            catch (_a) {
                console.error('Failed to get wallet session during DefaultTransport init');
            }
            __classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_notifyCallbacks).call(this, {
                method: 'wallet_sessionChanged',
                params: walletSession,
            });
        });
    }
    connect(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            yield __classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_init).call(this);
            // Get wallet session
            const sessionRequest = yield this.request({ method: 'wallet_getSession' }, __classPrivateFieldGet(this, _DefaultTransport_defaultRequestOptions, "f"));
            if (sessionRequest.error) {
                throw new Error(sessionRequest.error.message);
            }
            let walletSession = sessionRequest.result;
            const createSessionParams = {
                optionalScopes: addValidAccounts(getOptionalScopes((_a = options === null || options === void 0 ? void 0 : options.scopes) !== null && _a !== void 0 ? _a : []), getValidAccounts((_b = options === null || options === void 0 ? void 0 : options.caipAccountIds) !== null && _b !== void 0 ? _b : [])),
                sessionProperties: options === null || options === void 0 ? void 0 : options.sessionProperties,
            };
            if (walletSession && options && !options.forceRequest) {
                const currentScopes = Object.keys((_c = walletSession === null || walletSession === void 0 ? void 0 : walletSession.sessionScopes) !== null && _c !== void 0 ? _c : {});
                const proposedScopes = (_d = options === null || options === void 0 ? void 0 : options.scopes) !== null && _d !== void 0 ? _d : [];
                const proposedCaipAccountIds = (_e = options === null || options === void 0 ? void 0 : options.caipAccountIds) !== null && _e !== void 0 ? _e : [];
                const hasSameScopesAndAccounts = isSameScopesAndAccounts(currentScopes, proposedScopes, walletSession, proposedCaipAccountIds);
                if (!hasSameScopesAndAccounts) {
                    const response = yield this.request({ method: 'wallet_createSession', params: createSessionParams }, __classPrivateFieldGet(this, _DefaultTransport_defaultRequestOptions, "f"));
                    if (response.error) {
                        throw new Error(response.error.message);
                    }
                    walletSession = response.result;
                }
            }
            else if (!walletSession || (options === null || options === void 0 ? void 0 : options.forceRequest)) {
                const response = yield this.request({ method: 'wallet_createSession', params: createSessionParams }, __classPrivateFieldGet(this, _DefaultTransport_defaultRequestOptions, "f"));
                if (response.error) {
                    throw new Error(response.error.message);
                }
                walletSession = response.result;
            }
            __classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_notifyCallbacks).call(this, {
                method: 'wallet_sessionChanged',
                params: walletSession,
            });
        });
    }
    disconnect() {
        return __awaiter(this, arguments, void 0, function* (scopes = []) {
            yield this.request({ method: 'wallet_revokeSession', params: { scopes } });
        });
    }
    isConnected() {
        return __classPrivateFieldGet(this, _DefaultTransport_transport, "f").isConnected();
    }
    request(request_1) {
        return __awaiter(this, arguments, void 0, function* (request, options = __classPrivateFieldGet(this, _DefaultTransport_defaultRequestOptions, "f")) {
            return __classPrivateFieldGet(this, _DefaultTransport_transport, "f").request(request, options);
        });
    }
    onNotification(callback) {
        __classPrivateFieldGet(this, _DefaultTransport_transport, "f").onNotification(callback);
        __classPrivateFieldGet(this, _DefaultTransport_notificationCallbacks, "f").add(callback);
        return () => {
            __classPrivateFieldGet(this, _DefaultTransport_notificationCallbacks, "f").delete(callback);
        };
    }
    getActiveSession() {
        return __awaiter(this, void 0, void 0, function* () {
            // This code path should never be triggered when the DefaultTransport is being used
            // It's only purpose is for exposing the session ID used for deeplinking to the mobile app
            // and so it is only implemented for the MWPTransport.
            throw new Error('getActiveSession is purposely not implemented for the DefaultTransport');
        });
    }
    getStoredPendingSessionRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('getStoredPendingSessionRequest is purposely not implemented for the DefaultTransport');
        });
    }
}
_DefaultTransport_notificationCallbacks = new WeakMap(), _DefaultTransport_transport = new WeakMap(), _DefaultTransport_defaultRequestOptions = new WeakMap(), _DefaultTransport_pendingRequests = new WeakMap(), _DefaultTransport_handleResponseListener = new WeakMap(), _DefaultTransport_handleNotificationListener = new WeakMap(), _DefaultTransport_instances = new WeakSet(), _DefaultTransport_notifyCallbacks = function _DefaultTransport_notifyCallbacks(data) {
    for (const callback of __classPrivateFieldGet(this, _DefaultTransport_notificationCallbacks, "f")) {
        try {
            callback(data);
        }
        catch (error) {
            console.log('[WindowPostMessageTransport] notifyCallbacks error:', error);
        }
    }
}, _DefaultTransport_isMetamaskProviderEvent = function _DefaultTransport_isMetamaskProviderEvent(event) {
    var _a, _b;
    return (((_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.name) === 'metamask-provider' &&
        // eslint-disable-next-line no-restricted-globals
        event.origin === location.origin);
}, _DefaultTransport_handleResponse = function _DefaultTransport_handleResponse(event) {
    var _a, _b;
    if (!__classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_isMetamaskProviderEvent).call(this, event)) {
        return;
    }
    const responseData = (_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.data;
    // Ignore requests (they have 'method' field) - only process responses
    if (typeof responseData === 'object' &&
        responseData !== null &&
        'method' in responseData) {
        return;
    }
    if (typeof responseData === 'object' &&
        responseData !== null &&
        'id' in responseData &&
        ('result' in responseData || 'error' in responseData)) {
        const responseId = String(responseData.id);
        const pendingRequest = __classPrivateFieldGet(this, _DefaultTransport_pendingRequests, "f").get(responseId);
        if (pendingRequest) {
            clearTimeout(pendingRequest.timeout);
            __classPrivateFieldGet(this, _DefaultTransport_pendingRequests, "f").delete(responseId);
            const response = responseData;
            if ('error' in response && response.error) {
                // Attach the numeric RPC code so it survives the transport boundary
                // and can be re-surfaced as an EIP-1193 error by higher layers.
                // This path is exercised by sendEip1193Message callers.
                const error = new Error(response.error.message || 'Request failed');
                if (typeof response.error.code === 'number') {
                    error.code = response.error.code;
                }
                pendingRequest.reject(error);
            }
            else {
                pendingRequest.resolve(response);
            }
        }
    }
}, _DefaultTransport_handleNotification = function _DefaultTransport_handleNotification(event) {
    var _a, _b;
    if (!__classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_isMetamaskProviderEvent).call(this, event)) {
        return;
    }
    const responseData = (_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.data;
    if (typeof responseData === 'object' &&
        responseData !== null &&
        'method' in responseData) {
        __classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_notifyCallbacks).call(this, responseData);
    }
}, _DefaultTransport_setupMessageListener = function _DefaultTransport_setupMessageListener() {
    // Only set up listener if it's not already set up for this instance
    if (__classPrivateFieldGet(this, _DefaultTransport_handleResponseListener, "f")) {
        return;
    }
    // Create a new handler bound to this instance
    // Rename this to handleResponse or something like this
    __classPrivateFieldSet(this, _DefaultTransport_handleResponseListener, __classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_handleResponse).bind(this), "f");
    __classPrivateFieldSet(this, _DefaultTransport_handleNotificationListener, __classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_handleNotification).bind(this), "f");
    // Add the listener
    // eslint-disable-next-line no-restricted-globals
    window.addEventListener('message', __classPrivateFieldGet(this, _DefaultTransport_handleResponseListener, "f"));
    // eslint-disable-next-line no-restricted-globals
    window.addEventListener('message', __classPrivateFieldGet(this, _DefaultTransport_handleNotificationListener, "f"));
}, _DefaultTransport_init = function _DefaultTransport_init() {
    return __awaiter(this, void 0, void 0, function* () {
        __classPrivateFieldGet(this, _DefaultTransport_instances, "m", _DefaultTransport_setupMessageListener).call(this);
        // #transport.connect() internally calls disconnect() if the transport is connected,
        // and clears all listeners in the process. This ensures that we don't lose any listeners
        // by only connecting if we aren't already connected. Opting for this approach rather than a larger refactor
        // of who is responsible for managing listener setup and cleanup.
        if (!__classPrivateFieldGet(this, _DefaultTransport_transport, "f").isConnected()) {
            yield __classPrivateFieldGet(this, _DefaultTransport_transport, "f").connect();
        }
    });
};
//# sourceMappingURL=index.js.map