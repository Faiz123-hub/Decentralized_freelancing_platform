import debug from 'debug';
import { SessionData, Transport, SessionProperties, TransportRequest, TransportResponse, MultichainApiClient } from '@metamask/multichain-api-client';
export { SessionData } from '@metamask/multichain-api-client';
import { CaipAccountId, CaipChainId, Json } from '@metamask/utils';
import { SessionRequest, Session } from '@metamask/mobile-wallet-protocol-core';
import { Components } from '@metamask/multichain-ui';

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;
type ErrorCodeRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
type DomainErrorCodes = ErrorCodeRange<1, 50>;
type RPCErrorCodes = ErrorCodeRange<50, 60>;
type StorageErrorCodes = ErrorCodeRange<60, 70>;
type ErrorCodes = DomainErrorCodes | RPCErrorCodes | StorageErrorCodes;

declare abstract class BaseErr<C extends string, T extends ErrorCodes> extends Error {
    readonly message: `${C}Err${T}: ${string}`;
    readonly code: T;
    constructor(message: `${C}Err${T}: ${string}`, code: T);
}

declare class RPCHttpErr extends BaseErr<'RPC', RPCErrorCodes> {
    readonly rpcEndpoint: string;
    readonly method: string;
    readonly httpStatus: number;
    static readonly code = 50;
    constructor(rpcEndpoint: string, method: string, httpStatus: number);
}
declare class RPCReadonlyResponseErr extends BaseErr<'RPC', RPCErrorCodes> {
    readonly reason: string;
    static readonly code = 51;
    constructor(reason: string);
}
declare class RPCReadonlyRequestErr extends BaseErr<'RPC', RPCErrorCodes> {
    readonly reason: string;
    static readonly code = 52;
    constructor(reason: string);
}
declare class RPCInvokeMethodErr extends BaseErr<'RPC', RPCErrorCodes> {
    readonly reason: string;
    readonly rpcCode?: number | undefined;
    readonly rpcMessage?: string | undefined;
    static readonly code = 53;
    constructor(reason: string, rpcCode?: number | undefined, rpcMessage?: string | undefined);
}

type SDKEvents = {
    display_uri: [evt: string];
    wallet_sessionChanged: [evt: SessionData | undefined];
    metamask_accountsChanged: [evt: string[]];
    metamask_chainChanged: [evt: {
        chainId: string;
    }];
    stateChanged: [
        evt: 'pending' | 'loaded' | 'disconnected' | 'connected' | 'connecting'
    ];
    [key: string]: [evt: unknown];
};
type EventTypes = SDKEvents;

/**
 * A type-safe event emitter that provides a strongly-typed wrapper around EventEmitter2.
 *
 * This class ensures type safety for event names and their corresponding argument types,
 * making it easier to work with events in a type-safe manner.
 *
 * @template TEvents - A record type mapping event names to their argument types.
 * Each key represents an event name, and the value is a tuple of argument types.
 */
declare class EventEmitter<TEvents extends Record<string, unknown[]>> {
    #private;
    /**
     * Emits an event with the specified name and arguments.
     *
     * @template TEventName - The name of the event to emit (must be a key of TEvents)
     * @param eventName - The name of the event to emit
     * @param eventArg - The arguments to pass to the event handlers
     */
    emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]): void;
    /**
     * Registers an event handler for the specified event.
     *
     * @template TEventName - The name of the event to listen for (must be a key of TEvents)
     * @param eventName - The name of the event to listen for
     * @param handler - The function to call when the event is emitted
     * @returns Nothing
     */
    on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): () => void;
    /**
     * Removes a specific event handler for the specified event.
     *
     * @template TEventName - The name of the event to remove the handler from (must be a key of TEvents)
     * @param eventName - The name of the event to remove the handler from
     * @param handler - The specific handler function to remove
     */
    off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void;
    /**
     * Removes a specific event handler for the specified event.
     * Added for compatibility as some libraries use this method name.
     *
     * @template TEventName - The name of the event to remove the handler from (must be a key of TEvents)
     * @param eventName - The name of the event to remove the handler from
     * @param handler - The specific handler function to remove
     */
    removeListener<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void;
    /**
     * Registers an event handler for the specified event that will only be called once.
     *
     * @template TEventName - The name of the event to listen for (must be a key of TEvents)
     * @param eventName - The name of the event to listen for
     * @param handler - The function to call when the event is emitted (only once)
     * @returns A function to remove the listener
     */
    once<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): () => void;
    /**
     * Returns the number of listeners registered for the specified event.
     *
     * @template TEventName - The name of the event to count listeners for (must be a key of TEvents)
     * @param eventName - The name of the event to count listeners for
     * @returns The number of listeners registered for the event
     */
    listenerCount<TEventName extends keyof TEvents & string>(eventName: TEventName): number;
}

type StoreOptions = Record<string, any>;
declare abstract class StoreAdapter {
    options?: StoreOptions | undefined;
    abstract platform: 'web' | 'rn' | 'node';
    constructor(options?: StoreOptions | undefined);
    abstract get(key: string): Promise<string | null>;
    abstract set(key: string, value: string): Promise<void>;
    abstract delete(key: string): Promise<void>;
}

type EIP155 = {
    methods: {
        personal_sign: RpcMethod<{
            message: string;
            account: string;
        }, string>;
        eth_accounts: RpcMethod<void, string[]>;
        eth_chainId: RpcMethod<void, string>;
        eth_sendTransaction: RpcMethod<{
            to: string;
            value?: string;
            data?: string;
        }, string>;
        eth_call: RpcMethod<{
            to: string;
            data?: string;
        }, string>;
        eth_getBalance: RpcMethod<{
            address: string;
            blockNumber: string;
        }, string>;
        wallet_switchEthereumChain: RpcMethod<{
            chainId: string;
        }, void>;
        wallet_addEthereumChain: RpcMethod<{
            chainId: string;
            chainName: string;
            nativeCurrency?: {
                name: string;
                symbol: string;
                decimals: number;
            } | undefined;
            rpcUrls: readonly string[];
            blockExplorerUrls?: string[] | undefined;
            iconUrls?: string[] | undefined;
        }, void>;
        signAndSendTransaction: RpcMethod<{
            to: string;
            value?: string;
            data?: string;
        }, string>;
        signTransaction: RpcMethod<{
            to: string;
            value?: string;
            data?: string;
        }, string>;
        signMessage: RpcMethod<{
            message: string;
        }, string>;
        signIn: RpcMethod<{
            message: string;
        }, string>;
    };
    events: ['eth_subscription'];
};

/**
 * Represents a blockchain scope identifier in CAIP format.
 *
 * Scopes define which blockchain networks and standards the SDK
 * can interact with. The format follows CAIP standards for
 * blockchain identification.
 *
 * @template T - The RPC API type to extract available scopes from
 */
type Scope<T extends RPCAPI = RPCAPI> = `eip155:${string}` | `solana:${string}` | `${Extract<keyof T, string>}:${string}`;
/**
 * Represents a generic RPC (Remote Procedure Call) method function type.
 *
 * This type defines the signature for RPC methods that can be either synchronous
 * or asynchronous, providing flexibility for different types of API calls.
 *
 * @template Params - The type of parameters that the RPC method accepts
 * @template Return - The type of value that the RPC method returns
 *
 * @param params - The parameters to pass to the RPC method
 * @returns Either a Promise that resolves to the return value, or the return value directly
 */
type RpcMethod<Params, Return> = (params: Params) => Promise<Return> | Return;
/**
 * Defines the structure of the RPC API interface.
 *
 * This type represents the available RPC APIs organized by blockchain standard.
 * Currently supports EIP-155 (Ethereum) with the potential for additional
 * blockchain standards to be added in the future.
 */
type RPCAPI = {
    /** EIP-155 compliant RPC methods for Ethereum-based chains */
    eip155: EIP155;
};
/**
 * Callback function type for handling incoming notifications.
 *
 * This type defines the signature for functions that process notification
 * messages received from RPC connections.
 *
 * @param notification - The notification object to handle
 */
type NotificationCallback = (notification: unknown) => void;
/**
 * Options for invoking RPC methods with specific scope and request parameters.
 *
 * This type defines the structure for method invocation options, allowing
 * callers to specify both the blockchain scope and the specific request details.
 */
type InvokeMethodOptions = {
    /** The blockchain scope/standard to use for the method call */
    scope: Scope;
    /** The request details including method name and parameters */
    request: {
        /** The name of the RPC method to invoke */
        method: string;
        /** The parameters to pass to the RPC method */
        params: unknown;
    };
};
/**
 * Mapping of CAIP chain IDs to their corresponding RPC URLs.
 *
 * This type defines the structure for providing custom RPC endpoints
 * for different blockchain networks using CAIP-2 format identifiers.
 */
type RpcUrlsMap = {
    /** CAIP-2 format chain ID mapped to its RPC URL (e.g., "eip155:1" -> "https://...") */
    [chainId: CaipChainId]: string;
};
/**
 * Represents the structure of a JSON-RPC response.
 *
 * This type defines the expected format of JSON-RPC responses from RPC endpoints.
 * It includes the unique identifier for the request, the JSON-RPC version used,
 * and the result of the RPC call.
 *
 * id - The unique identifier for the request
 * jsonrpc - The JSON-RPC version used
 * result - The result of the RPC call JSON
 */
type RPCResponse = {
    id: number;
    jsonrpc: string;
    result: unknown;
};

declare abstract class AbstractOTPCodeModal extends Modal<OTPCodeWidgetProps> {
    protected instance?: HTMLMmOtpModalElement | undefined;
    get otpCode(): string;
    set otpCode(code: string);
    updateOTPCode(code: string): void;
}

declare abstract class AbstractInstallModal extends Modal<InstallWidgetProps> {
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

/**
 * Record type that maps modal names to their corresponding Modal instances.
 * Used to store different types of modals that can be created by the factory.
 */
type FactoryModals = {
    InstallModal: new (options: InstallWidgetProps) => AbstractInstallModal;
    OTPCodeModal: new (options: OTPCodeWidgetProps) => AbstractOTPCodeModal;
};

/**
 * Base ModalFactory class that accepts a preload function.
 * Platform-specific implementations should extend this class.
 */
declare abstract class BaseModalFactory<T extends FactoryModals = FactoryModals> {
    protected readonly options: T;
    modal: Modal<any>;
    private readonly platform;
    private successCallback;
    private displayUriCallback?;
    /**
     * Creates a new modal factory instance.
     *
     * @param options - The modals configuration object
     */
    constructor(options: T);
    /**
     * Platform-specific preload function to be implemented by subclasses.
     */
    protected abstract preload(): Promise<void>;
    private validateModals;
    unload(error?: Error): Promise<void>;
    /**
     * Determines if the current platform is a mobile native environment.
     * Currently only includes React Native.
     */
    get isMobile(): boolean;
    /**
     * Determines if the current platform is a Node.js environment.
     * Used for server-side or non-browser environments.
     */
    get isNode(): boolean;
    /**
     * Determines if the current platform is a web environment.
     * Includes desktop web, MetaMask mobile webview, and mobile web.
     */
    get isWeb(): boolean;
    private getContainer;
    private getMountedContainer;
    createConnectionDeeplink(connectionRequest?: ConnectionRequest): string;
    createConnectionUniversalLink(connectionRequest?: ConnectionRequest): string;
    private onCloseModal;
    private onStartDesktopOnboarding;
    renderInstallModal(showInstallModal: boolean, createConnectionRequest: () => Promise<ConnectionRequest>, successCallback: (error?: Error) => Promise<void>, onDisplayUri?: (uri: string) => void): Promise<void>;
    renderOTPCodeModal(createOTPCode: () => Promise<OTPCode>, successCallback: (error?: Error) => Promise<void>, updateOTPCode: (otpCode: OTPCode, modal: AbstractOTPCodeModal) => void): Promise<void>;
}

declare enum PlatformType {
    NonBrowser = "nodejs",
    MetaMaskMobileWebview = "in-app-browser",
    DesktopWeb = "web-desktop",
    MobileWeb = "web-mobile",
    ReactNative = "react-native"
}
declare function getPlatformType(): PlatformType;
/**
 * Check if MetaMask extension is installed
 *
 * @returns True if extension is installed, false otherwise
 */
declare function isMetamaskExtensionInstalled(): boolean;
declare function isSecure(): boolean;
declare function hasExtension(): Promise<boolean>;

/**
 * Configuration settings for the dapp using the SDK.
 *
 * This type allows for two variants of dapp configuration:
 * - Using a regular icon URL
 * - Using a base64-encoded icon
 */
type DappSettings = {
    name: string;
    url?: string;
    /** The original non-http(s) URL before normalization on React Native platforms */
    nativeScheme?: string;
} & ({
    iconUrl?: string;
} | {
    base64Icon?: string;
});
type ConnectionRequest = {
    sessionRequest: SessionRequest;
    metadata: {
        dapp: DappSettings;
        sdk: {
            version: string;
            platform: PlatformType;
        };
        analytics?: {
            remote_session_id: string;
        };
    };
};
/**
 * Package versions keyed by connect package name.
 * connect-multichain is always present; chain-specific packages
 * appear only when their client is instantiated.
 */
type ConnectVersions = {
    'connect-multichain': string;
} & Partial<Record<'connect-evm' | 'connect-solana', string>>;
/**
 * Constructor options for creating a Multichain SDK instance.
 *
 * This type defines all the configuration options available when
 * initializing the SDK, including dapp settings, API configuration,
 * analytics, storage, UI preferences, and transport options.
 */
type MultichainOptions = {
    /** Dapp identification and branding settings */
    dapp: DappSettings;
    /** Optional API configuration for external services */
    api: {
        /** A map of `caipChainIds` -> RPC Urls for all networks supported by the app*/
        supportedNetworks: RpcUrlsMap;
    };
    /** Analytics configuration */
    analytics?: {
        integrationType: string;
    };
    /** Storage client for persisting SDK data */
    storage: StoreClient;
    /** UI configuration options */
    ui: {
        factory: BaseModalFactory;
        headless?: boolean;
        preferExtension?: boolean;
        showInstallModal?: boolean;
    };
    mobile?: {
        preferredOpenLink?: (deeplink: string, target?: string) => void;
        /**
         * The `MetaMaskSDK` constructor option `useDeeplink: boolean` controls which type of link is used:
         * -   If `true`, the SDK will attempt to use the `metamask://` deeplink.
         * -   If `false` (the default for web), the SDK will use the `https://metamask.app.link` universal link.
         */
        useDeeplink?: boolean;
    };
    /** Optional transport configuration */
    transport?: {
        /** Extension ID for browser extension transport */
        extensionId?: string;
        onNotification?: (notification: unknown) => void;
    };
    /** Enable debug logging */
    debug?: boolean;
    /** Package versions contributed by chain-specific clients (merged on each createMultichainClient call) */
    versions?: Partial<ConnectVersions>;
};
type MultiChainFNOptions = Omit<MultichainOptions, 'storage' | 'ui'> & {
    ui?: Omit<MultichainOptions['ui'], 'factory'>;
} & {
    storage?: StoreClient;
};
/**
 * Options that can be merged/overwritten when createMultichainClient is called
 * with an existing singleton.
 */
type MergeableMultichainOptions = Omit<MultichainOptions, 'dapp' | 'analytics' | 'storage' | 'api' | 'ui' | 'transport' | 'versions'> & {
    api?: MultichainOptions['api'];
    ui?: Pick<MultichainOptions['ui'], 'headless' | 'preferExtension' | 'showInstallModal'>;
    transport?: Pick<NonNullable<MultichainOptions['transport']>, 'extensionId'>;
    debug?: boolean;
    versions?: Partial<ConnectVersions>;
};
/**
 * Complete options for Multichain SDK configuration.
 *
 * This type extends the base options with storage configuration,
 * providing all necessary options for SDK initialization.
 */
type CreateMultichainFN = (options: MultiChainFNOptions) => Promise<MultichainCore>;
type ExtendedTransport = Omit<Transport, 'connect'> & {
    init: () => Promise<void>;
    connect: (props?: {
        scopes: Scope[];
        caipAccountIds: CaipAccountId[];
        sessionProperties?: SessionProperties;
        forceRequest?: boolean;
    }) => Promise<void>;
    sendEip1193Message: <TRequest extends TransportRequest, TResponse extends TransportResponse>(request: TRequest, options?: {
        timeout?: number;
    }) => Promise<TResponse>;
    getActiveSession: () => Promise<Session | undefined>;
    getStoredPendingSessionRequest: () => Promise<SessionRequest | null>;
    disconnect: (scopes: Scope[]) => Promise<void>;
};

declare const infuraRpcUrls: RpcUrlsMap;
declare const RPC_HANDLED_METHODS: Set<string>;
declare const SDK_HANDLED_METHODS: Set<string>;

/**
 * Generates Infura RPC URLs for common networks keyed by CAIP Chain ID.
 *
 * @param options - The options for generating Infura RPC URLs
 * @param options.infuraApiKey - The Infura API key
 * @param options.caipChainIds - Optional CAIP-2 chain IDs to filter the output
 * @returns A map of CAIP-2 chain IDs to Infura RPC URLs
 */
declare function getInfuraRpcUrls({ infuraApiKey, caipChainIds, }: {
    infuraApiKey: string;
    caipChainIds?: CaipChainId[];
}): RpcUrlsMap;

type ConnectionStatus = 'pending' | 'loaded' | 'disconnected' | 'connected' | 'connecting';
declare enum TransportType {
    Browser = "browser",
    MWP = "mwp",
    UNKNOWN = "unknown"
}
/**
 * Abstract base class for the Multichain SDK implementation.
 *
 * This class defines the core interface that all Multichain SDK implementations
 * must provide, including session management, connection handling, and method invocation.
 */
declare abstract class MultichainCore extends EventEmitter<SDKEvents> {
    protected options: MultichainOptions;
    abstract storage: StoreClient;
    abstract status: ConnectionStatus;
    abstract provider: MultichainApiClient<RPCAPI>;
    abstract transport: ExtendedTransport;
    abstract transportType: TransportType;
    /**
     * Establishes a connection to the multichain provider, or re-use existing session
     *
     * @returns Promise that resolves to the session data
     */
    abstract connect(scopes: Scope[], caipAccountIds: CaipAccountId[], sessionProperties?: SessionProperties, forceRequest?: boolean): Promise<void>;
    /**
     * Disconnects from the multichain provider.
     *
     * @returns Promise that resolves when disconnection is complete
     */
    abstract disconnect(scopes?: Scope[]): Promise<void>;
    /**
     * Invokes an RPC method with the specified options.
     *
     * @param options - The method invocation options including scope and request details
     * @returns Promise that resolves to the method result
     */
    abstract invokeMethod(options: InvokeMethodOptions): Promise<Json>;
    abstract openSimpleDeeplinkIfNeeded(): void;
    abstract emitSessionChanged(): Promise<void>;
    constructor(options: MultichainOptions);
    /**
     * Merges the given options into the current instance options.
     * Only the mergeable keys are updated (api.supportedNetworks, versions, ui.*, mobile.*, transport.extensionId, debug).
     * The main thing to note is that the value for `dapp` is not merged as it does not make sense for
     * subsequent calls to `createMultichainClient` to have a different `dapp` value.
     * Used when createMultichainClient is called with an existing singleton.
     *
     * @param partial - Options to merge/overwrite onto the current instance
     */
    mergeOptions(partial: MergeableMultichainOptions): void;
}
declare function getTransportType(type: string): TransportType;

declare abstract class StoreClient {
    abstract adapter: StoreAdapter;
    abstract getAnonId(): Promise<string>;
    abstract getExtensionId(): Promise<string | null>;
    abstract setExtensionId(extensionId: string): Promise<void>;
    abstract getTransport(): Promise<TransportType | null>;
    abstract setTransport(transport: TransportType): Promise<void>;
    abstract removeTransport(): Promise<void>;
    abstract setAnonId(anonId: string): Promise<void>;
    abstract removeExtensionId(): Promise<void>;
    abstract removeAnonId(): Promise<void>;
    abstract getDebug(): Promise<string | null>;
}

/**
 * Supported debug namespace types for the MetaMask SDK logger.
 * These namespaces help categorize and filter debug output.
 */
type LoggerNameSpaces = 'metamask-sdk:*' | 'metamask-sdk' | 'metamask-sdk:core' | 'metamask-sdk:provider' | 'metamask-sdk:ui' | 'metamask-sdk:transport';
/**
 * Creates a debug logger instance with the specified namespace and color.
 *
 * This function initializes a debug logger using the 'debug' library,
 * which allows for conditional logging based on environment variables or storage settings.
 *
 * @param namespace - The debug namespace to use for this logger instance
 * @param color - The ANSI color code to use for log output (default: '214' for yellow)
 * @returns A configured debug logger instance
 */
declare const createLogger: (namespace?: LoggerNameSpaces, color?: string) => debug.Debugger;
/**
 * Enables debug logging for the specified namespace.
 *
 * This function activates debug output for the given namespace,
 * allowing debug messages to be displayed in the console.
 *
 * @param namespace - The debug namespace to enable
 */
declare const enableDebug: (namespace?: LoggerNameSpaces) => void;
/**
 * Determines if debug logging is enabled for a specific namespace.
 *
 * This function checks multiple sources to determine if debug logging should be active:
 * 1. First checks the process environment variable 'debug'
 * 2. Falls back to checking the debug setting in storage
 * 3. Returns false if neither source enables the namespace
 *
 * @param namespace - The namespace to check for debug enablement
 * @param storage - The storage client to check for debug settings
 * @returns Promise that resolves to true if debug logging is enabled, false otherwise
 */
declare const isEnabled: (namespace: LoggerNameSpaces, storage: StoreClient) => Promise<boolean>;

/**
 * Options passed when establishing a connection through a modal.
 * Contains the scopes (permissions) and account IDs involved in the connection.
 */
type ModalFactoryConnectOptions = {
    scopes: Scope[];
    caipAccountIds: CaipAccountId[];
};
/**
 * Configuration options for the modal factory.
 * Combines mobile settings from SDK options with UI preferences and connection handling.
 */
type ModalFactoryOptions = Pick<MultichainOptions, 'mobile' | 'transport'> & {
    ui: {
        headless?: boolean;
        preferExtension?: boolean;
        showInstallModal?: boolean;
    };
    onConnection: (transport: Transport, options: ModalFactoryConnectOptions) => Promise<void>;
    getCurrentSession: () => Promise<SessionData | undefined>;
    connection?: ModalFactoryConnectOptions;
};

type OTPCode = string;
type QRLink = string;
type InstallWidgetProps = Components.MmInstallModal & {
    parentElement?: Element;
    connectionRequest: ConnectionRequest;
    onClose: (shouldTerminate?: boolean) => void;
    startDesktopOnboarding: () => void;
    createConnectionRequest: () => Promise<ConnectionRequest>;
    generateQRCode: (connectionRequest: ConnectionRequest) => Promise<QRLink>;
    /**
     * Callback invoked when a QR code link is generated or regenerated.
     * This allows consumers to display their own custom QR code UI.
     *
     * @param uri - The deeplink URI to be displayed as a QR code
     */
    onDisplayUri?: (uri: QRLink) => void;
};
type OTPCodeWidgetProps = Components.MmOtpModal & {
    parentElement?: Element;
    onClose: () => Promise<void>;
    onDisconnect?: () => void;
    createOTPCode: () => Promise<OTPCode>;
    updateOTPCode: (otpValue: string) => void;
};
type DataType = OTPCode | QRLink;
/**
 * Abstract Modal class with shared functionality across all models
 */
declare abstract class Modal<Options, Data extends DataType = DataType> {
    protected readonly options: Options;
    protected abstract instance?: HTMLMmInstallModalElement | HTMLMmOtpModalElement | undefined;
    abstract mount(): void;
    abstract unmount(): void;
    constructor(options: Options);
    get isMounted(): boolean;
    get data(): Data;
    set data(data: Data);
}

/**
 * Checks if an error represents a user rejection.
 *
 * @param error - The error object to check
 * @returns True if the error indicates a user rejection, false otherwise
 */
declare function isRejectionError(error: unknown): boolean;
/**
 * Gets analytics properties specific to wallet action events.
 *
 * @param options - Multichain options containing dapp and analytics config
 * @param storage - Storage client for getting anonymous ID
 * @param invokeOptions - The invoke method options containing method and scope
 * @param transportType - The transport type to use for the analytics event
 * @returns Wallet action analytics properties
 */
declare function getWalletActionAnalyticsProperties(options: MultichainOptions, storage: StoreClient, invokeOptions: InvokeMethodOptions, transportType: TransportType): Promise<{
    mmconnect_versions: Record<string, string>;
    dapp_id: string;
    method: string;
    caip_chain_id: string;
    anon_id: string;
    transport_type: TransportType;
}>;

/**
 * Returns the version of the Multichain SDK.
 *
 * @returns The version of the Multichain SDK.
 */
declare function getVersion(): string;

declare const createMultichainClient: CreateMultichainFN;

export { type ConnectVersions, type ConnectionRequest, type ConnectionStatus, type CreateMultichainFN, type DappSettings, type DataType, type DomainErrorCodes, type Enumerate, type ErrorCodeRange, type ErrorCodes, EventEmitter, type EventTypes, type ExtendedTransport, type InstallWidgetProps, type InvokeMethodOptions, type LoggerNameSpaces, type MergeableMultichainOptions, Modal, type ModalFactoryConnectOptions, type ModalFactoryOptions, MultichainCore, type MultichainOptions, type NotificationCallback, type OTPCode, type OTPCodeWidgetProps, PlatformType, type QRLink, type RPCAPI, type RPCErrorCodes, RPCHttpErr, RPCInvokeMethodErr, RPCReadonlyRequestErr, RPCReadonlyResponseErr, type RPCResponse, RPC_HANDLED_METHODS, type RpcMethod, type RpcUrlsMap, type SDKEvents, SDK_HANDLED_METHODS, type Scope, type StorageErrorCodes, StoreAdapter, StoreClient, type StoreOptions, TransportType, createLogger, createMultichainClient, enableDebug, getInfuraRpcUrls, getPlatformType, getTransportType, getVersion, getWalletActionAnalyticsProperties, hasExtension, infuraRpcUrls, isEnabled, isMetamaskExtensionInstalled, isRejectionError, isSecure };
