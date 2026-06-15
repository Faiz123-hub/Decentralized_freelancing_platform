import { EventEmitter } from '../events';
export var TransportType;
(function (TransportType) {
    TransportType["Browser"] = "browser";
    TransportType["MWP"] = "mwp";
    TransportType["UNKNOWN"] = "unknown";
})(TransportType || (TransportType = {}));
/**
 * Abstract base class for the Multichain SDK implementation.
 *
 * This class defines the core interface that all Multichain SDK implementations
 * must provide, including session management, connection handling, and method invocation.
 */
export class MultichainCore extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
    }
    /**
     * Merges the given options into the current instance options.
     * Only the mergeable keys are updated (api.supportedNetworks, versions, ui.*, mobile.*, transport.extensionId, debug).
     * The main thing to note is that the value for `dapp` is not merged as it does not make sense for
     * subsequent calls to `createMultichainClient` to have a different `dapp` value.
     * Used when createMultichainClient is called with an existing singleton.
     *
     * @param partial - Options to merge/overwrite onto the current instance
     */
    mergeOptions(partial) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const opts = this.options;
        this.options = Object.assign(Object.assign({}, opts), { api: Object.assign(Object.assign({}, opts.api), { supportedNetworks: Object.assign(Object.assign({}, opts.api.supportedNetworks), ((_b = (_a = partial.api) === null || _a === void 0 ? void 0 : _a.supportedNetworks) !== null && _b !== void 0 ? _b : {})) }), versions: Object.assign(Object.assign({}, opts.versions), ((_c = partial.versions) !== null && _c !== void 0 ? _c : {})), ui: Object.assign(Object.assign({}, opts.ui), { headless: (_e = (_d = partial.ui) === null || _d === void 0 ? void 0 : _d.headless) !== null && _e !== void 0 ? _e : opts.ui.headless, preferExtension: (_g = (_f = partial.ui) === null || _f === void 0 ? void 0 : _f.preferExtension) !== null && _g !== void 0 ? _g : opts.ui.preferExtension, showInstallModal: (_j = (_h = partial.ui) === null || _h === void 0 ? void 0 : _h.showInstallModal) !== null && _j !== void 0 ? _j : opts.ui.showInstallModal }), mobile: Object.assign(Object.assign({}, opts.mobile), ((_k = partial.mobile) !== null && _k !== void 0 ? _k : {})), transport: Object.assign(Object.assign({}, ((_l = opts.transport) !== null && _l !== void 0 ? _l : {})), { extensionId: (_o = (_m = partial.transport) === null || _m === void 0 ? void 0 : _m.extensionId) !== null && _o !== void 0 ? _o : (_p = opts.transport) === null || _p === void 0 ? void 0 : _p.extensionId }), debug: (_q = partial.debug) !== null && _q !== void 0 ? _q : opts.debug });
    }
}
/* c8 ignore end */
export function getTransportType(type) {
    switch (type) {
        case 'browser':
            return TransportType.Browser;
        case 'mwp':
            return TransportType.MWP;
        default:
            return TransportType.UNKNOWN;
    }
}
export * from './api/constants';
export * from './api/infura';
//# sourceMappingURL=index.js.map