import { Modal } from '../../../domain';
export class AbstractOTPCodeModal extends Modal {
    get otpCode() {
        return this.data;
    }
    set otpCode(code) {
        this.data = code;
    }
    updateOTPCode(code) {
        this.otpCode = code;
        if (this.instance) {
            this.instance.otpCode = code;
        }
    }
}
//# sourceMappingURL=AbstractOTPModal.js.map