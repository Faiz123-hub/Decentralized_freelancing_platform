import { b as bootstrapLazy } from './index-de0119fe.js';
export { s as setNonce } from './index-de0119fe.js';
import { g as globalScripts } from './app-globals-0f993ce5.js';

const defineCustomElements = async (win, options) => {
  if (typeof window === 'undefined') return undefined;
  await globalScripts();
  return bootstrapLazy([["mm-install-modal_2",[[1,"mm-install-modal",{"link":[1],"expiresIn":[2,"expires-in"],"showInstallModal":[4,"show-install-modal"],"translationsLoaded":[32]},null,{"link":["updateLinkHandler"],"expiresIn":["updateExpiresInHandler"]}],[1,"mm-otp-modal",{"displayOTP":[4,"display-o-t-p"],"otpCode":[1,"otp-code"],"translationsLoaded":[32]}]]]], options);
};

export { defineCustomElements };

//# sourceMappingURL=loader.js.map