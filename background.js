chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (details.url.includes("/api/rentabilidade/v2/rentabilidade")) {
      console.log("📡 Requisição detectada:", details.url);
    }
  },
  { urls: ["<all_urls>"] }
);