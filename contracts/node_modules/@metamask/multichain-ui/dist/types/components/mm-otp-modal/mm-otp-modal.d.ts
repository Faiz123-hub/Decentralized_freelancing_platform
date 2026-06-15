import { EventEmitter } from '../../stencil-public-runtime';
export declare class OtpModal {
    /**
     * The QR code link
     */
    displayOTP?: boolean;
    private i18nInstance;
    otpCode: string;
    close: EventEmitter;
    disconnect: EventEmitter;
    updateOTPCode: EventEmitter<{
        otpCode: string;
    }>;
    el: HTMLElement;
    private translationsLoaded;
    constructor();
    connectedCallback(): Promise<void>;
    onClose(): void;
    onDisconnect(): void;
    onUpdateOTPValueHandler(otpCode: string): void;
    disconnectedCallback(): void;
    render(): any;
}
//# sourceMappingURL=mm-otp-modal.d.ts.map