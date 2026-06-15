var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable no-restricted-globals -- Web UI uses document */
/* eslint-disable @typescript-eslint/naming-convention -- Type parameter T is a standard convention */
/**
 * Browser/Web UI module entry point
 */
import { BaseModalFactory } from './ModalFactory';
/**
 * Web-specific preload that loads Stencil custom elements
 */
export function preload() {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof document === 'undefined') {
            return;
        }
        try {
            const { defineCustomElements } = yield import('@metamask/multichain-ui/loader');
            yield defineCustomElements();
        }
        catch (error) {
            console.error('Failed to load customElements:', error);
        }
    });
}
/**
 * ModalFactory for browser/web environments.
 * Loads Stencil web components via dynamic import.
 */
export class ModalFactory extends BaseModalFactory {
    preload() {
        return __awaiter(this, void 0, void 0, function* () {
            return preload();
        });
    }
}
//# sourceMappingURL=index.js.map