import { BaseClient, SessionRequest, ITransport, ISessionStore, IKeyManager, ConnectionMode, ProtocolMessage } from '@metamask/mobile-wallet-protocol-core';
export { SessionRequest } from '@metamask/mobile-wallet-protocol-core';

/**
 * Configuration options for the DappClient.
 */
interface DappClientOptions {
    /** An initialized transport layer for communication. */
    transport: ITransport;
    /** An initialized session store for persistent session management. */
    sessionstore: ISessionStore;
    /** An initialized key manager for cryptographic operations. */
    keymanager: IKeyManager;
}
/**
 * Options for configuring the connection behavior.
 */
interface DappConnectOptions {
    /** The connection mode: 'trusted' for same-device flows, 'untrusted' for high-security OTP flows. */
    mode?: ConnectionMode;
    /** An optional unencrypted payload to be sent as the first message upon connection. */
    initialPayload?: unknown;
}
/**
 * Payload for the 'otp_required' event, providing methods to interact
 * with the One-Time Password (OTP) verification process.
 */
type OtpRequiredPayload = {
    /**
     * Submits the One-Time Password (OTP) for verification.
     * @param otp - The 6-digit OTP provided by the user.
     * @returns A promise that resolves if the OTP is correct, or rejects with an
     * error if it's incorrect or if max attempts are reached.
     */
    submit: (otp: string) => Promise<void>;
    /** Cancels the OTP entry process and the connection attempt. */
    cancel: () => void;
    /** The timestamp (in milliseconds) when the OTP will expire. */
    deadline: number;
};
/**
 * Manages the connection from the dApp's perspective. It handles session
 * initiation, secure communication, and request/response messaging with a wallet.
 *
 * Supports both 'trusted' (streamlined, same-device) and 'untrusted' (OTP-based)
 * connection flows through self-contained handlers.
 */
declare class DappClient extends BaseClient {
    on(event: "session_request", listener: (request: SessionRequest) => void): this;
    on(event: "otp_required", listener: (payload: OtpRequiredPayload) => void): this;
    on(event: "connected" | "disconnected", listener: () => void): this;
    on(event: "message", listener: (payload: unknown) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    constructor(options: DappClientOptions);
    /**
     * Initiates a new session with a wallet. The process differs based on the connection mode:
     *
     * **Trusted Mode** (same-device/trusted context):
     * 1. Emits a `session_request` event
     * 2. Waits for wallet handshake offer
     * 3. Automatically finalizes secure session
     *
     * **Untrusted Mode** (high-security):
     * 1. Emits a `session_request` event
     * 2. Waits for wallet handshake offer with OTP
     * 3. Emits `otp_required` event for user verification
     * 4. Finalizes secure, encrypted session after OTP validation
     *
     * @param options - Connection options including the desired mode
     * @returns A promise that resolves when the session is successfully established
     * @throws {SessionError} If the client is not in a `DISCONNECTED` state or if the
     * connection process fails
     */
    connect(options?: DappConnectOptions): Promise<void>;
    /**
     * Sends a request payload to the connected wallet.
     *
     * @param payload - The request payload to send to the wallet
     * @throws {SessionError} If the client is not in a `CONNECTED` state
     */
    sendRequest(payload: unknown): Promise<void>;
    /**
     * Routes incoming messages based on the client's connection state.
     * During connection, it handles handshake messages. Once connected, it
     * handles standard application messages.
     *
     * @param message - The incoming message to handle
     */
    protected handleMessage(message: ProtocolMessage): void;
    /**
     * Creates a temporary session object and the corresponding `SessionRequest`
     * payload to be shared with the wallet.
     *
     * @param mode - The connection mode to use for this session
     * @returns An object containing the pending session and session request
     */
    private _createPendingSessionAndRequest;
}

export { DappClient, type DappClientOptions, type OtpRequiredPayload };
