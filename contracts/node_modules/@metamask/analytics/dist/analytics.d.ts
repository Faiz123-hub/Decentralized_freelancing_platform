import type * as schema from './schema';
type MMConnectPayload = schema.components['schemas']['MMConnectPayload'];
type MMConnectProperties = schema.components['schemas']['MMConnectProperties'];
type MMConnectEventName = MMConnectPayload['event_name'];
declare class Analytics {
    private enabled;
    private readonly sender;
    private properties;
    constructor(baseUrl: string);
    enable(): void;
    setGlobalProperty<K extends keyof MMConnectProperties>(key: K, value: MMConnectProperties[K]): void;
    track(eventName: MMConnectEventName, properties: Partial<MMConnectProperties>): void;
}
export default Analytics;
//# sourceMappingURL=analytics.d.ts.map