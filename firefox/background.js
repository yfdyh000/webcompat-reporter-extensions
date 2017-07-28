/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const prefix = "https://webcompat.com/issues/new?url=";
const reporterID = "addon-reporter-firefox";

browser.contextMenus.create({
  id: "webcompat-contextmenu",
  title: "Report site issue",
  contexts: ["all"]
});

function reportIssue(tab) {
  browser.tabs.captureVisibleTab({ format: "png" }).then((screenshotData) => {
    browser.tabs.query({ currentWindow: true, active: true }).then((tab) => {
      let newTabUrl =
        `${prefix}${encodeURIComponent(tab[0].url)}&src=${reporterID}`;
      browser.tabs.create({ "url": newTabUrl}).then(() => {
        browser.tabs.executeScript({
          code: `window.postMessage("${screenshotData}", "*")`
        });
      });
    });
  });
}

function enableOrDisable(tabId, changeInfo, tab) {
  function isReportableURL(url) {
    return url && !(url.startsWith("about")     ||
                    url.startsWith("chrome")    ||
                    url.startsWith("file")      ||
                    url.startsWith("resource")  ||
                    url.startsWith("view-source"));
  }

  if (changeInfo.status !== "loading") { return; }
  if (isReportableURL(tab.url)) {
    browser.browserAction.enable(tabId);
  } else {
    browser.browserAction.disable(tabId);
  }
}

browser.tabs.onCreated.addListener((tab) => {
  // disable all new tabs until they've loaded and we know
  // they have reportable URLs
  browser.browserAction.disable(tab.tabId);
});
browser.tabs.onUpdated.addListener(enableOrDisable);
browser.contextMenus.onClicked.addListener(reportIssue);
browser.browserAction.onClicked.addListener(reportIssue);
