import { EventEmitter } from '../../stencil-public-runtime';
export declare class InstallModal {
    link: string;
    expiresIn: number;
    showInstallModal: boolean;
    private i18nInstance;
    private qrCodeContainer;
    close: EventEmitter<{
        shouldTerminate?: boolean;
    }>;
    startDesktopOnboarding: EventEmitter;
    updateLink: EventEmitter<string>;
    updateExpiresIn: EventEmitter<number>;
    el: HTMLElement;
    private translationsLoaded;
    constructor();
    componentDidLoad(): void;
    connectedCallback(): Promise<void>;
    private generateQRCode;
    onClose(shouldTerminate?: boolean): void;
    onStartDesktopOnboardingHandler(): void;
    updateLinkHandler(link: string): void;
    updateExpiresInHandler(expiresIn: number): void;
    render(): any;
}
//# sourceMappingURL=mm-install-modal.d.ts.map