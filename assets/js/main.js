(function () {
  "use strict";

  var doc = document.documentElement;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  var desktop = window.matchMedia("(min-width: 960px)");

  /* Header: solid background after scrolling */
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile navigation */
  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    doc.classList.toggle("nav-open", open);
  }
  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setNav(false);
      toggle.focus();
    }
  });
  desktop.addEventListener("change", function (e) {
    if (e.matches) setNav(false);
  });

  /* On mobile the closed panel must not be reachable by keyboard */
  function syncInert() {
    var closed = !desktop.matches && !nav.classList.contains("is-open");
    nav.toggleAttribute("inert", closed);
  }
  new MutationObserver(syncInert).observe(nav, { attributes: true, attributeFilter: ["class"] });
  desktop.addEventListener("change", syncInert);
  syncInert();

  /* Active nav link follows the section in view */
  var links = Array.prototype.slice.call(nav.querySelectorAll("li a"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  function markActive() {
    var y = window.scrollY + window.innerHeight * 0.35;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s; });
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) current = sections[sections.length - 1];
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + current.id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  markActive();
  window.addEventListener("scroll", markActive, { passive: true });
  window.addEventListener("resize", markActive);

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Menu category filter */
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".menu-card");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      cards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !show;
        if (show) card.classList.add("is-visible");
      });
    });
  });

  /* Gallery lightbox */
  var box = document.getElementById("lightbox");
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var boxImg = document.getElementById("lightbox-img");
  var boxCap = document.getElementById("lightbox-caption");
  var index = 0;
  var opener = null;

  if (box && typeof box.showModal === "function") {
    var show = function (i) {
      index = (i + items.length) % items.length;
      boxImg.src = items[index].getAttribute("data-full");
      boxImg.alt = items[index].getAttribute("data-alt");
      boxCap.textContent = items[index].getAttribute("data-alt");
    };
    items.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        opener = btn;
        show(i);
        box.showModal();
      });
    });
    box.querySelector(".lb-close").addEventListener("click", function () { box.close(); });
    box.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
    box.addEventListener("close", function () { if (opener) opener.focus(); });
  } else {
    items.forEach(function (btn) { btn.style.cursor = "default"; });
  }

  /* Demo reservation form: validates, but never sends anything */
  var form = document.getElementById("reserve");
  var status = document.getElementById("form-status");
  var dateInput = document.getElementById("r-date");
  if (dateInput) {
    var now = new Date();
    dateInput.min = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0");
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = "Please complete the highlighted fields.";
      form.reportValidity();
      return;
    }
    status.textContent = "Demo only: nothing was sent and no table has been booked.";
    form.reset();
  });
})();
