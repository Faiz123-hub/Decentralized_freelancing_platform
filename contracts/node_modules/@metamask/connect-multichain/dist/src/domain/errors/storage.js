/* eslint-disable @typescript-eslint/parameter-properties */
import { BaseErr } from './base';
export class StorageGetErr extends BaseErr {
    constructor(platform, key, reason) {
        super(`StorageErr${StorageGetErr.code}: ${platform} storage get error in key: ${key} - ${reason}`, StorageGetErr.code);
        this.platform = platform;
        this.key = key;
        this.reason = reason;
    }
}
StorageGetErr.code = 60;
export class StorageSetErr extends BaseErr {
    constructor(platform, key, reason) {
        super(`StorageErr${StorageSetErr.code}: ${platform} storage set error in key: ${key} - ${reason}`, StorageSetErr.code);
        this.platform = platform;
        this.key = key;
        this.reason = reason;
    }
}
StorageSetErr.code = 61;
export class StorageDeleteErr extends BaseErr {
    constructor(platform, key, reason) {
        super(`StorageErr${StorageDeleteErr.code}: ${platform} storage delete error in key: ${key} - ${reason}`, StorageDeleteErr.code);
        this.platform = platform;
        this.key = key;
        this.reason = reason;
    }
}
StorageDeleteErr.code = 62;
//# sourceMappingURL=storage.js.map