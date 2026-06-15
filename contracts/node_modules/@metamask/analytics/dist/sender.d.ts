type SenderOptions<T> = {
    batchSize: number;
    baseTimeoutMs: number;
    sendFn: (batch: T[]) => Promise<void>;
};
/**
 * Sender batches events and sends them to a server within a time window,
 * with exponential backoff on errors.
 */
declare class Sender<T> {
    private readonly sendFn;
    private batch;
    private readonly batchSize;
    private readonly baseTimeoutMs;
    private currentTimeoutMs;
    private readonly maxTimeoutMs;
    private timeoutId;
    private isSending;
    constructor(options: SenderOptions<T>);
    enqueue(item: T): void;
    private schedule;
    private flush;
}
export default Sender;
//# sourceMappingURL=sender.d.ts.map