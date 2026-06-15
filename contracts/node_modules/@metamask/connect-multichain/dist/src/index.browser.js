var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable import-x/no-unassigned-import -- Polyfill must be imported first */
// Buffer polyfill must be imported first to set up globalThis.Buffer
import './polyfills/buffer-shim';
import { enableDebug } from './domain';
import { MetaMaskConnectMultichain } from './multichain';
import { Store } from './store';
import { ModalFactory } from './ui';
export * from './domain';
export const createMultichainClient = (options) => __awaiter(void 0, void 0, void 0, function* () {
    if (options.debug) {
        enableDebug('metamask-sdk:*');
    }
    const uiModules = yield import('./ui/modals/web');
    let storage;
    if (options.storage) {
        storage = options.storage;
    }
    else {
        const { StoreAdapterWeb } = yield import('./store/adapters/web');
        const adapter = new StoreAdapterWeb();
        storage = new Store(adapter);
    }
    const factory = new ModalFactory(uiModules);
    return MetaMaskConnectMultichain.create(Object.assign(Object.assign({}, options), { storage, ui: Object.assign(Object.assign({}, options.ui), { factory }) }));
});
//# sourceMappingURL=index.browser.js.map