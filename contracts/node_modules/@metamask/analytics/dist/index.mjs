// src/analytics.ts
import createClient from "openapi-fetch";

// src/sender.ts
var Sender = class {
  sendFn;
  batch = [];
  batchSize;
  baseTimeoutMs;
  currentTimeoutMs;
  maxTimeoutMs = 3e4;
  timeoutId = null;
  isSending = false;
  constructor(options) {
    this.batchSize = options.batchSize;
    this.baseTimeoutMs = options.baseTimeoutMs;
    this.currentTimeoutMs = options.baseTimeoutMs;
    this.sendFn = options.sendFn;
  }
  enqueue(item) {
    this.batch.push(item);
    this.schedule();
  }
  schedule() {
    if (this.batch.length > 0 && !this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.timeoutId = null;
        this.flush();
      }, this.currentTimeoutMs);
    }
  }
  async flush() {
    if (this.isSending || this.batch.length === 0) {
      return;
    }
    this.isSending = true;
    const current = [...this.batch.slice(0, this.batchSize)];
    this.batch = this.batch.slice(this.batchSize);
    try {
      await this.sendFn(current);
      this.currentTimeoutMs = this.baseTimeoutMs;
    } catch (error) {
      console.error("Sender: Failed to send batch", error);
      this.batch = [...current, ...this.batch];
      this.currentTimeoutMs = Math.min(
        this.currentTimeoutMs * 2,
        this.maxTimeoutMs
      );
    } finally {
      this.isSending = false;
      this.schedule();
    }
  }
};
var sender_default = Sender;

// src/analytics.ts
var Analytics = class {
  enabled = false;
  sender;
  properties = {};
  constructor(baseUrl) {
    const client2 = createClient({ baseUrl });
    const sendFn = async (batch) => {
      const res = await client2.POST("/v2/events", { body: batch });
      if (res.response.status !== 200) {
        throw new Error(res.error);
      }
    };
    this.sender = new sender_default({ batchSize: 100, baseTimeoutMs: 200, sendFn });
  }
  enable() {
    this.enabled = true;
  }
  setGlobalProperty(key, value) {
    if (key === "integration_types") {
      const existing = Array.isArray(this.properties.integration_types) ? this.properties.integration_types : [];
      const incoming = Array.isArray(value) ? value : [];
      this.properties.integration_types = [
        .../* @__PURE__ */ new Set([...existing, ...incoming])
      ];
      return;
    }
    this.properties[key] = value;
  }
  track(eventName, properties) {
    if (!this.enabled) {
      return;
    }
    const event = {
      namespace: "metamask/connect",
      event_name: eventName,
      properties: { ...properties, ...this.properties }
    };
    this.sender.enqueue(event);
  }
};
var analytics_default = Analytics;

// src/index.ts
var endpoint;
if (typeof process !== "undefined" && process.env) {
  endpoint = process.env.METAMASK_ANALYTICS_ENDPOINT ?? process.env.NEXT_PUBLIC_METAMASK_ANALYTICS_ENDPOINT;
}
var METAMASK_ANALYTICS_ENDPOINT = endpoint ?? "https://mm-sdk-analytics.api.cx.metamask.io/";
var client = new analytics_default(METAMASK_ANALYTICS_ENDPOINT);
var analytics = client;
export {
  analytics
};
