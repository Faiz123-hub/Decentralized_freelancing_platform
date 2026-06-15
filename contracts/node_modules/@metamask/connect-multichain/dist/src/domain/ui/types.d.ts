import type { Components } from '@metamask/multichain-ui';
import type { ConnectionRequest } from '../multichain';
export type OTPCode = string;
export type QRLink = string;
export type InstallWidgetProps = Components.MmInstallModal & {
    parentElement?: Element;
    connectionRequest: ConnectionRequest;
    onClose: (shouldTerminate?: boolean) => void;
    startDesktopOnboarding: () => void;
    createConnectionRequest: () => Promise<ConnectionRequest>;
    generateQRCode: (connectionRequest: ConnectionRequest) => Promise<QRLink>;
    /**
     * Callback invoked when a QR code link is generated or regenerated.
     * This allows consumers to display their own custom QR code UI.
     *
     * @param uri - The deeplink URI to be displayed as a QR code
     */
    onDisplayUri?: (uri: QRLink) => void;
};
export type OTPCodeWidgetProps = Components.MmOtpModal & {
    parentElement?: Element;
    onClose: () => Promise<void>;
    onDisconnect?: () => void;
    createOTPCode: () => Promise<OTPCode>;
    updateOTPCode: (otpValue: string) => void;
};
export type DataType = OTPCode | QRLink;
/**
 * Abstract Modal class with shared functionality across all models
 */
export declare abstract class Modal<Options, Data extends DataType = DataType> {
    protected readonly options: Options;
    protected abstract instance?: HTMLMmInstallModalElement | HTMLMmOtpModalElement | undefined;
    abstract mount(): void;
    abstract unmount(): void;
    constructor(options: Options);
    get isMounted(): boolean;
    get data(): Data;
    set data(data: Data);
}
//# sourceMappingURL=types.d.ts.map