var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable @typescript-eslint/naming-convention -- Type parameter T is a standard convention */
/**
 * React Native UI module entry point
 */
import { BaseModalFactory } from './ModalFactory';
/**
 * ModalFactory for React Native environments.
 * No-op preload since Stencil web components are not used.
 */
export class ModalFactory extends BaseModalFactory {
    // No-op for React Native - web components are not applicable
    preload() {
        return __awaiter(this, void 0, void 0, function* () {
            // No-op: React Native does not use web components
        });
    }
}
//# sourceMappingURL=index.native.js.map