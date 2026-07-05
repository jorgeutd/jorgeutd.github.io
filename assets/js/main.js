/* Portfolio interactions — vanilla JS, no dependencies. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Current year in footer */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* Scroll reveal (skipped entirely when reduced motion is preferred) */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(
      ".section__title, .card, .skill-group, .timeline__item, .about p, .hero__actions"
    );
    targets.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* Decorative neural-network motif in the hero */
  var svg = document.querySelector(".neural");
  if (svg) { buildNeural(svg); }

  function buildNeural(root) {
    var W = 800, H = 600;
    var edgesG = root.querySelector(".neural__edges");
    var nodesG = root.querySelector(".neural__nodes");
    if (!edgesG || !nodesG) { return; }

    var layers = [
      { x: 120, count: 4 },
      { x: 320, count: 6 },
      { x: 520, count: 6 },
      { x: 700, count: 3 }
    ];
    var points = [];
    layers.forEach(function (layer) {
      var gap = H / (layer.count + 1);
      var col = [];
      for (var i = 1; i <= layer.count; i++) {
        col.push({ x: layer.x, y: Math.round(gap * i) });
      }
      points.push(col);
    });

    var svgns = "http://www.w3.org/2000/svg";
    /* edges between adjacent layers */
    for (var l = 0; l < points.length - 1; l++) {
      points[l].forEach(function (a) {
        points[l + 1].forEach(function (b) {
          var line = document.createElementNS(svgns, "line");
          line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
          line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
          line.setAttribute("stroke-opacity", "0.18");
          edgesG.appendChild(line);
        });
      });
    }
    /* nodes */
    var all = [];
    points.forEach(function (col) { col.forEach(function (p) { all.push(p); }); });
    all.forEach(function (p, idx) {
      var c = document.createElementNS(svgns, "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", "4.5");
      nodesG.appendChild(c);
      if (!reduceMotion) {
        var anim = document.createElementNS(svgns, "animate");
        anim.setAttribute("attributeName", "opacity");
        anim.setAttribute("values", "0.35;1;0.35");
        anim.setAttribute("dur", (3 + (idx % 5) * 0.6).toFixed(1) + "s");
        anim.setAttribute("begin", (idx * 0.15).toFixed(2) + "s");
        anim.setAttribute("repeatCount", "indefinite");
        c.appendChild(anim);
      }
    });
    root.setAttribute("viewBox", "0 0 " + W + " " + H);
  }
})();
