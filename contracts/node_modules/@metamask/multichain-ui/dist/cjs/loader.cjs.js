'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-45c35b2a.js');
const appGlobals = require('./app-globals-3a1e7e63.js');

const defineCustomElements = async (win, options) => {
  if (typeof window === 'undefined') return undefined;
  await appGlobals.globalScripts();
  return index.bootstrapLazy([["mm-install-modal_2.cjs",[[1,"mm-install-modal",{"link":[1],"expiresIn":[2,"expires-in"],"showInstallModal":[4,"show-install-modal"],"translationsLoaded":[32]},null,{"link":["updateLinkHandler"],"expiresIn":["updateExpiresInHandler"]}],[1,"mm-otp-modal",{"displayOTP":[4,"display-o-t-p"],"otpCode":[1,"otp-code"],"translationsLoaded":[32]}]]]], options);
};

exports.setNonce = index.setNonce;
exports.defineCustomElements = defineCustomElements;

//# sourceMappingURL=loader.cjs.js.map