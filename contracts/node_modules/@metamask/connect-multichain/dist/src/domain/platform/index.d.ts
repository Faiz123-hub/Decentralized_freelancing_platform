export declare enum PlatformType {
    NonBrowser = "nodejs",
    MetaMaskMobileWebview = "in-app-browser",
    DesktopWeb = "web-desktop",
    MobileWeb = "web-mobile",
    ReactNative = "react-native"
}
export declare function getPlatformType(): PlatformType;
/**
 * Check if MetaMask extension is installed
 *
 * @returns True if extension is installed, false otherwise
 */
export declare function isMetamaskExtensionInstalled(): boolean;
export declare function isSecure(): boolean;
export declare function hasExtension(): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map