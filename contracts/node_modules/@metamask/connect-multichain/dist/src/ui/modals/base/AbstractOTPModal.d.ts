import { Modal, type OTPCodeWidgetProps } from '../../../domain';
export declare abstract class AbstractOTPCodeModal extends Modal<OTPCodeWidgetProps> {
    protected instance?: HTMLMmOtpModalElement | undefined;
    get otpCode(): string;
    set otpCode(code: string);
    updateOTPCode(code: string): void;
}
//# sourceMappingURL=AbstractOTPModal.d.ts.map