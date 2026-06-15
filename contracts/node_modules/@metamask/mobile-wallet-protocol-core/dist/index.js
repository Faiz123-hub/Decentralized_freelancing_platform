"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class; var _class2; var _class3; var _class4; var _class5;// src/base-client.ts
var _eventemitter3 = require('eventemitter3'); var _eventemitter32 = _interopRequireDefault(_eventemitter3);

// src/domain/client-state.ts
var ClientState = /* @__PURE__ */ ((ClientState2) => {
  ClientState2["DISCONNECTED"] = "DISCONNECTED";
  ClientState2["CONNECTING"] = "CONNECTING";
  ClientState2["CONNECTED"] = "CONNECTED";
  return ClientState2;
})(ClientState || {});

// src/domain/errors.ts
var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
  ErrorCode2["SESSION_EXPIRED"] = "SESSION_EXPIRED";
  ErrorCode2["SESSION_NOT_FOUND"] = "SESSION_NOT_FOUND";
  ErrorCode2["SESSION_INVALID_STATE"] = "SESSION_INVALID_STATE";
  ErrorCode2["SESSION_SAVE_FAILED"] = "SESSION_SAVE_FAILED";
  ErrorCode2["TRANSPORT_DISCONNECTED"] = "TRANSPORT_DISCONNECTED";
  ErrorCode2["TRANSPORT_PUBLISH_FAILED"] = "TRANSPORT_PUBLISH_FAILED";
  ErrorCode2["TRANSPORT_SUBSCRIBE_FAILED"] = "TRANSPORT_SUBSCRIBE_FAILED";
  ErrorCode2["TRANSPORT_HISTORY_FAILED"] = "TRANSPORT_HISTORY_FAILED";
  ErrorCode2["TRANSPORT_PARSE_FAILED"] = "TRANSPORT_PARSE_FAILED";
  ErrorCode2["TRANSPORT_RECONNECT_FAILED"] = "TRANSPORT_RECONNECT_FAILED";
  ErrorCode2["DECRYPTION_FAILED"] = "DECRYPTION_FAILED";
  ErrorCode2["INVALID_KEY"] = "INVALID_KEY";
  ErrorCode2["REQUEST_EXPIRED"] = "REQUEST_EXPIRED";
  ErrorCode2["OTP_INCORRECT"] = "OTP_INCORRECT";
  ErrorCode2["OTP_MAX_ATTEMPTS_REACHED"] = "OTP_MAX_ATTEMPTS_REACHED";
  ErrorCode2["OTP_ENTRY_TIMEOUT"] = "OTP_ENTRY_TIMEOUT";
  ErrorCode2["UNKNOWN"] = "UNKNOWN";
  return ErrorCode2;
})(ErrorCode || {});
var ProtocolError = class extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
    this.name = code;
  }
};
var SessionError = class extends ProtocolError {
};
var TransportError = class extends ProtocolError {
};
var CryptoError = class extends ProtocolError {
};

// src/base-client.ts
var BaseClient = (_class = class extends _eventemitter32.default {
  
  
  
  __init() {this.session = null}
  __init2() {this._state = "DISCONNECTED"} /* DISCONNECTED */
  // biome-ignore lint/suspicious/noExplicitAny: used for event listeners
  on(event, listener) {
    return super.on(event, listener);
  }
  /**
   * Initializes the BaseClient with its core dependencies.
   *
   * @param transport - The transport layer for communication.
   * @param keymanager - The key manager for cryptographic operations.
   * @param sessionstore - The persistent store for session management.
   */
  constructor(transport, keymanager, sessionstore) {
    super();_class.prototype.__init.call(this);_class.prototype.__init2.call(this);;
    this.transport = transport;
    this.keymanager = keymanager;
    this.sessionstore = sessionstore;
    this.transport.on("error", (error) => this.emit("error", error));
    this.transport.on("message", async (payload) => {
      if (!_optionalChain([this, 'access', _ => _.session, 'optionalAccess', _2 => _2.keyPair, 'access', _3 => _3.privateKey])) return;
      if (await this.checkSessionExpiry()) {
        this.emit("error", new SessionError("SESSION_EXPIRED" /* SESSION_EXPIRED */, "Session expired"));
        return;
      }
      const message = await this.decryptMessage(payload.data);
      if (message) this.handleMessage(message);
    });
  }
  get state() {
    return this._state;
  }
  set state(state) {
    this._state = state;
  }
  /**
   * Proactively refreshes the underlying transport connection.
   * This is the recommended method for mobile clients to call when the application
   * returns to the foreground to ensure the connection is not stale.
   */
  async reconnect() {
    if (this.state === "CONNECTING" /* CONNECTING */ || !this.session || !this.transport.reconnect) return;
    try {
      this.state = "CONNECTING" /* CONNECTING */;
      await this.transport.reconnect();
      this.state = "CONNECTED" /* CONNECTED */;
      this.emit("connected");
    } catch (e) {
      this.state = "DISCONNECTED" /* DISCONNECTED */;
      throw new TransportError("TRANSPORT_RECONNECT_FAILED" /* TRANSPORT_RECONNECT_FAILED */, "Failed to reconnect");
    }
  }
  /**
   * Resumes an existing session by loading it from storage and connecting to the
   * transport on the session's secure channel.
   *
   * @param sessionId - The ID of the session to resume.
   * @throws {SessionError} If the session is not found, has expired, or the client
   * is not in a `DISCONNECTED` state.
   */
  async resume(sessionId) {
    if (this.state !== "DISCONNECTED" /* DISCONNECTED */) throw new SessionError("SESSION_INVALID_STATE" /* SESSION_INVALID_STATE */, `Cannot resume when state is ${this.state}`);
    this.state = "CONNECTING" /* CONNECTING */;
    try {
      const session = await this.sessionstore.get(sessionId);
      if (!session) throw new SessionError("SESSION_NOT_FOUND" /* SESSION_NOT_FOUND */, "Session not found or expired");
      this.keymanager.validatePeerKey(session.theirPublicKey);
      this.session = session;
      await this.transport.connect();
      await this.transport.subscribe(session.channel);
      this.state = "CONNECTED" /* CONNECTED */;
      this.emit("connected");
    } catch (error) {
      this.state = "DISCONNECTED" /* DISCONNECTED */;
      this.session = null;
      throw error;
    }
  }
  /**
   * Disconnects the client, clears the active session from memory and persistent
   * storage, and cleans up the transport channel. Emits a 'disconnected' event.
   */
  async disconnect() {
    if (!this.session) return;
    const session = this.session;
    this.session = null;
    this.state = "DISCONNECTED" /* DISCONNECTED */;
    await this.transport.disconnect();
    await this.transport.clear(session.channel);
    await this.sessionstore.delete(session.id);
    this.emit("disconnected");
  }
  /**
   * Encrypts and sends a protocol message to a specified channel.
   * Automatically checks for session expiry before sending.
   *
   * @param channel - The communication channel to publish the message on.
   * @param message - The protocol message to send.
   * @throws {SessionError} If the client session is not initialized or is expired.
   * @throws {TransportError} If the message fails to send due to a transport issue.
   */
  async sendMessage(channel, message) {
    if (!this.session) throw new SessionError("SESSION_INVALID_STATE" /* SESSION_INVALID_STATE */, "Cannot send message: session is not initialized.");
    if (await this.checkSessionExpiry()) throw new SessionError("SESSION_EXPIRED" /* SESSION_EXPIRED */, "Session expired");
    const plaintext = JSON.stringify(message);
    const encrypted = await this.keymanager.encrypt(plaintext, this.session.theirPublicKey);
    const ok = await this.transport.publish(channel, encrypted);
    if (!ok) throw new TransportError("TRANSPORT_DISCONNECTED" /* TRANSPORT_DISCONNECTED */, "Message could not be sent because the transport is disconnected.");
  }
  /**
   * Checks if the current session has expired. If so, triggers a disconnect.
   *
   * @returns true if the session was expired (and cleanup was triggered), false otherwise.
   */
  async checkSessionExpiry() {
    if (!this.session || this.session.expiresAt >= Date.now()) return false;
    await this.disconnect();
    return true;
  }
  /**
   * Decrypts an incoming message payload.
   *
   * @param encrypted - The base64-encoded encrypted payload.
   * @returns The parsed `ProtocolMessage`, or `null` if decryption fails.
   * On failure, it emits a `CryptoError`.
   */
  async decryptMessage(encrypted) {
    if (!_optionalChain([this, 'access', _4 => _4.session, 'optionalAccess', _5 => _5.keyPair, 'access', _6 => _6.privateKey])) return null;
    try {
      const decrypted = await this.keymanager.decrypt(encrypted, this.session.keyPair.privateKey);
      return JSON.parse(decrypted);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.emit("error", new CryptoError("DECRYPTION_FAILED" /* DECRYPTION_FAILED */, `Decryption failed: ${msg}`));
      return null;
    }
  }
}, _class);

// src/domain/connection-mode.ts
var CONNECTION_MODES = ["trusted", "untrusted"];
function isValidConnectionMode(value) {
  return typeof value === "string" && CONNECTION_MODES.includes(value);
}

// src/session-store/index.ts
var _asyncmutex = require('async-mutex');
var DEFAULT_SESSION_TTL = 30 * 24 * 60 * 60 * 1e3;
var SessionStore = (_class2 = class _SessionStore {
  static __initStatic() {this.SESSION_PREFIX = "session:"}
  static __initStatic2() {this.MASTER_LIST_KEY = "sessions:master-list"}
  
  __init3() {this.mutex = new (0, _asyncmutex.Mutex)()}
  /**
   * Creates a new SessionStore instance and runs initial garbage collection.
   * Use this instead of the constructor to ensure GC completes before use.
   */
  static async create(kvstore) {
    const store = new _SessionStore(kvstore);
    await store.garbageCollect();
    return store;
  }
  constructor(kvstore) {;_class2.prototype.__init3.call(this);
    this.kvstore = kvstore;
  }
  /**
   * Sets a session in the store.
   * @param session - The session to set.
   */
  async set(session) {
    if (Number.isNaN(session.expiresAt) || session.expiresAt < Date.now()) {
      throw new SessionError("SESSION_SAVE_FAILED" /* SESSION_SAVE_FAILED */, "Cannot save expired session");
    }
    const data = {
      id: session.id,
      channel: session.channel,
      keyPair: {
        publicKeyB64: Buffer.from(session.keyPair.publicKey).toString("base64"),
        privateKeyB64: Buffer.from(session.keyPair.privateKey).toString("base64")
      },
      theirPublicKeyB64: Buffer.from(session.theirPublicKey).toString("base64"),
      expiresAt: session.expiresAt
    };
    const key = this.getSessionKey(session.id);
    await this.kvstore.set(key, JSON.stringify(data));
    await this.addToMasterList(session.id);
  }
  /**
   * Gets a session from the store.
   * @param id - The ID of the session to get.
   * @returns The session if it exists, otherwise null.
   */
  async get(id) {
    const key = this.getSessionKey(id);
    const raw = await this.kvstore.get(key);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (typeof data.expiresAt !== "number" || !(data.expiresAt >= Date.now())) {
        await this.delete(id);
        return null;
      }
      const session = {
        id: data.id,
        channel: data.channel,
        keyPair: {
          publicKey: new Uint8Array(Buffer.from(data.keyPair.publicKeyB64, "base64")),
          privateKey: new Uint8Array(Buffer.from(data.keyPair.privateKeyB64, "base64"))
        },
        theirPublicKey: new Uint8Array(Buffer.from(data.theirPublicKeyB64, "base64")),
        expiresAt: data.expiresAt
      };
      return session;
    } catch (e2) {
      await this.delete(id);
      return null;
    }
  }
  /**
   * Lists all sessions in the store.
   * @returns A list of all sessions.
   */
  async list() {
    const ids = await this.getMasterList();
    const sessions = [];
    for (const id of ids) {
      const session = await this.get(id);
      if (session) sessions.push(session);
    }
    return sessions;
  }
  /**
   * Deletes a session from the store.
   * @param id - The ID of the session to delete.
   */
  async delete(id) {
    const key = this.getSessionKey(id);
    await this.kvstore.delete(key);
    await this.removeFromMasterList(id);
  }
  /**
   * Garbage collects expired sessions.
   */
  async garbageCollect() {
    const list = await this.getMasterList();
    await Promise.all(list.map(async (id) => this.get(id)));
  }
  /**
   * Gets the key for a session.
   * @param id - The ID of the session.
   * @returns The key for the session.
   */
  getSessionKey(id) {
    return `${_SessionStore.SESSION_PREFIX}${id}`;
  }
  /**
   * Gets the master list of session IDs.
   * @returns The master list of session IDs.
   */
  async getMasterList() {
    const raw = await this.kvstore.get(_SessionStore.MASTER_LIST_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e3) {
      return [];
    }
  }
  /**
   * Adds a session ID to the master list.
   * @param id - The ID of the session to add.
   */
  async addToMasterList(id) {
    await this.mutex.runExclusive(async () => {
      const list = await this.getMasterList();
      if (!list.includes(id)) {
        list.push(id);
        await this.kvstore.set(_SessionStore.MASTER_LIST_KEY, JSON.stringify(list));
      }
    });
  }
  /**
   * Removes a session ID from the master list.
   * @param id - The ID of the session to remove.
   */
  async removeFromMasterList(id) {
    await this.mutex.runExclusive(async () => {
      const list = await this.getMasterList();
      const filtered = list.filter((sessionId) => sessionId !== id);
      await this.kvstore.set(_SessionStore.MASTER_LIST_KEY, JSON.stringify(filtered));
    });
  }
}, _class2.__initStatic(), _class2.__initStatic2(), _class2);

// src/transport/websocket/index.ts
var _centrifuge = require('centrifuge');


// src/utils/retry.ts
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function retry(fn, options) {
  for (let attempt = 0; attempt < options.attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.attempts - 1) {
        throw error;
      }
      const backoff = options.delay * 2 ** attempt;
      await delay(backoff);
    }
  }
  throw new ProtocolError("UNKNOWN" /* UNKNOWN */, "Retry logic failed unexpectedly.");
}

// src/transport/websocket/shared-centrifuge.ts




var SubscriptionProxy = (_class3 = class {
  constructor(realSub, parent) {;_class3.prototype.__init4.call(this);
    this.realSub = realSub;
    this.parent = parent;
  }
  __init4() {this.hasUnsubscribed = false}
  get channel() {
    return this.realSub.channel;
  }
  get state() {
    return this.realSub.state;
  }
  subscribe() {
    this.realSub.subscribe();
  }
  unsubscribe() {
    if (this.hasUnsubscribed) return;
    this.hasUnsubscribed = true;
    this.parent.removeSubscription({ channel: this.channel });
  }
  // biome-ignore lint/suspicious/noExplicitAny: to match centrifuge-js interface
  async publish(data) {
    return await this.realSub.publish(data);
  }
  history(options) {
    return this.realSub.history(options);
  }
  on(event, listener) {
    this.realSub.on(event, listener);
    return this;
  }
  once(event, listener) {
    this.realSub.once(event, listener);
    return this;
  }
  off(event, listener) {
    this.realSub.off(event, listener);
    return this;
  }
}, _class3);
var SharedCentrifuge = (_class4 = class _SharedCentrifuge extends _eventemitter32.default {
  /**
   * Global contexts shared across all SharedCentrifuge instances.
   */
  static __initStatic3() {this.contexts = /* @__PURE__ */ new Map()}
  /**
   * Per Instance variables.
   */
  
  __init5() {this.channels = /* @__PURE__ */ new Set()}
  __init6() {this.disconnected = false}
  __init7() {this.eventListeners = /* @__PURE__ */ new Map()}
  constructor(url, opts = {}) {
    super();_class4.prototype.__init5.call(this);_class4.prototype.__init6.call(this);_class4.prototype.__init7.call(this);;
    this.url = url;
    if (!_SharedCentrifuge.contexts.has(url)) {
      const centrifuge = new (0, _centrifuge.Centrifuge)(url, opts);
      _SharedCentrifuge.contexts.set(url, {
        refcount: 0,
        options: opts,
        centrifuge,
        subscriptions: /* @__PURE__ */ new Map(),
        reconnectPromise: null
      });
    } else {
      const context2 = _SharedCentrifuge.contexts.get(url);
      if (!context2) throw new Error("No context found");
      this.validateOptions(context2.options, opts);
    }
    const context = _SharedCentrifuge.contexts.get(url);
    if (!context) throw new Error("No context found");
    context.refcount++;
    this.attachEventListeners();
  }
  /**
   * Connect to the Centrifuge server.
   */
  connect() {
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) return;
    if (context.centrifuge.state === "connected") {
      setImmediate(() => this.emit("connected", {}));
    } else if (context.centrifuge.state === "connecting") {
    } else {
      context.centrifuge.connect();
    }
  }
  /**
   * Disconnect from the Centrifuge server.
   */
  disconnect() {
    if (this.disconnected) return Promise.resolve();
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) return Promise.resolve();
    this.disconnected = true;
    this.emit("disconnected", {});
    this.detachEventListeners();
    for (const channel of this.channels) this.decrementChannelRef(channel);
    this.channels.clear();
    context.refcount--;
    if (context.refcount === 0) {
      return new Promise((resolve) => {
        context.centrifuge.once("disconnected", () => {
          _SharedCentrifuge.contexts.delete(this.url);
          resolve();
        });
        context.centrifuge.disconnect();
      });
    }
    return Promise.resolve();
  }
  /**
   * Disconnect and immediately reconnect the underlying Centrifuge client.
   * This method is idempotent: if a reconnect is already in progress,
   * subsequent calls will return the promise for the ongoing operation.
   * This ensures that multiple simultaneous reconnect calls don't cause
   * race conditions or connection storms.
   */
  reconnect() {
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) {
      return Promise.resolve();
    }
    if (context.reconnectPromise) {
      return context.reconnectPromise;
    }
    context.reconnectPromise = (async () => {
      try {
        if (context.centrifuge.state !== "disconnected") {
          await new Promise((resolve) => {
            context.centrifuge.once("disconnected", () => resolve());
            context.centrifuge.disconnect();
          });
        }
        await new Promise((resolve, reject) => {
          context.centrifuge.once("connected", () => resolve());
          context.centrifuge.once("error", (ctx) => reject(ctx.error));
          context.centrifuge.connect();
        });
      } finally {
        context.reconnectPromise = null;
      }
    })();
    return context.reconnectPromise;
  }
  /**
   * Create or get an existing subscription to a channel.
   * Returns a subscription proxy that manages the subscription lifecycle
   * and ensures proper reference counting for resource cleanup.
   */
  newSubscription(channel, opts = {}) {
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) throw new Error("No context found");
    const subs = context.subscriptions;
    if (!this.channels.has(channel)) {
      if (!subs.has(channel)) {
        const realSub = context.centrifuge.newSubscription(channel, opts);
        subs.set(channel, { count: 1, sub: realSub });
      } else {
        const subInfo2 = subs.get(channel);
        if (!subInfo2) throw new Error(`Failed to get subscription info for channel ${channel}`);
        subInfo2.count++;
      }
    }
    this.channels.add(channel);
    const subInfo = subs.get(channel);
    if (!subInfo) throw new Error(`Failed to create or get subscription for channel ${channel}`);
    return new SubscriptionProxy(subInfo.sub, this);
  }
  /**
   * Get an existing subscription to a channel if this instance has subscribed to it.
   * Returns undefined if this instance hasn't subscribed to the channel yet.
   */
  getSubscription(channel) {
    if (!this.channels.has(channel)) {
      return void 0;
    }
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) return void 0;
    const subInfo = context.subscriptions.get(channel);
    return subInfo ? new SubscriptionProxy(subInfo.sub, this) : void 0;
  }
  /**
   * Publish data to a channel.
   */
  async publish(channel, data) {
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) return;
    await context.centrifuge.publish(channel, data);
  }
  /**
   * Get all current subscriptions as proxied objects for this instance only.
   */
  subscriptions() {
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) return {};
    const proxiedSubs = {};
    for (const channel of this.channels) {
      const subInfo = context.subscriptions.get(channel);
      if (subInfo) {
        proxiedSubs[channel] = new SubscriptionProxy(subInfo.sub, this);
      }
    }
    return proxiedSubs;
  }
  /**
   * Get the underlying Centrifuge instance (for testing purposes).
   */
  get real() {
    const context = _SharedCentrifuge.contexts.get(this.url);
    return _optionalChain([context, 'optionalAccess', _7 => _7.centrifuge]);
  }
  /**
   * Get the current connection state. Returns "disconnected" if this instance has been disconnected.
   */
  get state() {
    if (this.disconnected) return "disconnected";
    const context = _SharedCentrifuge.contexts.get(this.url);
    return _nullishCoalesce(_optionalChain([context, 'optionalAccess', _8 => _8.centrifuge, 'access', _9 => _9.state]), () => ( "disconnected"));
  }
  /**
   * Attach event listeners for this specific instance.
   */
  attachEventListeners() {
    if (this.eventListeners.size > 0) return;
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) return;
    const events = ["connecting", "connected", "disconnected", "error"];
    events.forEach((event) => {
      const listener = (ctx) => {
        if (!this.disconnected) this.emit(event, ctx);
      };
      this.eventListeners.set(event, listener);
      context.centrifuge.on(event, listener);
    });
  }
  /**
   * Decrement the reference count for a channel subscription.
   */
  decrementChannelRef(channel) {
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) return;
    const subs = context.subscriptions;
    const subInfo = subs.get(channel);
    if (!subInfo) return;
    subInfo.count--;
    if (subInfo.count === 0) {
      subInfo.sub.unsubscribe();
      context.centrifuge.removeSubscription(subInfo.sub);
      subs.delete(channel);
    }
  }
  /**
   * Detach event listeners for this specific instance.
   */
  detachEventListeners() {
    const context = _SharedCentrifuge.contexts.get(this.url);
    if (!context) return;
    for (const [event, listener] of this.eventListeners) {
      context.centrifuge.off(event, listener);
    }
    this.eventListeners.clear();
  }
  /**
   * Validate that provided options match the existing shared state's options.
   */
  validateOptions(existingOpts, newOpts) {
    const criticalKeys = ["token", "websocket", "minReconnectDelay", "maxReconnectDelay"];
    for (const key of criticalKeys) {
      const existing = existingOpts[key];
      const incoming = newOpts[key];
      if (existing !== void 0 && incoming !== void 0 && existing !== incoming) {
        console.warn(`SharedCentrifuge: Option '${key}' mismatch for URL ${this.url}. Using existing value: ${existing}, ignoring new value: ${incoming}`);
      }
    }
  }
  /**
   * Remove a subscription, cleaning up resources if no instances are using it.
   * This decrements reference counts and removes subscriptions when they
   * reach zero references across all instances.
   */
  removeSubscription(sub) {
    if (!sub || !("channel" in sub)) return;
    this.decrementChannelRef(sub.channel);
    this.channels.delete(sub.channel);
  }
}, _class4.__initStatic3(), _class4);

// src/transport/websocket/store.ts
var _uuid = require('uuid');
var WebSocketTransportStorage = class _WebSocketTransportStorage {
  
  
  /**
   * Creates a new WebSocketTransportStorage instance with a persistent client ID.
   * If no client ID exists in storage, generates and persists a new one.
   */
  static async create(kvstore) {
    const clientIdKey = _WebSocketTransportStorage.getClientIdKey();
    let clientId = await kvstore.get(clientIdKey);
    if (!clientId) {
      clientId = _uuid.v4.call(void 0, );
      await kvstore.set(clientIdKey, clientId);
    }
    return new _WebSocketTransportStorage(kvstore, clientId);
  }
  constructor(kvstore, clientId) {
    this.kvstore = kvstore;
    this.clientId = clientId;
  }
  /**
   * Returns the persistent client ID for this transport.
   */
  getClientId() {
    return this.clientId;
  }
  /**
   * Gets the next nonce for publishing a message on the specified channel.
   * Increments and persists the nonce counter for this client and channel.
   */
  async getNextNonce(channel) {
    const key = this.getNonceKey(channel);
    const value = await this.kvstore.get(key);
    const currentNonce = value ? parseInt(value, 10) : 0;
    const nextNonce = currentNonce + 1;
    await this.kvstore.set(key, nextNonce.toString());
    return nextNonce;
  }
  /**
   * Retrieves the latest received nonces from all senders on the specified channel.
   * Used for message deduplication - only messages with nonces greater than the
   * latest seen nonce from each sender are processed.
   */
  async getLatestNonces(channel) {
    const key = this.getLatestNoncesKey(channel);
    const value = await this.kvstore.get(key);
    if (value) {
      const parsed = JSON.parse(value);
      return new Map(Object.entries(parsed));
    }
    return /* @__PURE__ */ new Map();
  }
  /**
   * Updates the latest received nonces from all senders on the specified channel.
   * This is used to track the highest nonce seen from each sender for deduplication.
   */
  async setLatestNonces(channel, nonces) {
    const key = this.getLatestNoncesKey(channel);
    const obj = Object.fromEntries(nonces);
    await this.kvstore.set(key, JSON.stringify(obj));
  }
  /**
   * Clears the storage for a given channel.
   */
  async clear(channel) {
    const nonceKey = this.getNonceKey(channel);
    const latestNoncesKey = this.getLatestNoncesKey(channel);
    await Promise.all([this.kvstore.delete(nonceKey), this.kvstore.delete(latestNoncesKey)]);
  }
  /**
   * Returns the key used to store the client ID.
   */
  static getClientIdKey() {
    return "websocket-transport-client-id";
  }
  /**
   * Returns the key used to store the nonce counter for a specific channel.
   */
  getNonceKey(channel) {
    return `nonce:${this.clientId}:${channel}`;
  }
  /**
   * Returns the key used to store the latest nonces for a specific channel.
   */
  getLatestNoncesKey(channel) {
    return `latest-nonces:${this.clientId}:${channel}`;
  }
};

// src/transport/websocket/index.ts
var HISTORY_FETCH_LIMIT = 50;
var MAX_RETRY_ATTEMPTS = 5;
var BASE_RETRY_DELAY = 100;
var WebSocketTransport = (_class5 = class _WebSocketTransport extends _eventemitter32.default {
  
  
  __init8() {this.queue = []}
  __init9() {this.isProcessingQueue = false}
  __init10() {this.state = "disconnected"}
  /**
   * Creates a new WebSocketTransport instance. The storage parameter must be provided
   * to enable persistence across restarts.
   */
  static async create(options) {
    const storage = await WebSocketTransportStorage.create(options.kvstore);
    return new _WebSocketTransport(storage, options);
  }
  constructor(storage, options) {
    super();_class5.prototype.__init8.call(this);_class5.prototype.__init9.call(this);_class5.prototype.__init10.call(this);;
    this.storage = storage;
    const opts = {
      minReconnectDelay: 100,
      maxReconnectDelay: 3e4
    };
    if (options.websocket !== void 0) {
      opts.websocket = options.websocket;
    }
    this.centrifuge = options.useSharedConnection ? new SharedCentrifuge(options.url, opts) : new (0, _centrifuge.Centrifuge)(options.url, opts);
    this.centrifuge.on("connecting", () => this.setState("connecting"));
    this.centrifuge.on("connected", () => {
      this.setState("connected");
      this._processQueue();
    });
    this.centrifuge.on("disconnected", () => this.setState("disconnected"));
    this.centrifuge.on("error", (ctx) => this.emit("error", new TransportError("UNKNOWN" /* UNKNOWN */, ctx.error.message)));
  }
  /**
   * Connects to the relay server.
   */
  connect() {
    if (this.state === "connected" || this.state === "connecting") {
      return Promise.resolve();
    }
    this.setState("connecting");
    return new Promise((resolve) => {
      this.centrifuge.once("connected", () => resolve());
      this.centrifuge.connect();
    });
  }
  /**
   * Disconnects from the relay server.
   */
  disconnect() {
    this.queue.forEach((msg) => msg.resolve(false));
    this.queue.length = 0;
    if (this.state === "disconnected") {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const subs = this.centrifuge.subscriptions();
      for (const sub of Object.values(subs)) {
        this.centrifuge.removeSubscription(sub);
      }
      this.centrifuge.once("disconnected", () => resolve());
      this.centrifuge.disconnect();
    });
  }
  /**
   * Disconnects and immediately reconnects the underlying Centrifuge client.
   * This is a proactive way to force a fresh connection while preserving all
   * existing subscription objects in memory, allowing for automatic recovery.
   */
  reconnect() {
    if (this.centrifuge instanceof SharedCentrifuge && "reconnect" in this.centrifuge) {
      return this.centrifuge.reconnect();
    }
    if (this.state === "connecting") {
      return new Promise((resolve) => this.centrifuge.once("connected", () => resolve()));
    }
    this.centrifuge.disconnect();
    return new Promise((resolve, reject) => {
      this.centrifuge.once("connected", () => resolve());
      this.centrifuge.once("error", (ctx) => reject(new TransportError("TRANSPORT_RECONNECT_FAILED" /* TRANSPORT_RECONNECT_FAILED */, ctx.error.message)));
      this.centrifuge.connect();
    });
  }
  /**
   * Subscribes to a channel and fetches historical messages and sends any queued messages.
   */
  subscribe(channel) {
    let sub = this.centrifuge.getSubscription(channel);
    if (!sub) {
      sub = this.centrifuge.newSubscription(channel, { recoverable: true, positioned: true });
      const _sub = sub;
      sub.on("subscribed", () => {
        this._fetchHistory(_sub, channel);
        this._processQueue();
      });
      sub.on("publication", (ctx) => {
        this._handleIncomingMessage(channel, ctx.data);
      });
      sub.on("error", (ctx) => this.emit("error", new TransportError("TRANSPORT_SUBSCRIBE_FAILED" /* TRANSPORT_SUBSCRIBE_FAILED */, `Subscription error: ${ctx.error.message}`)));
    }
    if (sub.state === "subscribed") {
      return Promise.resolve();
    }
    const subscription = sub;
    return new Promise((resolve) => {
      subscription.once("subscribed", () => resolve());
      subscription.subscribe();
    });
  }
  /**
   * Publishes a message to a channel. Returns a promise that resolves when the message is published.
   */
  publish(channel, payload) {
    const promise = new Promise((resolve, reject) => {
      this.queue.push({ channel, payload, resolve, reject });
    });
    this._processQueue();
    return promise;
  }
  /**
   * Clears the transport for a given channel.
   */
  async clear(channel) {
    await this.storage.clear(channel);
    const sub = this.centrifuge.getSubscription(channel);
    if (sub) this.centrifuge.removeSubscription(sub);
  }
  /**
   * Sets the internal state of the transport.
   */
  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this.emit(newState);
  }
  /**
   * Parses an incoming raw message, checks for duplicates, and emits it.
   */
  async _handleIncomingMessage(channel, rawData) {
    try {
      const message = JSON.parse(rawData);
      if (typeof message.clientId !== "string" || typeof message.nonce !== "number" || typeof message.payload !== "string") {
        throw new TransportError("TRANSPORT_PARSE_FAILED" /* TRANSPORT_PARSE_FAILED */, "Invalid message format");
      }
      if (message.clientId === this.storage.getClientId()) {
        return;
      }
      const latestNonces = await this.storage.getLatestNonces(channel);
      const latestNonce = latestNonces.get(message.clientId) || 0;
      if (message.nonce > latestNonce) {
        latestNonces.set(message.clientId, message.nonce);
        await this.storage.setLatestNonces(channel, latestNonces);
        this.emit("message", { channel, data: message.payload });
      }
    } catch (error) {
      this.emit("error", new TransportError("TRANSPORT_PARSE_FAILED" /* TRANSPORT_PARSE_FAILED */, `Failed to parse incoming message: ${error instanceof Error ? error.message : "Unknown error"}`));
    }
  }
  /**
   * Fetches historical messages for a channel to ensure no data is missed on first subscribe.
   */
  async _fetchHistory(sub, channel) {
    try {
      const history = await sub.history({ limit: HISTORY_FETCH_LIMIT });
      for (const pub of history.publications) {
        await this._handleIncomingMessage(channel, pub.data);
      }
    } catch (error) {
      if (_optionalChain([error, 'optionalAccess', _10 => _10.code]) === 11) return;
      this.emit("error", new TransportError("TRANSPORT_HISTORY_FAILED" /* TRANSPORT_HISTORY_FAILED */, `Failed to fetch history for channel ${channel}: ${JSON.stringify(error)}`));
    }
  }
  /**
   * Attempts to publish a single message from the queue with retry logic.
   */
  async _process(item) {
    const clientId = this.storage.getClientId();
    const nonce = await this.storage.getNextNonce(item.channel);
    const message = { clientId, nonce, payload: item.payload };
    const data = JSON.stringify(message);
    const publishFn = async () => {
      await this.centrifuge.publish(item.channel, data);
    };
    return retry(publishFn, { attempts: MAX_RETRY_ATTEMPTS, delay: BASE_RETRY_DELAY });
  }
  /**
   * Processes the outgoing message queue serially.
   */
  async _processQueue() {
    if (this.isProcessingQueue || this.state !== "connected") {
      return;
    }
    this.isProcessingQueue = true;
    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        try {
          await this._process(item);
          this.queue.shift();
          item.resolve(true);
        } catch (error) {
          this.queue.shift();
          item.reject(error instanceof Error ? error : new TransportError("TRANSPORT_PUBLISH_FAILED" /* TRANSPORT_PUBLISH_FAILED */, "Failed to publish message after all retries"));
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }
}, _class5);

// src/utils/timing-safe-equal.ts
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}














exports.BaseClient = BaseClient; exports.CONNECTION_MODES = CONNECTION_MODES; exports.ClientState = ClientState; exports.CryptoError = CryptoError; exports.DEFAULT_SESSION_TTL = DEFAULT_SESSION_TTL; exports.ErrorCode = ErrorCode; exports.ProtocolError = ProtocolError; exports.SessionError = SessionError; exports.SessionStore = SessionStore; exports.TransportError = TransportError; exports.WebSocketTransport = WebSocketTransport; exports.isValidConnectionMode = isValidConnectionMode; exports.timingSafeEqual = timingSafeEqual;
