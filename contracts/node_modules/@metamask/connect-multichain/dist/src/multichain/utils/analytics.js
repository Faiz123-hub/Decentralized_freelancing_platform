var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars -- Scope type used in JSDoc */
import { getDappId } from '.';
import { getPlatformType } from '../../domain';
/**
 * Checks if an error represents a user rejection.
 *
 * @param error - The error object to check
 * @returns True if the error indicates a user rejection, false otherwise
 */
export function isRejectionError(error) {
    var _a, _b;
    if (typeof error !== 'object' || error === null) {
        return false;
    }
    const errorObj = error;
    const errorCode = errorObj.code;
    const errorMessage = (_b = (_a = errorObj.message) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
    return (errorCode === 4001 || // User rejected request (common EIP-1193 code)
        errorCode === 4100 || // Unauthorized (common rejection code)
        errorMessage.includes('reject') ||
        errorMessage.includes('denied') ||
        errorMessage.includes('cancel') ||
        errorMessage.includes('user'));
}
/**
 * Gets base analytics properties that are common across all events.
 *
 * @param options - Multichain options containing dapp and analytics config
 * @param storage - Storage client for getting anonymous ID
 * @returns Base analytics properties
 */
export function getBaseAnalyticsProperties(options, storage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const dappId = getDappId(options.dapp);
        const platform = getPlatformType();
        const anonId = yield storage.getAnonId();
        return {
            mmconnect_versions: (_a = options.versions) !== null && _a !== void 0 ? _a : {},
            dapp_id: dappId,
            platform,
            anon_id: anonId,
        };
    });
}
/**
 * Gets analytics properties specific to wallet action events.
 *
 * @param options - Multichain options containing dapp and analytics config
 * @param storage - Storage client for getting anonymous ID
 * @param invokeOptions - The invoke method options containing method and scope
 * @param transportType - The transport type to use for the analytics event
 * @returns Wallet action analytics properties
 */
export function getWalletActionAnalyticsProperties(options, storage, invokeOptions, transportType) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const dappId = getDappId(options.dapp);
        const anonId = yield storage.getAnonId();
        return {
            mmconnect_versions: (_a = options.versions) !== null && _a !== void 0 ? _a : {},
            dapp_id: dappId,
            method: invokeOptions.request.method,
            caip_chain_id: invokeOptions.scope,
            anon_id: anonId,
            transport_type: transportType,
        };
    });
}
//# sourceMappingURL=analytics.js.map