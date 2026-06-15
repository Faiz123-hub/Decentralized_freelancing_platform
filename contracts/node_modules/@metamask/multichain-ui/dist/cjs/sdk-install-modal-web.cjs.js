'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-45c35b2a.js');
const appGlobals = require('./app-globals-3a1e7e63.js');

/*
 Stencil Client Patch Browser v4.22.2 | MIT Licensed | https://stenciljs.com
 */
var patchBrowser = () => {
  const importMeta = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('sdk-install-modal-web.cjs.js', document.baseURI).href));
  const opts = {};
  if (importMeta !== "") {
    opts.resourcesUrl = new URL(".", importMeta).href;
  }
  return index.promiseResolve(opts);
};

patchBrowser().then(async (options) => {
  await appGlobals.globalScripts();
  return index.bootstrapLazy([["mm-install-modal_2.cjs",[[1,"mm-install-modal",{"link":[1],"expiresIn":[2,"expires-in"],"showInstallModal":[4,"show-install-modal"],"translationsLoaded":[32]},null,{"link":["updateLinkHandler"],"expiresIn":["updateExpiresInHandler"]}],[1,"mm-otp-modal",{"displayOTP":[4,"display-o-t-p"],"otpCode":[1,"otp-code"],"translationsLoaded":[32]}]]]], options);
});

exports.setNonce = index.setNonce;

//# sourceMappingURL=sdk-install-modal-web.cjs.js.map