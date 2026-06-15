var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable no-restricted-globals -- Browser storage adapter uses window.indexedDB */
/* eslint-disable @typescript-eslint/naming-convention -- DB_NAME is a constant */
/* eslint-disable @typescript-eslint/explicit-function-return-type -- Inferred types are sufficient */
/* eslint-disable no-restricted-syntax -- Private class properties use established patterns */
/* eslint-disable @typescript-eslint/parameter-properties -- Constructor shorthand is intentional */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors -- Custom error objects */
import { StoreAdapter } from '../../domain';
export class StoreAdapterWeb extends StoreAdapter {
    get internal() {
        if (typeof window === 'undefined' || !window.indexedDB) {
            throw new Error('indexedDB is not available in this environment');
        }
        return window.indexedDB;
    }
    constructor(dbNameSuffix = '-kv-store', storeName = StoreAdapterWeb.stores[0]) {
        super();
        this.storeName = storeName;
        this.platform = 'web';
        const dbName = `${StoreAdapterWeb.DB_NAME}${dbNameSuffix}`;
        this.dbPromise = new Promise((resolve, reject) => {
            try {
                const request = this.internal.open(dbName, 1);
                request.onerror = () => reject(new Error('Failed to open IndexedDB.'));
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = () => {
                    const db = request.result;
                    for (const name of StoreAdapterWeb.stores) {
                        if (!db.objectStoreNames.contains(name)) {
                            db.createObjectStore(name);
                        }
                    }
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeName } = this;
            const db = yield this.dbPromise;
            return new Promise((resolve, reject) => {
                try {
                    const tx = db.transaction(storeName, 'readonly');
                    const store = tx.objectStore(storeName);
                    const request = store.get(key);
                    request.onerror = () => reject(new Error('Failed to get value from IndexedDB.'));
                    request.onsuccess = () => { var _a; return resolve((_a = request.result) !== null && _a !== void 0 ? _a : null); };
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeName } = this;
            const db = yield this.dbPromise;
            return new Promise((resolve, reject) => {
                try {
                    const tx = db.transaction(storeName, 'readwrite');
                    const store = tx.objectStore(storeName);
                    const request = store.put(value, key);
                    request.onerror = () => reject(new Error('Failed to set value in IndexedDB.'));
                    request.onsuccess = () => resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeName } = this;
            const db = yield this.dbPromise;
            return new Promise((resolve, reject) => {
                try {
                    const tx = db.transaction(storeName, 'readwrite');
                    const store = tx.objectStore(storeName);
                    const request = store.delete(key);
                    request.onerror = () => reject(new Error('Failed to delete value from IndexedDB.'));
                    request.onsuccess = () => resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
}
StoreAdapterWeb.stores = ['sdk-kv-store', 'key-value-pairs'];
StoreAdapterWeb.DB_NAME = 'mmconnect';
//# sourceMappingURL=web.js.map