/**
 * A type-safe event emitter that provides a strongly-typed wrapper around EventEmitter2.
 *
 * This class ensures type safety for event names and their corresponding argument types,
 * making it easier to work with events in a type-safe manner.
 *
 * @template TEvents - A record type mapping event names to their argument types.
 * Each key represents an event name, and the value is a tuple of argument types.
 */
export declare class EventEmitter<TEvents extends Record<string, unknown[]>> {
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
export type * from './types';
//# sourceMappingURL=index.d.ts.map