import { AbstractInstallModal } from '../base/AbstractInstallModal';
export class InstallModal extends AbstractInstallModal {
    renderQRCode() {
        // Not needed for web as its using install Modal
    }
    mount() {
        var _a;
        const { options } = this;
        const modal = document.createElement('mm-install-modal');
        modal.showInstallModal = options.showInstallModal;
        modal.addEventListener('close', (ev) => {
            const { detail } = ev;
            options.onClose(detail === null || detail === void 0 ? void 0 : detail.shouldTerminate);
        });
        modal.addEventListener('startDesktopOnboarding', options.startDesktopOnboarding);
        modal.link = options.link;
        this.instance = modal;
        (_a = options.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(modal);
        this.startExpirationCheck(options.connectionRequest);
    }
    unmount() {
        var _a;
        const { options, instance: modal } = this;
        this.stopExpirationCheck();
        if (modal && ((_a = options.parentElement) === null || _a === void 0 ? void 0 : _a.contains(modal))) {
            options.parentElement.removeChild(modal);
            this.instance = undefined;
        }
    }
}
//# sourceMappingURL=install.js.map