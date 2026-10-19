/* ============================================================
   Sargis Sargsyan — personal site. Vanilla JS, no dependencies.
   Progressive enhancement: every bit of content works without JS.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* Footer year */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Toast */
  var toast = $(".toast"), toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 1800);
  }

  /* Header: solid background once the page scrolls */
  var header = $(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var toggle = $(".nav-toggle"), menu = $("#nav-menu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); toggle.focus(); }
    });
  }

  /* Theme toggle: flips between light and dark and remembers the choice */
  var themeBtn = $(".theme-toggle");
  function labelTheme() {
    if (!themeBtn) return;
    var dark = root.getAttribute("data-theme-resolved") === "dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  if (themeBtn) {
    labelTheme();
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme-resolved") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      if (window.__resolveTheme) window.__resolveTheme();
      labelTheme();
    });
  }

  /* Active nav link while scrolling */
  var navLinks = $$('.nav-menu a[href^="#"]');
  var spyTargets = navLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
  if ("IntersectionObserver" in window && spyTargets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    spyTargets.forEach(function (s) { spy.observe(s); });
  }

  /* Hero: page-load sequence and the test run */
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add("is-loaded"); }); });

  var runner = $(".runner");
  if (runner) {
    var lines = $$(".runner-lines li", runner);
    var replay = $(".runner-replay", runner);
    var timers = [];
    var run = function () {
      timers.forEach(clearTimeout); timers = [];
      runner.classList.add("is-running");
      lines.forEach(function (li) { li.className = "is-wait"; });
      var t = 650;
      lines.forEach(function (li, i) {
        timers.push(setTimeout(function () { li.className = "is-run"; }, t));
        t += 420 + i * 60;
        timers.push(setTimeout(function () { li.className = "is-pass"; }, t));
        t += 120;
      });
      timers.push(setTimeout(function () { runner.classList.remove("is-running"); }, t + 150));
    };
    if (replay) {
      replay.hidden = false;
      replay.addEventListener("click", run);
    }
    if (!reduceMotion) run();
  }

  /* Talks: view switch and format filter */
  var section = $("#speaking");
  var cards = $$(".talk");
  if (section && cards.length) {
    var tools = $(".talk-tools", section);
    var countEl = $(".result-count", section);
    var typeBtns = $$(".seg-type .seg-btn", section);
    var state = { type: "all" };
    cards.forEach(function (c, i) { c.style.viewTransitionName = "talk-" + i; });

    var apply = function () {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = state.type === "all" || c.getAttribute("data-type") === state.type;
        c.classList.toggle("is-hidden", !ok);
        if (ok) shown++;
      });
      typeBtns.forEach(function (b) {
        var on = b.getAttribute("data-type") === state.type;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var what = state.type === "workshop" ? "workshops" : "talks";
      countEl.innerHTML = state.type === "all"
        ? "All " + cards.length + " appearances, newest first."
        : "Showing " + shown + " " + what + '. <button type="button" class="clear">Show all ' + cards.length + "</button>";
    };
    var update = function (fn) {
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(function () { fn(); apply(); });
      else { fn(); apply(); }
    };

    typeBtns.forEach(function (b) {
      b.addEventListener("click", function () { update(function () { state.type = b.getAttribute("data-type"); }); });
    });
    countEl.addEventListener("click", function (e) {
      if (e.target.closest(".clear")) update(function () { state.type = "all"; });
    });

    var viewBtns = $$("[data-view]", section);
    viewBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-view");
        var swap = function () {
          section.classList.toggle("show-topics", v === "topics");
          viewBtns.forEach(function (x) {
            var on = x === b;
            x.classList.toggle("is-on", on);
            x.setAttribute("aria-pressed", on ? "true" : "false");
          });
        };
        if (document.startViewTransition && !reduceMotion) document.startViewTransition(swap); else swap();
      });
    });

    tools.hidden = false;
    apply();
  }

  /* Speaker kit: copy bios */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.className = "visually-hidden";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  $$(".copy").forEach(function (btn) {
    var src = document.getElementById(btn.getAttribute("data-copy"));
    if (!src) return;
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var name = btn.closest(".bio").querySelector("h3").firstChild.textContent.trim();
      copyText(src.textContent.replace(/\s+/g, " ").trim()).then(function () {
        btn.textContent = "Copied";
        btn.classList.add("is-done");
        say(name + " copied");
        setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("is-done"); }, 1800);
      }, function () { say("Couldn't copy. Select the text and copy it instead."); });
    });
  });
})();
