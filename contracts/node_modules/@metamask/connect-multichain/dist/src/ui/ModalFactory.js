/* eslint-disable @typescript-eslint/no-shadow */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable no-restricted-globals */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/parameter-properties */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/naming-convention */
import MetaMaskOnboarding from '@metamask/onboarding';
import { METAMASK_CONNECT_BASE_URL, METAMASK_DEEPLINK_BASE } from '../config';
import { getPlatformType, PlatformType, } from '../domain';
import { compressString } from '../multichain/utils';
/**
 * Base ModalFactory class that accepts a preload function.
 * Platform-specific implementations should extend this class.
 */
export class BaseModalFactory {
    /**
     * Creates a new modal factory instance.
     *
     * @param options - The modals configuration object
     */
    constructor(options) {
        this.options = options;
        this.platform = getPlatformType();
        this.validateModals();
    }
    validateModals() {
        const requiredModals = ['InstallModal', 'OTPCodeModal'];
        const missingModals = requiredModals.filter((modal) => !this.options[modal]);
        if (missingModals.length > 0) {
            throw new Error(`Missing required modals: ${missingModals.join(', ')}`);
        }
    }
    unload(error) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.unmount();
            yield ((_b = this.successCallback) === null || _b === void 0 ? void 0 : _b.call(this, error));
        });
    }
    /**
     * Determines if the current platform is a mobile native environment.
     * Currently only includes React Native.
     */
    get isMobile() {
        return this.platform === PlatformType.ReactNative;
    }
    /**
     * Determines if the current platform is a Node.js environment.
     * Used for server-side or non-browser environments.
     */
    get isNode() {
        return this.platform === PlatformType.NonBrowser;
    }
    /**
     * Determines if the current platform is a web environment.
     * Includes desktop web, MetaMask mobile webview, and mobile web.
     */
    get isWeb() {
        return (this.platform === PlatformType.DesktopWeb ||
            this.platform === PlatformType.MetaMaskMobileWebview ||
            this.platform === PlatformType.MobileWeb);
    }
    getContainer() {
        return typeof document === 'undefined'
            ? undefined
            : document.createElement('div');
    }
    getMountedContainer() {
        if (typeof document === 'undefined') {
            return undefined;
        }
        const container = this.getContainer();
        if (container) {
            document.body.appendChild(container);
        }
        return container;
    }
    createConnectionDeeplink(connectionRequest) {
        if (!connectionRequest) {
            throw new Error('createConnectionDeeplink can only be called with a connection request');
        }
        const json = JSON.stringify(connectionRequest);
        const compressed = compressString(json);
        const urlEncoded = encodeURIComponent(compressed);
        return `${METAMASK_DEEPLINK_BASE}/mwp?p=${urlEncoded}&c=1`;
    }
    createConnectionUniversalLink(connectionRequest) {
        if (!connectionRequest) {
            return `${METAMASK_CONNECT_BASE_URL}`;
        }
        const json = JSON.stringify(connectionRequest);
        const compressed = compressString(json);
        const urlEncoded = encodeURIComponent(compressed);
        return `${METAMASK_CONNECT_BASE_URL}/mwp?p=${urlEncoded}&c=1`;
    }
    onCloseModal() {
        return __awaiter(this, arguments, void 0, function* (shouldTerminate = true) {
            return this.unload(shouldTerminate ? new Error('User closed modal') : undefined);
        });
    }
    onStartDesktopOnboarding() {
        new MetaMaskOnboarding().startOnboarding();
    }
    renderInstallModal(showInstallModal, createConnectionRequest, successCallback, onDisplayUri) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.unmount();
            yield this.preload();
            this.successCallback = successCallback;
            this.displayUriCallback = onDisplayUri;
            const parentElement = this.getMountedContainer();
            const connectionRequest = yield createConnectionRequest();
            const qrCodeLink = this.createConnectionDeeplink(connectionRequest);
            (_b = this.displayUriCallback) === null || _b === void 0 ? void 0 : _b.call(this, qrCodeLink);
            const modal = new this.options.InstallModal({
                expiresIn: (connectionRequest.sessionRequest.expiresAt - Date.now()) / 1000,
                connectionRequest,
                parentElement,
                showInstallModal,
                link: qrCodeLink,
                generateQRCode: (request) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const newLink = this.createConnectionDeeplink(request);
                    (_a = this.displayUriCallback) === null || _a === void 0 ? void 0 : _a.call(this, newLink);
                    return newLink;
                }),
                onClose: this.onCloseModal.bind(this),
                startDesktopOnboarding: this.onStartDesktopOnboarding.bind(this),
                createConnectionRequest,
                onDisplayUri: this.displayUriCallback,
            });
            this.modal = modal;
            modal.mount();
        });
    }
    renderOTPCodeModal(createOTPCode, successCallback, updateOTPCode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.unmount();
            yield this.preload();
            this.successCallback = successCallback;
            const container = this.getMountedContainer();
            const otpCode = yield createOTPCode();
            const modal = new this.options.OTPCodeModal({
                parentElement: container,
                otpCode,
                onClose: this.onCloseModal.bind(this),
                createOTPCode,
                updateOTPCode: (otpCode) => updateOTPCode(otpCode, modal),
            });
            this.modal = modal;
            modal.mount();
        });
    }
}
//# sourceMappingURL=ModalFactory.js.map