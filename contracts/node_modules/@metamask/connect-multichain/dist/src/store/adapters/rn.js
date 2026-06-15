var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// eslint-disable-next-line @typescript-eslint/naming-convention -- AsyncStorage is an external library
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoreAdapter } from '../../domain';
export class StoreAdapterRN extends StoreAdapter {
    constructor() {
        super(...arguments);
        this.platform = 'rn';
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return AsyncStorage.getItem(key);
        });
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return AsyncStorage.setItem(key, value);
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return AsyncStorage.removeItem(key);
        });
    }
}
//# sourceMappingURL=rn.js.map