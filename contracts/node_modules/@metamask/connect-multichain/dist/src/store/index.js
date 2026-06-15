var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable id-denylist -- 'err' is a common pattern for catch clauses */
/* eslint-disable @typescript-eslint/parameter-properties -- Constructor shorthand */
import * as uuid from 'uuid';
import { StorageDeleteErr, StorageGetErr, StorageSetErr, } from '../domain/errors/storage';
import { getTransportType } from '../domain/multichain';
import { StoreClient } from '../domain/store/client';
export class Store extends StoreClient {
    constructor(adapter) {
        super();
        this.adapter = adapter;
    }
    getTransport() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transport = yield this.adapter.get('multichain-transport');
                if (!transport) {
                    return null;
                }
                return getTransportType(transport);
            }
            catch (err) {
                throw new StorageGetErr(this.adapter.platform, 'multichain-transport', err.message);
            }
        });
    }
    setTransport(transport) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.adapter.set('multichain-transport', transport);
            }
            catch (err) {
                throw new StorageSetErr(this.adapter.platform, 'multichain-transport', err.message);
            }
        });
    }
    removeTransport() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.adapter.delete('multichain-transport');
            }
            catch (err) {
                throw new StorageDeleteErr(this.adapter.platform, 'multichain-transport', err.message);
            }
        });
    }
    getAnonId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const anonId = yield this.adapter.get('anonId');
                if (anonId) {
                    return anonId;
                }
                const newAnonId = uuid.v4();
                yield this.adapter.set('anonId', newAnonId);
                return newAnonId;
            }
            catch (err) {
                throw new StorageGetErr(this.adapter.platform, 'anonId', err.message);
            }
        });
    }
    getExtensionId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.adapter.get('extensionId');
            }
            catch (err) {
                throw new StorageGetErr(this.adapter.platform, 'extensionId', err.message);
            }
        });
    }
    setAnonId(anonId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.adapter.set('anonId', anonId);
            }
            catch (err) {
                throw new StorageSetErr(this.adapter.platform, 'anonId', err.message);
            }
        });
    }
    setExtensionId(extensionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.adapter.set('extensionId', extensionId);
            }
            catch (err) {
                throw new StorageSetErr(this.adapter.platform, 'extensionId', err.message);
            }
        });
    }
    removeExtensionId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.adapter.delete('extensionId');
            }
            catch (err) {
                throw new StorageDeleteErr(this.adapter.platform, 'extensionId', err.message);
            }
        });
    }
    removeAnonId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.adapter.delete('anonId');
            }
            catch (err) {
                throw new StorageDeleteErr(this.adapter.platform, 'anonId', err.message);
            }
        });
    }
    getDebug() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.adapter.get('DEBUG');
            }
            catch (err) {
                throw new StorageGetErr(this.adapter.platform, 'DEBUG', err.message);
            }
        });
    }
}
//# sourceMappingURL=index.js.map