(function () {
  "use strict";
  if (window.__dyCleanTM) return;
  window.__dyCleanTM = true;

  function start() {
    window.DyCleanPanel.mount();
    setInterval(() => {
      if (document.body && !document.getElementById("__dyCleanTM")) window.DyCleanPanel.mount();
    }, 2000);
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
