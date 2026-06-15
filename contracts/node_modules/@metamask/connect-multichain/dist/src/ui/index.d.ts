/**
 * Browser/Web UI module entry point
 */
import { BaseModalFactory } from './ModalFactory';
import type { FactoryModals } from './modals/types';
/**
 * Web-specific preload that loads Stencil custom elements
 */
export declare function preload(): Promise<void>;
/**
 * ModalFactory for browser/web environments.
 * Loads Stencil web components via dynamic import.
 */
export declare class ModalFactory<T extends FactoryModals = FactoryModals> extends BaseModalFactory<T> {
    protected preload(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map