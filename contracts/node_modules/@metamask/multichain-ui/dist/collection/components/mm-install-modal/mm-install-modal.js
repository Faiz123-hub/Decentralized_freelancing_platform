import { h, } from "@stencil/core";
import { WidgetWrapper } from "../widget-wrapper/widget-wrapper";
import InstallIcon from "../misc/InstallIcon";
import CloseButton from "../misc/CloseButton";
import QRCodeStyling from "qr-code-styling";
import { SimpleI18n } from "../misc/simple-i18n";
import SVG from "../../assets/fox.svg";
export class InstallModal {
    constructor() {
        this.link = undefined;
        this.expiresIn = undefined;
        this.showInstallModal = undefined;
        this.translationsLoaded = false;
        this.onClose = this.onClose.bind(this);
        this.onStartDesktopOnboardingHandler =
            this.onStartDesktopOnboardingHandler.bind(this);
        this.render = this.render.bind(this);
        this.i18nInstance = new SimpleI18n();
    }
    componentDidLoad() {
        this.generateQRCode(this.link);
    }
    async connectedCallback() {
        await this.i18nInstance.init({
            fallbackLng: 'en',
        });
        this.translationsLoaded = true;
    }
    generateQRCode(data) {
        if (!this.qrCodeContainer) {
            return;
        }
        const options = {
            data,
            type: 'svg',
            image: SVG,
            imageOptions: {
                hideBackgroundDots: true,
                crossOrigin: undefined,
                imageSize: 0.3,
                saveAsBlob: false,
            },
            dotsOptions: {
                color: '#222222',
                type: 'square',
                gradient: undefined,
                roundSize: false,
            },
            cornersSquareOptions: {
                color: '#222222',
                type: 'square',
                gradient: undefined,
            },
            cornersDotOptions: {
                color: '#ff5c16',
            },
            backgroundOptions: {
                color: 'transparent',
            },
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: 'Q',
            },
        };
        const qrCode = new QRCodeStyling(options);
        this.qrCodeContainer.innerHTML = '';
        qrCode.append(this.qrCodeContainer);
    }
    onClose(shouldTerminate = false) {
        this.close.emit({ shouldTerminate });
    }
    onStartDesktopOnboardingHandler() {
        this.startDesktopOnboarding.emit();
    }
    updateLinkHandler(link) {
        this.generateQRCode(link);
    }
    updateExpiresInHandler(expiresIn) {
        console.debug('QRCode expires in:', expiresIn);
    }
    render() {
        if (!this.translationsLoaded) {
            return null; // or a loading state
        }
        const t = (key) => this.i18nInstance.t(key);
        // Determine which section should be shown first based on showInstallModal
        const showExtensionFirst = this.showInstallModal;
        return (h(WidgetWrapper, { className: "install-model" }, h("div", { class: "backdrop", onClick: () => this.onClose(true) }), h("div", { class: "modal" }, h("div", { class: "closeButtonContainer" }, h("div", { class: "right" }, h("span", { class: "closeButton", onClick: () => this.onClose(true) }, h(CloseButton, null)))), h("div", { class: "modalHeader" }, h("h2", { class: "modalTitle" }, t('CONNECT_WITH_METAMASK'))), h("div", { class: "modalContent" }, showExtensionFirst ? (
        // Extension first, then mobile
        h("div", null, h("div", { class: "connectionSection" }, h("h3", { class: "sectionTitle" }, t('USE_EXTENSION')), h("p", { class: "sectionDescription" }, t('ONE_CLICK_CONNECT')), h("button", { class: "button extensionButton", onClick: () => this.onStartDesktopOnboardingHandler() }, h(InstallIcon, null), h("span", { class: "buttonText" }, t('CONNECT_WITH_EXTENSION')))), h("div", { class: "sectionDivider" }), h("div", { class: "connectionSection" }, h("h3", { class: "sectionTitle" }, t('USE_MOBILE')), h("p", { class: "sectionDescription" }, t('SCAN_TO_CONNECT')), h("div", { class: "qrContainer" }, h("div", { id: "sdk-mm-qrcode", class: "qrCode", ref: (el) => {
                if (el)
                    this.qrCodeContainer = el;
            } }))))) : (
        // Mobile first, then extension
        h("div", null, h("div", { class: "connectionSection" }, h("h3", { class: "sectionTitle" }, t('USE_MOBILE')), h("p", { class: "sectionDescription" }, t('SCAN_TO_CONNECT')), h("div", { class: "qrContainer" }, h("div", { id: "sdk-mm-qrcode", class: "qrCode", ref: (el) => {
                if (el)
                    this.qrCodeContainer = el;
            } }))), h("div", { class: "sectionDivider" }), h("div", { class: "connectionSection" }, h("h3", { class: "sectionTitle" }, t('USE_EXTENSION')), h("p", { class: "sectionDescription" }, t('INSTALL_MODAL.INSTALL_META_MASK_EXTENSION_TEXT')), h("button", { class: "button extensionButton", onClick: () => this.onStartDesktopOnboardingHandler() }, h(InstallIcon, null), h("span", { class: "buttonText" }, t('INSTALL_MODAL.INSTALL_META_MASK_EXTENSION_BUTTON'))))))))));
    }
    static get is() { return "mm-install-modal"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["../style.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["../style.css"]
        };
    }
    static get properties() {
        return {
            "link": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "attribute": "link",
                "reflect": false
            },
            "expiresIn": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "attribute": "expires-in",
                "reflect": false
            },
            "showInstallModal": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "attribute": "show-install-modal",
                "reflect": false
            }
        };
    }
    static get states() {
        return {
            "translationsLoaded": {}
        };
    }
    static get events() {
        return [{
                "method": "close",
                "name": "close",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{ shouldTerminate?: boolean }",
                    "resolved": "{ shouldTerminate?: boolean | undefined; }",
                    "references": {}
                }
            }, {
                "method": "startDesktopOnboarding",
                "name": "startDesktopOnboarding",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "any",
                    "resolved": "any",
                    "references": {}
                }
            }, {
                "method": "updateLink",
                "name": "updateLink",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                }
            }, {
                "method": "updateExpiresIn",
                "name": "updateExpiresIn",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                }
            }];
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "link",
                "methodName": "updateLinkHandler"
            }, {
                "propName": "expiresIn",
                "methodName": "updateExpiresInHandler"
            }];
    }
}
//# sourceMappingURL=mm-install-modal.js.map
