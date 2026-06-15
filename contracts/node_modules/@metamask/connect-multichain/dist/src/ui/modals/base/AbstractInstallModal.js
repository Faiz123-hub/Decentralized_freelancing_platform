var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _AbstractInstallModal_expirationInterval, _AbstractInstallModal_lastLoggedCountdown;
/* eslint-disable @typescript-eslint/explicit-function-return-type -- Getters/setters have inferred types */
/* eslint-disable require-atomic-updates -- False positive: connectionRequest is reassigned atomically */
/* eslint-disable @typescript-eslint/no-misused-promises -- setInterval callback is async intentionally */
import { formatRemainingTime, shouldLogCountdown } from './utils';
import { createLogger, Modal, } from '../../../domain';
const logger = createLogger('metamask-sdk:ui');
export class AbstractInstallModal extends Modal {
    constructor() {
        super(...arguments);
        _AbstractInstallModal_expirationInterval.set(this, null);
        _AbstractInstallModal_lastLoggedCountdown.set(this, -1);
    }
    get link() {
        return this.data;
    }
    set link(link) {
        this.data = link;
    }
    get connectionRequest() {
        return this.options.connectionRequest;
    }
    set connectionRequest(connectionRequest) {
        this.options.connectionRequest = connectionRequest;
    }
    updateLink(link) {
        this.link = link;
        if (this.instance) {
            this.instance.link = link;
        }
    }
    updateExpiresIn(expiresIn) {
        if (expiresIn >= 0 && this.instance) {
            this.instance.expiresIn = expiresIn;
        }
    }
    startExpirationCheck(connectionRequest) {
        this.stopExpirationCheck();
        let currentConnectionRequest = connectionRequest;
        __classPrivateFieldSet(this, _AbstractInstallModal_expirationInterval, setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const { sessionRequest } = currentConnectionRequest;
            const now = Date.now();
            const remainingMs = sessionRequest.expiresAt - now;
            const remainingSeconds = Math.floor(remainingMs / 1000);
            if (remainingMs > 0 &&
                shouldLogCountdown(remainingSeconds) &&
                __classPrivateFieldGet(this, _AbstractInstallModal_lastLoggedCountdown, "f") !== remainingSeconds) {
                const formattedTime = formatRemainingTime(remainingMs);
                logger(`[UI: InstallModal-nodejs()] QR code expires in: ${formattedTime} (${remainingSeconds}s)`);
                __classPrivateFieldSet(this, _AbstractInstallModal_lastLoggedCountdown, remainingSeconds, "f");
            }
            if (now >= sessionRequest.expiresAt) {
                this.stopExpirationCheck();
                logger('[UI: InstallModal-nodejs()] ⏰ QR code EXPIRED! Generating new one...');
                try {
                    // Generate new session request
                    currentConnectionRequest =
                        yield this.options.createConnectionRequest();
                    const generateQRCode = yield this.options.generateQRCode(currentConnectionRequest);
                    __classPrivateFieldSet(this, _AbstractInstallModal_lastLoggedCountdown, -1, "f"); // Reset countdown logging
                    // Update local instances with new data
                    this.updateLink(generateQRCode);
                    this.updateExpiresIn(remainingSeconds);
                    // Render QRCode on each platform
                    this.renderQRCode(generateQRCode, currentConnectionRequest);
                }
                catch (error) {
                    logger(`[UI: InstallModal-nodejs()] ❌ Error generating new QR code: ${error}`);
                }
            }
        }), 1000), "f");
    }
    stopExpirationCheck() {
        if (__classPrivateFieldGet(this, _AbstractInstallModal_expirationInterval, "f")) {
            clearInterval(__classPrivateFieldGet(this, _AbstractInstallModal_expirationInterval, "f"));
            __classPrivateFieldSet(this, _AbstractInstallModal_expirationInterval, null, "f");
            logger('[UI: InstallModal-nodejs()] 🛑 Stopped QR code expiration checking');
        }
    }
}
_AbstractInstallModal_expirationInterval = new WeakMap(), _AbstractInstallModal_lastLoggedCountdown = new WeakMap();
//# sourceMappingURL=AbstractInstallModal.js.map