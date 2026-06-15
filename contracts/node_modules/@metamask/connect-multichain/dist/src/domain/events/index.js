var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _EventEmitter_emitter;
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { EventEmitter as EventEmitter3 } from 'eventemitter3';
/**
 * A type-safe event emitter that provides a strongly-typed wrapper around EventEmitter2.
 *
 * This class ensures type safety for event names and their corresponding argument types,
 * making it easier to work with events in a type-safe manner.
 *
 * @template TEvents - A record type mapping event names to their argument types.
 * Each key represents an event name, and the value is a tuple of argument types.
 */
export class EventEmitter {
    constructor() {
        _EventEmitter_emitter.set(this, new EventEmitter3());
    }
    /**
     * Emits an event with the specified name and arguments.
     *
     * @template TEventName - The name of the event to emit (must be a key of TEvents)
     * @param eventName - The name of the event to emit
     * @param eventArg - The arguments to pass to the event handlers
     */
    emit(eventName, ...eventArg) {
        __classPrivateFieldGet(this, _EventEmitter_emitter, "f").emit(eventName, ...eventArg);
    }
    /**
     * Registers an event handler for the specified event.
     *
     * @template TEventName - The name of the event to listen for (must be a key of TEvents)
     * @param eventName - The name of the event to listen for
     * @param handler - The function to call when the event is emitted
     * @returns Nothing
     */
    on(eventName, handler) {
        __classPrivateFieldGet(this, _EventEmitter_emitter, "f").on(eventName, handler);
        return () => {
            this.off(eventName, handler);
        };
    }
    /**
     * Removes a specific event handler for the specified event.
     *
     * @template TEventName - The name of the event to remove the handler from (must be a key of TEvents)
     * @param eventName - The name of the event to remove the handler from
     * @param handler - The specific handler function to remove
     */
    off(eventName, handler) {
        __classPrivateFieldGet(this, _EventEmitter_emitter, "f").off(eventName, handler);
    }
    /**
     * Removes a specific event handler for the specified event.
     * Added for compatibility as some libraries use this method name.
     *
     * @template TEventName - The name of the event to remove the handler from (must be a key of TEvents)
     * @param eventName - The name of the event to remove the handler from
     * @param handler - The specific handler function to remove
     */
    removeListener(eventName, handler) {
        __classPrivateFieldGet(this, _EventEmitter_emitter, "f").off(eventName, handler);
    }
    /**
     * Registers an event handler for the specified event that will only be called once.
     *
     * @template TEventName - The name of the event to listen for (must be a key of TEvents)
     * @param eventName - The name of the event to listen for
     * @param handler - The function to call when the event is emitted (only once)
     * @returns A function to remove the listener
     */
    once(eventName, handler) {
        __classPrivateFieldGet(this, _EventEmitter_emitter, "f").once(eventName, handler);
        return () => {
            this.off(eventName, handler);
        };
    }
    /**
     * Returns the number of listeners registered for the specified event.
     *
     * @template TEventName - The name of the event to count listeners for (must be a key of TEvents)
     * @param eventName - The name of the event to count listeners for
     * @returns The number of listeners registered for the event
     */
    listenerCount(eventName) {
        return __classPrivateFieldGet(this, _EventEmitter_emitter, "f").listenerCount(eventName);
    }
}
_EventEmitter_emitter = new WeakMap();
//# sourceMappingURL=index.js.map