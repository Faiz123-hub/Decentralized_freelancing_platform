import { type ConnectionRequest, type Modal, type OTPCode } from '../domain';
import type { AbstractOTPCodeModal } from './modals/base/AbstractOTPModal';
import type { FactoryModals } from './modals/types';
/**
 * Preload function type for loading UI dependencies
 */
export type PreloadFn = () => Promise<void>;
/**
 * Base ModalFactory class that accepts a preload function.
 * Platform-specific implementations should extend this class.
 */
export declare abstract class BaseModalFactory<T extends FactoryModals = FactoryModals> {
    protected readonly options: T;
    modal: Modal<any>;
    private readonly platform;
    private successCallback;
    private displayUriCallback?;
    /**
     * Creates a new modal factory instance.
     *
     * @param options - The modals configuration object
     */
    constructor(options: T);
    /**
     * Platform-specific preload function to be implemented by subclasses.
     */
    protected abstract preload(): Promise<void>;
    private validateModals;
    unload(error?: Error): Promise<void>;
    /**
     * Determines if the current platform is a mobile native environment.
     * Currently only includes React Native.
     */
    get isMobile(): boolean;
    /**
     * Determines if the current platform is a Node.js environment.
     * Used for server-side or non-browser environments.
     */
    get isNode(): boolean;
    /**
     * Determines if the current platform is a web environment.
     * Includes desktop web, MetaMask mobile webview, and mobile web.
     */
    get isWeb(): boolean;
    private getContainer;
    private getMountedContainer;
    createConnectionDeeplink(connectionRequest?: ConnectionRequest): string;
    createConnectionUniversalLink(connectionRequest?: ConnectionRequest): string;
    private onCloseModal;
    private onStartDesktopOnboarding;
    renderInstallModal(showInstallModal: boolean, createConnectionRequest: () => Promise<ConnectionRequest>, successCallback: (error?: Error) => Promise<void>, onDisplayUri?: (uri: string) => void): Promise<void>;
    renderOTPCodeModal(createOTPCode: () => Promise<OTPCode>, successCallback: (error?: Error) => Promise<void>, updateOTPCode: (otpCode: OTPCode, modal: AbstractOTPCodeModal) => void): Promise<void>;
}
//# sourceMappingURL=ModalFactory.d.ts.map