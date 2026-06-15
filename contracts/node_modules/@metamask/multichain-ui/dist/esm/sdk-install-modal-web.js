import { p as promiseResolve, b as bootstrapLazy } from './index-de0119fe.js';
export { s as setNonce } from './index-de0119fe.js';
import { g as globalScripts } from './app-globals-0f993ce5.js';

/*
 Stencil Client Patch Browser v4.22.2 | MIT Licensed | https://stenciljs.com
 */
var patchBrowser = () => {
  const importMeta = import.meta.url;
  const opts = {};
  if (importMeta !== "") {
    opts.resourcesUrl = new URL(".", importMeta).href;
  }
  return promiseResolve(opts);
};

patchBrowser().then(async (options) => {
  await globalScripts();
  return bootstrapLazy([["mm-install-modal_2",[[1,"mm-install-modal",{"link":[1],"expiresIn":[2,"expires-in"],"showInstallModal":[4,"show-install-modal"],"translationsLoaded":[32]},null,{"link":["updateLinkHandler"],"expiresIn":["updateExpiresInHandler"]}],[1,"mm-otp-modal",{"displayOTP":[4,"display-o-t-p"],"otpCode":[1,"otp-code"],"translationsLoaded":[32]}]]]], options);
});

//# sourceMappingURL=sdk-install-modal-web.js.map