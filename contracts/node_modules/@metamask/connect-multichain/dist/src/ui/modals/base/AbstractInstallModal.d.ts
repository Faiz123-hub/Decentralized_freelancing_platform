import { type ConnectionRequest, type InstallWidgetProps, Modal, type QRLink } from '../../../domain';
export declare abstract class AbstractInstallModal extends Modal<InstallWidgetProps> {
    #private;
    protected instance?: HTMLMmInstallModalElement | undefined;
    abstract renderQRCode(link: QRLink, connectionRequest: ConnectionRequest): void;
    get link(): QRLink;
    set link(link: QRLink);
    get connectionRequest(): ConnectionRequest;
    set connectionRequest(connectionRequest: ConnectionRequest);
    protected updateLink(link: QRLink): void;
    protected updateExpiresIn(expiresIn: number): void;
    protected startExpirationCheck(connectionRequest: ConnectionRequest): void;
    protected stopExpirationCheck(): void;
}
//# sourceMappingURL=AbstractInstallModal.d.ts.map