import { infuraRpcUrls } from './constants';
/**
 * Generates Infura RPC URLs for common networks keyed by CAIP Chain ID.
 *
 * @param options - The options for generating Infura RPC URLs
 * @param options.infuraApiKey - The Infura API key
 * @param options.caipChainIds - Optional CAIP-2 chain IDs to filter the output
 * @returns A map of CAIP-2 chain IDs to Infura RPC URLs
 */
export function getInfuraRpcUrls({ infuraApiKey, caipChainIds, }) {
    const keys = caipChainIds && caipChainIds.length > 0
        ? caipChainIds
        : Object.keys(infuraRpcUrls);
    return keys.reduce((acc, key) => {
        const baseUrl = infuraRpcUrls[key];
        if (baseUrl) {
            acc[key] = `${baseUrl}${infuraApiKey}`;
        }
        return acc;
    }, {});
}
//# sourceMappingURL=infura.js.map