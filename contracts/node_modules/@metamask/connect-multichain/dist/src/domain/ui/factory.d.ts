import type { Transport } from '@metamask/multichain-api-client';
import type { CaipAccountId } from '@metamask/utils';
import type { MultichainOptions, Scope, SessionData } from '../multichain';
/**
 * Options passed when establishing a connection through a modal.
 * Contains the scopes (permissions) and account IDs involved in the connection.
 */
export type ModalFactoryConnectOptions = {
    scopes: Scope[];
    caipAccountIds: CaipAccountId[];
};
/**
 * Configuration options for the modal factory.
 * Combines mobile settings from SDK options with UI preferences and connection handling.
 */
export type ModalFactoryOptions = Pick<MultichainOptions, 'mobile' | 'transport'> & {
    ui: {
        headless?: boolean;
        preferExtension?: boolean;
        showInstallModal?: boolean;
    };
    onConnection: (transport: Transport, options: ModalFactoryConnectOptions) => Promise<void>;
    getCurrentSession: () => Promise<SessionData | undefined>;
    connection?: ModalFactoryConnectOptions;
};
//# sourceMappingURL=factory.d.ts.map