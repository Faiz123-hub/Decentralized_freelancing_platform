"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectMetamaskExtensionId = detectMetamaskExtensionId;
const constants_1 = require("../transports/constants.cjs");
const constants_2 = require("../transports/constants.cjs");
/**
 * Get the MetaMask extension ID by sending a metamask_getProviderState to the content script
 */
async function detectMetamaskExtensionId() {
    return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
            if (isProviderMessage(event)) {
                const data = event?.data?.data?.data;
                // When a retry message is received, it means the previous getProviderState request was not received by the extension, so we need to retry
                if (data?.method === constants_1.METAMASK_EXTENSION_CONNECT_CAN_RETRY) {
                    getProviderState();
                }
                // Handle the provider state response
                else if (data?.result?.extensionId) {
                    const extensionId = data?.result?.extensionId;
                    resolve(extensionId);
                    window.removeEventListener('message', messageHandler);
                    clearTimeout(timeoutId);
                }
            }
        };
        const timeoutId = setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            reject(new Error('MetaMask extension not found'));
        }, 10000);
        window.addEventListener('message', messageHandler);
        getProviderState();
    });
}
function getProviderState() {
    window.postMessage({
        target: constants_1.CONTENT_SCRIPT,
        data: { name: constants_2.METAMASK_PROVIDER_STREAM_NAME, data: { method: 'metamask_getProviderState' } },
    }, location.origin);
}
function isProviderMessage(event) {
    const { target, data } = event.data;
    return target === constants_1.INPAGE && data?.name === constants_2.METAMASK_PROVIDER_STREAM_NAME && event.origin === location.origin;
}
//# sourceMappingURL=metamaskExtensionId.cjs.map