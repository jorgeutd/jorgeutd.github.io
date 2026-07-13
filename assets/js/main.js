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

  /* Animated neural-network background (canvas). Decorative, aria-hidden.
     Reduced motion -> one static frame, no loop. Offscreen -> paused. */
  Array.prototype.forEach.call(document.querySelectorAll("canvas[data-net]"), initNet);

  function initNet(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, nodes = [], raf = 0, running = false;
    var LINK = 130, ACCENT = "95,168,158", ACCENT2 = "130,195,184";

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.round(Math.min(70, Math.max(22, (W * H) / 16000)));
      nodes = [];
      for (var i = 0; i < target; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: 1.4 + Math.random() * 1.8, ph: Math.random() * Math.PI * 2
        });
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        if (running) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > W) a.vx *= -1;
          if (a.y < 0 || a.y > H) a.vy *= -1;
        }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
          if (d < LINK) {
            var o = (1 - d / LINK) * 0.5;
            ctx.strokeStyle = "rgba(" + (j % 2 ? ACCENT : ACCENT2) + "," + o.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        var pulse = running ? 0.6 + 0.4 * Math.sin(t / 900 + n.ph) : 0.85;
        ctx.fillStyle = "rgba(" + ACCENT + "," + pulse.toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(frame);
    }

    function start() { if (running || reduceMotion) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); frame(performance.now()); }, 150);
    });

    resize();
    frame(performance.now()); // static first paint (also the only paint under reduced motion)

    if (!reduceMotion) {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          es[0].isIntersecting ? start() : stop();
        }, { threshold: 0.01 }).observe(canvas);
      } else { start(); }
    }
  }

  /* Scroll progress bar */
  (function scrollProgress() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? h.scrollTop / max : 0;
      bar.style.width = (pct * 100).toFixed(2) + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  })();

  /* Scrollspy: highlight the in-view section in the nav */
  (function scrollspy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__menu a[href^="#"]'));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    links.forEach(function (a) { var id = a.getAttribute("href").slice(1); if (id) byId[id] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var a = byId[e.target.id];
        if (!a) return;
        links.forEach(function (l) { l.removeAttribute("aria-current"); });
        a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  })();

  /* Command palette (⌘K / Ctrl-K, or "/") */
  (function commandPalette() {
    var nav = document.querySelector(".nav");
    if (!nav || typeof HTMLDialogElement === "undefined") return;
    var onHome = location.pathname === "/" || /\/index\.html$/.test(location.pathname);
    var sec = function (id) { return onHome ? "#" + id : "/#" + id; };

    var commands = [
      { label: "Home", href: "/", grp: "Page" },
      { label: "Systems (architecture case studies)", href: "/systems/", grp: "Page" },
      { label: "Inference Lab", href: "/inference/", grp: "Page" },
      { label: "Papers & Deep Dives", href: "/deep-dives/", grp: "Page" },
      { label: "Evals (how I evaluate AI systems)", href: "/evals/", grp: "Page" },
      { label: "About", href: sec("about"), grp: "Section" },
      { label: "Featured projects", href: sec("projects"), grp: "Section" },
      { label: "Open-source (Hugging Face)", href: sec("opensource"), grp: "Section" },
      { label: "Skills", href: sec("skills"), grp: "Section" },
      { label: "Experience", href: sec("experience"), grp: "Section" },
      { label: "Contact", href: sec("contact"), grp: "Section" },
      { label: "GitHub", href: "https://github.com/jorgeutd", grp: "Link" },
      { label: "Hugging Face", href: "https://huggingface.co/Jorgeutd", grp: "Link" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/jorge-lopez-grisman", grp: "Link" },
      { label: "X / Twitter", href: "https://twitter.com/jorge_utd", grp: "Link" }
    ];

    var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cmdk-trigger";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.innerHTML = 'Search <kbd>' + (isMac ? "\u2318" : "Ctrl") + " K</kbd>";
    nav.appendChild(trigger);

    var dlg = document.createElement("dialog");
    dlg.className = "cmdk";
    dlg.setAttribute("aria-label", "Command palette");
    dlg.innerHTML =
      '<div class="cmdk__box">' +
      '<input class="cmdk__input" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" placeholder="Jump to a page, section, or profile\u2026" autocomplete="off" spellcheck="false" />' +
      '<ul class="cmdk__list" id="cmdk-list" role="listbox" aria-label="Commands"></ul>' +
      '<p class="cmdk__hint">\u2191\u2193 navigate \u00b7 \u21b5 open \u00b7 esc close</p>' +
      "</div>";
    document.body.appendChild(dlg);
    var input = dlg.querySelector(".cmdk__input");
    var list = dlg.querySelector(".cmdk__list");

    commands.forEach(function (c, i) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.dataset.href = c.href;
      li.dataset.label = c.label.toLowerCase();
      li.id = "cmdk-opt-" + i;
      li.innerHTML = '<span>' + c.label + '</span><span class="cmdk__grp">' + c.grp + "</span>";
      list.appendChild(li);
    });
    var items = Array.prototype.slice.call(list.children);
    var sel = 0;

    function visible() { return items.filter(function (li) { return !li.hidden; }); }
    function setSel(i) {
      var vis = visible();
      if (!vis.length) return;
      sel = (i + vis.length) % vis.length;
      items.forEach(function (li) { li.setAttribute("aria-selected", "false"); });
      vis[sel].setAttribute("aria-selected", "true");
      vis[sel].scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", vis[sel].id);
    }
    function filter() {
      var q = input.value.trim().toLowerCase();
      items.forEach(function (li) { li.hidden = q && li.dataset.label.indexOf(q) === -1; });
      sel = 0; setSel(0);
    }
    function go(li) { if (!li) return; dlg.close(); location.href = li.dataset.href; }

    function open() {
      if (dlg.open) return;
      input.value = ""; filter(); dlg.showModal(); input.focus();
    }
    trigger.addEventListener("click", open);
    input.addEventListener("input", filter);
    list.addEventListener("click", function (e) {
      var li = e.target.closest("li[role=option]"); if (li) go(li);
    });
    input.addEventListener("keydown", function (e) {
      var vis = visible();
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(sel + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel(sel - 1); }
      else if (e.key === "Enter") { e.preventDefault(); go(vis[sel]); }
    });
    document.addEventListener("keydown", function (e) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); return; }
      var tag = (e.target.tagName || "").toLowerCase();
      if (e.key === "/" && !dlg.open && tag !== "input" && tag !== "textarea" && tag !== "select") {
        e.preventDefault(); open();
      }
    });
  })();
})();
