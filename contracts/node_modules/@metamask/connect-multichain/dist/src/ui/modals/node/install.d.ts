import { type ConnectionRequest, type QRLink } from '../../../domain';
import { AbstractInstallModal } from '../base/AbstractInstallModal';
export declare class InstallModal extends AbstractInstallModal {
    private displayQRWithCountdown;
    renderQRCode(link: QRLink, connectionRequest: ConnectionRequest): void;
    mount(): void;
    unmount(): void;
}
//# sourceMappingURL=install.d.ts.map