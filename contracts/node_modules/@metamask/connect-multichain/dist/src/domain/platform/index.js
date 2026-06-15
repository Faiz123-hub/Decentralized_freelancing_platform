var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-restricted-globals */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import-x/no-named-as-default-member -- Bowser.parse is the intended API */
import Bowser from 'bowser';
export var PlatformType;
(function (PlatformType) {
    // React Native or Nodejs
    PlatformType["NonBrowser"] = "nodejs";
    // MetaMask Mobile in-app browser
    PlatformType["MetaMaskMobileWebview"] = "in-app-browser";
    // Desktop Browser
    PlatformType["DesktopWeb"] = "web-desktop";
    // Mobile Browser
    PlatformType["MobileWeb"] = "web-mobile";
    // ReactNative
    PlatformType["ReactNative"] = "react-native";
})(PlatformType || (PlatformType = {}));
function isNotBrowser() {
    if (typeof window === 'undefined') {
        return true;
    }
    if (!(window === null || window === void 0 ? void 0 : window.navigator)) {
        return true;
    }
    return (navigator === null || navigator === void 0 ? void 0 : navigator.product) === 'ReactNative';
}
function isReactNative() {
    var _a, _b;
    // Modern Hermes-based RN: window is undefined, but global.navigator.product is set.
    // This check must come first so getPlatformType() resolves to ReactNative rather
    // than NonBrowser when isNotBrowser() would otherwise catch this case.
    if (typeof global !== 'undefined' &&
        ((_a = global === null || global === void 0 ? void 0 : global.navigator) === null || _a === void 0 ? void 0 : _a.product) === 'ReactNative') {
        return true;
    }
    // Legacy RN environments where window === global
    const hasWindowNavigator = typeof window !== 'undefined' && window.navigator !== undefined;
    return hasWindowNavigator && ((_b = window.navigator) === null || _b === void 0 ? void 0 : _b.product) === 'ReactNative';
}
function isMetaMaskMobileWebView() {
    return (typeof window !== 'undefined' &&
        // @ts-expect-error ReactNativeWebView should be defined
        Boolean(window.ReactNativeWebView) &&
        Boolean(window.navigator.userAgent.endsWith('MetaMaskMobile')));
}
function isMobile() {
    var _a, _b;
    const browser = Bowser.parse(window.navigator.userAgent);
    return (((_a = browser === null || browser === void 0 ? void 0 : browser.platform) === null || _a === void 0 ? void 0 : _a.type) === 'mobile' || ((_b = browser === null || browser === void 0 ? void 0 : browser.platform) === null || _b === void 0 ? void 0 : _b.type) === 'tablet');
}
export function getPlatformType() {
    if (isReactNative()) {
        return PlatformType.ReactNative;
    }
    if (isNotBrowser()) {
        return PlatformType.NonBrowser;
    }
    if (isMetaMaskMobileWebView()) {
        return PlatformType.MetaMaskMobileWebview;
    }
    if (isMobile()) {
        return PlatformType.MobileWeb;
    }
    return PlatformType.DesktopWeb;
}
/**
 * Check if MetaMask extension is installed
 *
 * @returns True if extension is installed, false otherwise
 */
export function isMetamaskExtensionInstalled() {
    var _a;
    if (typeof window === 'undefined') {
        return false;
    }
    // @ts-expect-error ethereum should be defined
    return Boolean((_a = window.ethereum) === null || _a === void 0 ? void 0 : _a.isMetaMask);
}
export function isSecure() {
    const platformType = getPlatformType();
    return isReactNative() || platformType === PlatformType.MobileWeb;
}
// Immediately start MetaMask detection when module loads
const detectionPromise = (() => __awaiter(void 0, void 0, void 0, function* () {
    const pt = getPlatformType();
    if (pt === PlatformType.NonBrowser || pt === PlatformType.ReactNative) {
        return Promise.resolve(false);
    }
    return new Promise((resolve) => {
        const providers = [];
        const handler = (event) => {
            var _a, _b;
            if ((_b = (_a = event === null || event === void 0 ? void 0 : event.detail) === null || _a === void 0 ? void 0 : _a.info) === null || _b === void 0 ? void 0 : _b.rdns) {
                providers.push(event.detail);
            }
        };
        window.addEventListener('eip6963:announceProvider', handler);
        window.dispatchEvent(new Event('eip6963:requestProvider'));
        setTimeout(() => {
            window.removeEventListener('eip6963:announceProvider', handler);
            const hasMetaMask = providers.some((provider) => { var _a, _b; return (_b = (_a = provider === null || provider === void 0 ? void 0 : provider.info) === null || _a === void 0 ? void 0 : _a.rdns) === null || _b === void 0 ? void 0 : _b.startsWith('io.metamask'); });
            resolve(hasMetaMask);
        }, 300); // default timeout
    });
}))();
export function hasExtension() {
    return __awaiter(this, void 0, void 0, function* () {
        return detectionPromise;
    });
}
//# sourceMappingURL=index.js.map