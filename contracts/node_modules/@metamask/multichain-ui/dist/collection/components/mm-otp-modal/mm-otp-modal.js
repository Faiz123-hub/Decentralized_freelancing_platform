import { h } from "@stencil/core";
import { WidgetWrapper } from "../widget-wrapper/widget-wrapper";
import CloseButton from "../misc/CloseButton";
import { SimpleI18n } from "../misc/simple-i18n";
import InstallIcon from "../misc/InstallIcon";
export class OtpModal {
    constructor() {
        this.displayOTP = undefined;
        this.otpCode = undefined;
        this.translationsLoaded = false;
        this.i18nInstance = new SimpleI18n();
    }
    async connectedCallback() {
        await this.i18nInstance.init({
            fallbackLng: 'en'
        });
        this.translationsLoaded = true;
    }
    onClose() {
        this.close.emit();
    }
    onDisconnect() {
        this.disconnect.emit();
    }
    onUpdateOTPValueHandler(otpCode) {
        this.updateOTPCode.emit({
            otpCode,
        });
    }
    disconnectedCallback() {
        this.onClose();
    }
    render() {
        var _a;
        if (!this.translationsLoaded) {
            return null;
        }
        const displayOTP = (_a = this.displayOTP) !== null && _a !== void 0 ? _a : true;
        const t = (key) => this.i18nInstance.t(key);
        return (h(WidgetWrapper, { className: "pending-modal" }, h("div", { class: 'backdrop', onClick: () => this.onClose() }), h("div", { class: 'modal' }, h("div", { class: 'closeButtonContainer' }, h("div", { class: 'right' }, h("span", { class: 'closeButton', onClick: () => this.onClose() }, h(CloseButton, null)))), h("div", { class: 'logoContainer' }, h(InstallIcon, null)), h("div", null, h("div", { class: 'flexContainer', style: {
                flexDirection: 'column',
                color: 'black',
            } }, h("div", { class: 'flexItem', style: {
                textAlign: 'center',
                marginTop: '30px',
                marginBottom: '30px',
                fontSize: '16px',
            } }, displayOTP
            ? t('PENDING_MODAL.OPEN_META_MASK_SELECT_CODE')
            : t('PENDING_MODAL.OPEN_META_MASK_CONTINUE')), h("div", { id: "sdk-mm-otp-value", style: { padding: '10px', fontSize: '32px', display: this.otpCode ? 'block' : 'none' } }, this.otpCode), displayOTP && (h("div", { class: 'notice' }, "* ", t('PENDING_MODAL.NUMBER_AFTER_OPEN_NOTICE')))), h("div", { style: { marginTop: '20px' } }, h("button", { class: 'button blue', style: {
                marginTop: '5px',
                color: '#0376C9',
                borderColor: '#0376C9',
                borderWidth: '1px',
                borderStyle: 'solid',
                backgroundColor: 'white',
            }, onClick: () => this.onDisconnect() }, t('PENDING_MODAL.DISCONNECT')))))));
    }
    static get is() { return "mm-otp-modal"; }
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
            "displayOTP": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean | undefined",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "The QR code link"
                },
                "attribute": "display-o-t-p",
                "reflect": false
            },
            "otpCode": {
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
                "attribute": "otp-code",
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
                    "original": "any",
                    "resolved": "any",
                    "references": {}
                }
            }, {
                "method": "disconnect",
                "name": "disconnect",
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
                "method": "updateOTPCode",
                "name": "updateOTPCode",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{ otpCode: string }",
                    "resolved": "{ otpCode: string; }",
                    "references": {}
                }
            }];
    }
    static get elementRef() { return "el"; }
}
//# sourceMappingURL=mm-otp-modal.js.map
