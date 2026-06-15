import EventEmitter from 'eventemitter3';

declare enum ClientState {
    DISCONNECTED = "DISCONNECTED",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED"
}

/**
 * Represents a cryptographic key pair.
 */
type KeyPair = {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
};

/**
 * A key manager is responsible for generating key pairs, encrypting and decrypting messages.
 */
interface IKeyManager {
    generateKeyPair(): KeyPair;
    encrypt(plaintext: string, theirPublicKey: Uint8Array): Promise<string>;
    decrypt(encryptedB64: string, myPrivateKey: Uint8Array): Promise<string>;
    validatePeerKey(key: Uint8Array): void;
}

type HandshakeOfferPayload = {
    publicKeyB64: string;
    channelId: string;
    otp?: string;
    deadline?: number;
};
type HandshakeOffer = {
    type: "handshake-offer";
    payload: HandshakeOfferPayload;
};
type HandshakeAck = {
    type: "handshake-ack";
};
type Message = {
    type: "message";
    payload: unknown;
};
/**
 * A protocol message is a message that is sent between the dapp and the wallet.
 * It can be a handshake offer, a handshake ack, or a message.
 */
type ProtocolMessage = HandshakeOffer | HandshakeAck | Message;

/**
 * A session is a unique identifier for a connection between two parties.
 * It contains the key pair for the local party, the public key of the remote party,
 * and the expiration time of the session.
 */
type Session = {
    id: string;
    channel: string;
    keyPair: KeyPair;
    theirPublicKey: Uint8Array;
    expiresAt: number;
};

/**
 * Interface for persistent session storage.
 */
interface ISessionStore {
    /**
     * Stores a session.
     * @param session - The session to store
     * @throws Error if the session is expired
     */
    set(session: Session): Promise<void>;
    /**
     * Retrieves a session by ID.
     * @param id - The session ID
     * @returns The session if found and not expired, null otherwise
     */
    get(id: string): Promise<Session | null>;
    /**
     * Lists all active sessions.
     * @returns Array of non-expired sessions
     */
    list(): Promise<Session[]>;
    /**
     * Deletes a session.
     * @param id - The session ID to delete
     */
    delete(id: string): Promise<void>;
}

/**
 * Defines the contract for a communication transport.
 * This allows the protocol to be agnostic to the underlying
 * communication mechanism (e.g., WebSocket, Deep Link).
 *
 * It is designed around a simple, channel-based publish/subscribe model.
 */
interface ITransport {
    /**
     * Establishes a connection.
     * Returns a promise that resolves when the connection is established.
     */
    connect(): Promise<void>;
    /**
     * Disconnects.
     * Returns a promise that resolves when the connection is closed.
     */
    disconnect(): Promise<void>;
    /**
     * Publishes a message to a specific channel.
     * @param channel The channel to publish the message to.
     * @param message The message payload to send.
     * @returns A promise that resolves with `true` if published successfully,
     * or `false` if the operation was cancelled (e.g., due to a disconnect)
     * before the message could be sent. It rejects on a true publication failure.
     */
    publish(channel: string, message: string): Promise<boolean>;
    /**
     * Subscribes to a channel to begin receiving messages.
     * @param channel The channel to subscribe to.
     * Returns a promise that resolves when the subscription is established.
     */
    subscribe(channel: string): Promise<void>;
    /**
     * Listens for incoming events from the transport.
     * @param event The name of the event to listen for.
     * @param handler The callback function to execute.
     */
    on(event: "message", handler: (payload: {
        channel: string;
        data: string;
    }) => void): void;
    on(event: "connecting" | "connected" | "disconnected", handler: () => void): void;
    on(event: "error", handler: (error: Error) => void): void;
    /**
     * Clears the transport for a given channel.
     * @param channel The channel to clear.
     */
    clear(channel: string): Promise<void>;
    /**
     * Forcibly drops the current connection and attempts to re-establish it.
     * This is designed to recover from stale or zombie connections without losing
     * the client's subscription state. It should trigger the transport's built-in
     * recovery mechanisms upon a successful new connection.
     *
     * @returns A promise that resolves when the connection is re-established.
     */
    reconnect?(): Promise<void>;
}

/**
 * An abstract client that provides the core logic for establishing and managing
 * secure, session-based communication. It handles encryption, message transport,
 * and session lifecycle events.
 * Subclasses must implement the `handleMessage` method to process incoming data.
 */
declare abstract class BaseClient extends EventEmitter {
    protected transport: ITransport;
    protected keymanager: IKeyManager;
    protected sessionstore: ISessionStore;
    protected session: Session | null;
    protected _state: ClientState;
    on(event: "connected" | "disconnected", listener: () => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: "message", listener: (payload: unknown) => void): this;
    /**
     * Initializes the BaseClient with its core dependencies.
     *
     * @param transport - The transport layer for communication.
     * @param keymanager - The key manager for cryptographic operations.
     * @param sessionstore - The persistent store for session management.
     */
    constructor(transport: ITransport, keymanager: IKeyManager, sessionstore: ISessionStore);
    get state(): ClientState;
    protected set state(state: ClientState);
    /**
     * Proactively refreshes the underlying transport connection.
     * This is the recommended method for mobile clients to call when the application
     * returns to the foreground to ensure the connection is not stale.
     */
    reconnect(): Promise<void>;
    /**
     * Resumes an existing session by loading it from storage and connecting to the
     * transport on the session's secure channel.
     *
     * @param sessionId - The ID of the session to resume.
     * @throws {SessionError} If the session is not found, has expired, or the client
     * is not in a `DISCONNECTED` state.
     */
    resume(sessionId: string): Promise<void>;
    /**
     * Disconnects the client, clears the active session from memory and persistent
     * storage, and cleans up the transport channel. Emits a 'disconnected' event.
     */
    disconnect(): Promise<void>;
    /**
     * Handles a decrypted, incoming protocol message.
     * Subclasses must implement this method to define their message handling logic.
     *
     * @param message - The decrypted protocol message.
     */
    protected abstract handleMessage(message: ProtocolMessage): void;
    /**
     * Encrypts and sends a protocol message to a specified channel.
     * Automatically checks for session expiry before sending.
     *
     * @param channel - The communication channel to publish the message on.
     * @param message - The protocol message to send.
     * @throws {SessionError} If the client session is not initialized or is expired.
     * @throws {TransportError} If the message fails to send due to a transport issue.
     */
    protected sendMessage(channel: string, message: ProtocolMessage): Promise<void>;
    /**
     * Checks if the current session has expired. If so, triggers a disconnect.
     *
     * @returns true if the session was expired (and cleanup was triggered), false otherwise.
     */
    private checkSessionExpiry;
    /**
     * Decrypts an incoming message payload.
     *
     * @param encrypted - The base64-encoded encrypted payload.
     * @returns The parsed `ProtocolMessage`, or `null` if decryption fails.
     * On failure, it emits a `CryptoError`.
     */
    private decryptMessage;
}

/**
 * The connection mode to use for establishing a session.
 * 'trusted': A streamlined flow for same-device or trusted contexts that bypasses OTP.
 * 'untrusted': The high-security flow requiring user verification via OTP.
 */
declare const CONNECTION_MODES: readonly ["trusted", "untrusted"];
type ConnectionMode = (typeof CONNECTION_MODES)[number];
declare function isValidConnectionMode(value: unknown): value is ConnectionMode;

declare enum ErrorCode {
    SESSION_EXPIRED = "SESSION_EXPIRED",
    SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
    SESSION_INVALID_STATE = "SESSION_INVALID_STATE",
    SESSION_SAVE_FAILED = "SESSION_SAVE_FAILED",
    TRANSPORT_DISCONNECTED = "TRANSPORT_DISCONNECTED",
    TRANSPORT_PUBLISH_FAILED = "TRANSPORT_PUBLISH_FAILED",
    TRANSPORT_SUBSCRIBE_FAILED = "TRANSPORT_SUBSCRIBE_FAILED",
    TRANSPORT_HISTORY_FAILED = "TRANSPORT_HISTORY_FAILED",
    TRANSPORT_PARSE_FAILED = "TRANSPORT_PARSE_FAILED",
    TRANSPORT_RECONNECT_FAILED = "TRANSPORT_RECONNECT_FAILED",
    DECRYPTION_FAILED = "DECRYPTION_FAILED",
    INVALID_KEY = "INVALID_KEY",
    REQUEST_EXPIRED = "REQUEST_EXPIRED",
    OTP_INCORRECT = "OTP_INCORRECT",
    OTP_MAX_ATTEMPTS_REACHED = "OTP_MAX_ATTEMPTS_REACHED",
    OTP_ENTRY_TIMEOUT = "OTP_ENTRY_TIMEOUT",
    UNKNOWN = "UNKNOWN"
}
declare class ProtocolError extends Error {
    readonly code: ErrorCode;
    constructor(code: ErrorCode, message?: string);
}
declare class SessionError extends ProtocolError {
}
declare class TransportError extends ProtocolError {
}
declare class CryptoError extends ProtocolError {
}

/**
 * Defines a persistent, asynchronous key-value storage interface.
 */
interface IKVStore {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}

/**
 * A session request is a message sent by the dApp to the wallet to initiate a session.
 */
type SessionRequest = {
    id: string;
    mode: ConnectionMode;
    channel: string;
    publicKeyB64: string;
    expiresAt: number;
    /**
     * An optional, unencrypted message.
     *
     * If provided, this will be the first message the wallet processes immediately after
     * the connection is finalized. This is used to solve the "dApp suspension" issue
     * on mobile deep linking.
     */
    initialMessage?: Message;
};

/**
 * The time-to-live for a session.
 */
declare const DEFAULT_SESSION_TTL: number;
/**
 * Manages persistent storage of Session objects.
 * Handles serialization/deserialization and maintains a master list of session IDs.
 */
declare class SessionStore implements ISessionStore {
    private static readonly SESSION_PREFIX;
    private static readonly MASTER_LIST_KEY;
    private readonly kvstore;
    private readonly mutex;
    /**
     * Creates a new SessionStore instance and runs initial garbage collection.
     * Use this instead of the constructor to ensure GC completes before use.
     */
    static create(kvstore: IKVStore): Promise<SessionStore>;
    private constructor();
    /**
     * Sets a session in the store.
     * @param session - The session to set.
     */
    set(session: Session): Promise<void>;
    /**
     * Gets a session from the store.
     * @param id - The ID of the session to get.
     * @returns The session if it exists, otherwise null.
     */
    get(id: string): Promise<Session | null>;
    /**
     * Lists all sessions in the store.
     * @returns A list of all sessions.
     */
    list(): Promise<Session[]>;
    /**
     * Deletes a session from the store.
     * @param id - The ID of the session to delete.
     */
    delete(id: string): Promise<void>;
    /**
     * Garbage collects expired sessions.
     */
    private garbageCollect;
    /**
     * Gets the key for a session.
     * @param id - The ID of the session.
     * @returns The key for the session.
     */
    private getSessionKey;
    /**
     * Gets the master list of session IDs.
     * @returns The master list of session IDs.
     */
    private getMasterList;
    /**
     * Adds a session ID to the master list.
     * @param id - The ID of the session to add.
     */
    private addToMasterList;
    /**
     * Removes a session ID from the master list.
     * @param id - The ID of the session to remove.
     */
    private removeFromMasterList;
}

/**
 * Options for creating a WebSocketTransport instance.
 */
type WebSocketTransportOptions = {
    /** URL of the relay server. */
    url: string;
    /** Key-value store to use for storage. */
    kvstore: IKVStore;
    /** Optional WebSocket client to use. Mainly for testing or non-browser environments. */
    websocket?: unknown;
    /**
     * This will cause the transport to use a single, shared WebSocket connection across all instances.
     * Useful when multiple instances of the transport are used in the same application.
     * @default false
     */
    useSharedConnection?: boolean;
};
/**
 * An ITransport implementation using `centrifuge-js`.
 * It provides a resilient WebSocket connection with message queuing, delivery
 * guarantees, and deduplication.
 */
declare class WebSocketTransport extends EventEmitter implements ITransport {
    private readonly centrifuge;
    private readonly storage;
    private readonly queue;
    private isProcessingQueue;
    private state;
    /**
     * Creates a new WebSocketTransport instance. The storage parameter must be provided
     * to enable persistence across restarts.
     */
    static create(options: WebSocketTransportOptions): Promise<WebSocketTransport>;
    private constructor();
    /**
     * Connects to the relay server.
     */
    connect(): Promise<void>;
    /**
     * Disconnects from the relay server.
     */
    disconnect(): Promise<void>;
    /**
     * Disconnects and immediately reconnects the underlying Centrifuge client.
     * This is a proactive way to force a fresh connection while preserving all
     * existing subscription objects in memory, allowing for automatic recovery.
     */
    reconnect(): Promise<void>;
    /**
     * Subscribes to a channel and fetches historical messages and sends any queued messages.
     */
    subscribe(channel: string): Promise<void>;
    /**
     * Publishes a message to a channel. Returns a promise that resolves when the message is published.
     */
    publish(channel: string, payload: string): Promise<boolean>;
    /**
     * Clears the transport for a given channel.
     */
    clear(channel: string): Promise<void>;
    /**
     * Sets the internal state of the transport.
     */
    private setState;
    /**
     * Parses an incoming raw message, checks for duplicates, and emits it.
     */
    private _handleIncomingMessage;
    /**
     * Fetches historical messages for a channel to ensure no data is missed on first subscribe.
     */
    private _fetchHistory;
    /**
     * Attempts to publish a single message from the queue with retry logic.
     */
    private _process;
    /**
     * Processes the outgoing message queue serially.
     */
    private _processQueue;
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 *
 * Always compares every character regardless of where a mismatch occurs,
 * so the execution time does not leak information about which characters
 * matched. Returns false immediately only when the lengths differ (length
 * is not considered secret for OTP comparison).
 */
declare function timingSafeEqual(a: string, b: string): boolean;

export { BaseClient, CONNECTION_MODES, ClientState, type ConnectionMode, CryptoError, DEFAULT_SESSION_TTL, ErrorCode, type HandshakeAck, type HandshakeOffer, type HandshakeOfferPayload, type IKVStore, type IKeyManager, type ISessionStore, type ITransport, type KeyPair, type Message, ProtocolError, type ProtocolMessage, type Session, SessionError, type SessionRequest, SessionStore, TransportError, WebSocketTransport, type WebSocketTransportOptions, isValidConnectionMode, timingSafeEqual };
