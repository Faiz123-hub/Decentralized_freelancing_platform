/**
 * React Native UI module entry point
 */
import { BaseModalFactory } from './ModalFactory';
import type { FactoryModals } from './modals/types';
/**
 * ModalFactory for React Native environments.
 * No-op preload since Stencil web components are not used.
 */
export declare class ModalFactory<T extends FactoryModals = FactoryModals> extends BaseModalFactory<T> {
    protected preload(): Promise<void>;
}
//# sourceMappingURL=index.native.d.ts.map