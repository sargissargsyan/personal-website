/* Runs in <head> before first paint so the chosen theme never flashes.
   Kept as a separate file so the Content-Security-Policy can stay script-src 'self'. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function resolve() {
    var t = root.getAttribute("data-theme") || (mq && mq.matches ? "dark" : "light");
    root.setAttribute("data-theme-resolved", t);
  }
  resolve();
  if (mq && mq.addEventListener) mq.addEventListener("change", resolve);
  window.__resolveTheme = resolve;
  // Safety net: never leave the hero hidden if main.js fails to load.
  setTimeout(function () { root.classList.add("is-loaded"); }, 2500);
})();
