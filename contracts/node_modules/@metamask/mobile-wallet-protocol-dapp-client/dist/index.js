"use strict";Object.defineProperty(exports, "__esModule", {value: true}); var _class;// src/client.ts







var _mobilewalletprotocolcore = require('@metamask/mobile-wallet-protocol-core');
var _utils = require('@metamask/utils');
var _uuid = require('uuid');

// src/handlers/trusted-connection-handler.ts


var TrustedConnectionHandler = class {
  
  constructor(context) {
    this.context = context;
  }
  /**
   * Executes the complete trusted connection flow.
   * This method is fully self-contained and handles the connection process.
   */
  async execute(session, request) {
    await this.context.transport.connect();
    await this.context.transport.subscribe(request.channel);
    const offer = await this._waitForHandshakeOffer(request.expiresAt);
    const finalSession = this._createFinalSession(session, offer);
    this.context.session = finalSession;
    await this._finalizeConnection(finalSession, request);
  }
  /**
   * Waits for a `handshake-offer` message from the wallet.
   *
   * This method uses a dual-timeout strategy. The total wait time is the sum of the
   * `SessionRequest` TTL (the time the user has to scan the QR code) and the
   * `HANDSHAKE_TIMEOUT` (a grace period for the dApp to resume from suspension
   * and process the historical message from the relay).
   *
   * @param requestExpiry - The timestamp when the session request expires.
   * @returns A promise that resolves with the `HandshakeOfferPayload`.
   * @throws {SessionError} If the offer is not received before the combined timeout expires.
   */
  _waitForHandshakeOffer(requestExpiry) {
    return new Promise((resolve, reject) => {
      if (requestExpiry < Date.now()) {
        return reject(new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.REQUEST_EXPIRED, "Session request expired before wallet could connect"));
      }
      const timeoutDuration = requestExpiry + HANDSHAKE_TIMEOUT - Date.now();
      const timeoutId = setTimeout(() => {
        this.context.off("handshake_offer_received", onOfferReceived);
        reject(new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.REQUEST_EXPIRED, "Did not receive handshake offer from wallet in time."));
      }, timeoutDuration);
      const onOfferReceived = (payload) => {
        clearTimeout(timeoutId);
        resolve(payload);
      };
      this.context.once("handshake_offer_received", onOfferReceived);
    });
  }
  /**
   * Creates the final session object with details from the wallet's offer.
   *
   * @param session - The pending session object (with temporary values)
   * @param offer - The handshake offer payload from the wallet
   * @returns The complete session object ready for use
   */
  _createFinalSession(session, offer) {
    const theirPublicKey = _utils.base64ToBytes.call(void 0, offer.publicKeyB64);
    this.context.keymanager.validatePeerKey(theirPublicKey);
    return {
      ...session,
      channel: `session:${offer.channelId}`,
      theirPublicKey
    };
  }
  /**
   * Completes the connection by persisting the session, cleaning up the
   * temporary handshake channel, and transitioning to the `CONNECTED` state.
   *
   * @param session - The finalized session object
   * @param request - The session request object
   */
  async _finalizeConnection(session, request) {
    if (!this.context.session) throw new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.SESSION_INVALID_STATE);
    await this.context.sessionstore.set(this.context.session);
    await this.context.transport.subscribe(session.channel);
    await this.context.transport.clear(request.channel);
    this.context.state = _mobilewalletprotocolcore.ClientState.CONNECTED;
    this.context.emit("connected");
  }
};

// src/handlers/untrusted-connection-handler.ts


var UntrustedConnectionHandler = (_class = class {
  
  __init() {this.otpAttempts = 3}
  __init2() {this.timeoutId = null}
  constructor(context) {;_class.prototype.__init.call(this);_class.prototype.__init2.call(this);
    this.context = context;
  }
  /**
   * Executes the complete untrusted connection flow.
   * This method is fully self-contained and handles the entire OTP-based connection process.
   */
  async execute(session, request) {
    await this.context.transport.connect();
    await this.context.transport.subscribe(request.channel);
    const offer = await this._waitForHandshakeOffer(request.expiresAt);
    await this._handleOtpInput(offer);
    const finalSession = this._createFinalSession(session, offer);
    this.context.session = finalSession;
    await this._acknowledgeHandshake(finalSession);
    await this._finalizeConnection(request.channel);
  }
  /**
   * Waits for a `handshake-offer` message from the wallet on the handshake channel.
   *
   * @param requestExpiry - The timestamp when the session request expires
   * @returns A promise that resolves with the `HandshakeOfferPayload`
   * @throws {SessionError} If the offer is not received before the request expires
   */
  _waitForHandshakeOffer(requestExpiry) {
    return new Promise((resolve, reject) => {
      const timeoutDuration = requestExpiry - Date.now();
      if (timeoutDuration <= 0) {
        return reject(new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.REQUEST_EXPIRED, "Session request expired before wallet could connect."));
      }
      this.timeoutId = setTimeout(() => {
        this.context.off("handshake_offer_received", onOfferReceived);
        reject(new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.REQUEST_EXPIRED, "Did not receive handshake offer from wallet in time."));
      }, timeoutDuration);
      const onOfferReceived = (payload) => {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = null;
        resolve(payload);
      };
      this.context.once("handshake_offer_received", onOfferReceived);
    });
  }
  /**
   * Manages the OTP verification step by emitting the `otp_required` event and
   * waiting for the user to submit the correct OTP.
   *
   * @param offer - The handshake offer from the wallet containing the OTP
   * @throws {SessionError} If the OTP is incorrect after max attempts, the OTP expires,
   * or the user cancels
   */
  _handleOtpInput(offer) {
    return new Promise((resolve, reject) => {
      if (!offer.deadline || !offer.otp) {
        return reject(new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.UNKNOWN, "Handshake offer is missing OTP details for untrusted connection."));
      }
      if (Date.now() > offer.deadline) {
        return reject(new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.OTP_ENTRY_TIMEOUT, "The OTP has already expired."));
      }
      const expectedOtp = offer.otp;
      let attempts = 0;
      const submit = async (otp) => {
        if (!_mobilewalletprotocolcore.timingSafeEqual.call(void 0, otp, expectedOtp)) {
          attempts++;
          if (attempts >= this.otpAttempts) {
            reject(new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.OTP_MAX_ATTEMPTS_REACHED, "Maximum OTP attempts reached."));
          } else {
            throw new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.OTP_INCORRECT, `Incorrect OTP. ${this.otpAttempts - attempts} attempts remaining.`);
          }
          return;
        }
        resolve();
      };
      const cancel = () => reject(new Error("User cancelled OTP entry."));
      this.context.emit("otp_required", { submit, cancel, deadline: offer.deadline });
    });
  }
  /**
   * Creates the final session object with details from the wallet's offer.
   *
   * @param session - The pending session object (with temporary values)
   * @param offer - The handshake offer payload from the wallet
   * @returns The complete session object ready for use
   */
  _createFinalSession(session, offer) {
    const theirPublicKey = _utils.base64ToBytes.call(void 0, offer.publicKeyB64);
    this.context.keymanager.validatePeerKey(theirPublicKey);
    return {
      ...session,
      channel: `session:${offer.channelId}`,
      theirPublicKey
    };
  }
  /**
   * Subscribes to the secure session channel and sends handshake acknowledgment.
   *
   * @param session - The finalized session object
   */
  async _acknowledgeHandshake(session) {
    await this.context.transport.subscribe(session.channel);
    await this.context.sendMessage(session.channel, { type: "handshake-ack" });
  }
  /**
   * Completes the connection by persisting the session, cleaning up the
   * temporary handshake channel, and transitioning to the `CONNECTED` state.
   *
   * @param handshakeChannel - The temporary channel used for the initial handshake
   */
  async _finalizeConnection(handshakeChannel) {
    if (!this.context.session) throw new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.SESSION_INVALID_STATE);
    await this.context.sessionstore.set(this.context.session);
    await this.context.transport.clear(handshakeChannel);
    this.context.state = _mobilewalletprotocolcore.ClientState.CONNECTED;
    this.context.emit("connected");
  }
}, _class);

// src/client.ts
var SESSION_REQUEST_TTL = 60 * 1e3;
var HANDSHAKE_TIMEOUT = 60 * 1e3;
var DappClient = class extends _mobilewalletprotocolcore.BaseClient {
  // biome-ignore lint/suspicious/noExplicitAny: used for event emitter
  on(event, listener) {
    return super.on(event, listener);
  }
  constructor(options) {
    super(options.transport, options.keymanager, options.sessionstore);
  }
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
  async connect(options = {}) {
    if (this.state !== _mobilewalletprotocolcore.ClientState.DISCONNECTED) throw new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.SESSION_INVALID_STATE, `Cannot connect when state is ${this.state}`);
    const { mode = "untrusted", initialPayload } = options;
    if (!_mobilewalletprotocolcore.isValidConnectionMode.call(void 0, mode)) throw new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.SESSION_INVALID_STATE, `Invalid connection mode: "${String(mode)}"`);
    this.state = _mobilewalletprotocolcore.ClientState.CONNECTING;
    const { pendingSession, request } = this._createPendingSessionAndRequest(mode, initialPayload);
    this.session = pendingSession;
    this.emit("session_request", request);
    const self = this;
    const context = {
      transport: this.transport,
      sessionstore: this.sessionstore,
      keymanager: this.keymanager,
      get session() {
        return self.session;
      },
      set session(session) {
        self.session = session;
      },
      get state() {
        return self.state;
      },
      set state(state) {
        self.state = state;
      },
      emit: this.emit.bind(this),
      once: this.once.bind(this),
      off: this.off.bind(this),
      sendMessage: this.sendMessage.bind(this)
    };
    const handler = mode === "trusted" ? new TrustedConnectionHandler(context) : new UntrustedConnectionHandler(context);
    try {
      await handler.execute(pendingSession, request);
    } catch (error) {
      this.emit("error", error);
      await this.disconnect();
      throw error;
    }
  }
  /**
   * Sends a request payload to the connected wallet.
   *
   * @param payload - The request payload to send to the wallet
   * @throws {SessionError} If the client is not in a `CONNECTED` state
   */
  async sendRequest(payload) {
    if (this.state !== _mobilewalletprotocolcore.ClientState.CONNECTED || !this.session) throw new (0, _mobilewalletprotocolcore.SessionError)(_mobilewalletprotocolcore.ErrorCode.SESSION_INVALID_STATE, "Cannot send request: not connected.");
    await this.sendMessage(this.session.channel, { type: "message", payload });
  }
  /**
   * Routes incoming messages based on the client's connection state.
   * During connection, it handles handshake messages. Once connected, it
   * handles standard application messages.
   *
   * @param message - The incoming message to handle
   */
  handleMessage(message) {
    if (this.state === _mobilewalletprotocolcore.ClientState.CONNECTING && message.type === "handshake-offer") {
      this.emit("handshake_offer_received", message.payload);
    } else if (this.state === _mobilewalletprotocolcore.ClientState.CONNECTED && message.type === "message") {
      this.emit("message", message.payload);
    }
  }
  /**
   * Creates a temporary session object and the corresponding `SessionRequest`
   * payload to be shared with the wallet.
   *
   * @param mode - The connection mode to use for this session
   * @returns An object containing the pending session and session request
   */
  _createPendingSessionAndRequest(mode, initialPayload) {
    const id = _uuid.v4.call(void 0, );
    const keyPair = this.keymanager.generateKeyPair();
    const pendingSession = {
      id,
      channel: "",
      // To be determined by the wallet's handshake offer
      keyPair,
      theirPublicKey: new Uint8Array(0),
      // Placeholder, will be updated
      expiresAt: Date.now() + _mobilewalletprotocolcore.DEFAULT_SESSION_TTL
    };
    const message = initialPayload ? { type: "message", payload: initialPayload } : void 0;
    const request = {
      id,
      mode,
      channel: `handshake:${id}`,
      publicKeyB64: _utils.bytesToBase64.call(void 0, keyPair.publicKey),
      expiresAt: Date.now() + SESSION_REQUEST_TTL,
      initialMessage: message
    };
    return { pendingSession, request };
  }
};


exports.DappClient = DappClient;
