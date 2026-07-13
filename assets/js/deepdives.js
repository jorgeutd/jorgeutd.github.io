/* Deep Dives — interactive decoding playground.
   Honest math: softmax with temperature, then top-k, then top-p (nucleus),
   then renormalize. Illustrative logits for a fixed example prompt. */
(function () {
  "use strict";
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ACCENT = "#5fa89e", ACCENT2 = "#82c3b8", DIM = "#26324c", MUTED = "#a3afc7", TEXT = "#e7ecf5";

  var canvas = document.getElementById("decode-canvas");
  if (!canvas) return;

  // Example next-token candidates + logits for "The capital of France is ___"
  var VOCAB = [
    { t: "Paris", z: 8.0 }, { t: "the", z: 3.4 }, { t: "located", z: 3.0 },
    { t: "a", z: 2.7 }, { t: "Lyon", z: 2.1 }, { t: "Marseille", z: 1.8 },
    { t: "home", z: 1.5 }, { t: "one", z: 1.3 }, { t: "in", z: 1.1 },
    { t: "France", z: 0.7 }, { t: "not", z: 0.4 }, { t: "known", z: 0.1 }
  ];

  var elTemp = document.getElementById("dc-temp"), elK = document.getElementById("dc-topk"),
      elP = document.getElementById("dc-topp");
  var oTemp = document.getElementById("t-out"), oK = document.getElementById("k-out"),
      oP = document.getElementById("p-out");
  var sTop = document.getElementById("s-top"), sKept = document.getElementById("s-kept"),
      sEnt = document.getElementById("s-entropy"), sPtop = document.getElementById("s-ptop");

  function softmaxT(items, T) {
    var m = -Infinity, i;
    for (i = 0; i < items.length; i++) m = Math.max(m, items[i].z / T);
    var sum = 0, exps = new Array(items.length);
    for (i = 0; i < items.length; i++) { exps[i] = Math.exp(items[i].z / T - m); sum += exps[i]; }
    for (i = 0; i < items.length; i++) items[i].p = exps[i] / sum;
    return items;
  }

  /* Returns rows in original vocab order with {t, p (final), kept} */
  function distribution(T, k, p) {
    var rows = VOCAB.map(function (v) { return { t: v.t, z: v.z, p: 0, kept: true }; });
    softmaxT(rows, T);
    // rank by probability (desc)
    var order = rows.slice().sort(function (a, b) { return b.p - a.p; });
    // top-k: keep k highest (0 = off)
    if (k > 0) order.forEach(function (r, idx) { if (idx >= k) r.kept = false; });
    // top-p on the survivors: smallest set whose cumulative prob >= p
    var cum = 0, reached = false;
    for (var i = 0; i < order.length; i++) {
      if (!order[i].kept) continue;
      if (reached) { order[i].kept = false; continue; }
      cum += order[i].p;
      if (cum >= p - 1e-9) reached = true; // include the token that crosses the threshold
    }
    // renormalize over kept
    var keptSum = 0;
    rows.forEach(function (r) { if (r.kept) keptSum += r.p; });
    rows.forEach(function (r) { r.p = r.kept && keptSum > 0 ? r.p / keptSum : 0; });
    return rows;
  }

  function stats(rows) {
    var kept = 0, top = rows[0], ent = 0;
    rows.forEach(function (r) {
      if (r.kept) kept++;
      if (r.p > top.p) top = r;
      if (r.p > 0) ent -= r.p * Math.log2(r.p);
    });
    return { kept: kept, top: top, ent: ent };
  }

  var anim = { rows: VOCAB.map(function () { return 0; }), raf: 0 };

  function draw(target) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    var W = Math.max(1, Math.floor(rect.width)), H = Math.max(1, Math.floor(rect.height));
    canvas.width = W * dpr; canvas.height = H * dpr;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var padL = 96, padR = 54, padY = 14, n = target.length;
    var rowH = (H - padY * 2) / n, barH = Math.min(20, rowH * 0.62);
    var maxW = W - padL - padR;
    ctx.font = "600 12px -apple-system,Segoe UI,Roboto,sans-serif";
    ctx.textBaseline = "middle";
    for (var i = 0; i < n; i++) {
      var r = target[i], y = padY + i * rowH + rowH / 2;
      // label
      ctx.fillStyle = r.kept ? TEXT : "#6b7b96";
      ctx.textAlign = "right";
      ctx.fillText(r.t, padL - 12, y);
      // track
      ctx.fillStyle = "#121829";
      roundRect(ctx, padL, y - barH / 2, maxW, barH, 4); ctx.fill();
      // bar (animated width)
      var w = Math.max(0, anim.rows[i]) * maxW;
      if (w > 0.5) {
        if (r.kept) {
          var g = ctx.createLinearGradient(padL, 0, padL + maxW, 0);
          g.addColorStop(0, ACCENT); g.addColorStop(1, ACCENT2);
          ctx.fillStyle = g;
        } else { ctx.fillStyle = DIM; }
        roundRect(ctx, padL, y - barH / 2, Math.max(2, w), barH, 4); ctx.fill();
      }
      // pct
      ctx.fillStyle = r.kept ? MUTED : "#55617a";
      ctx.textAlign = "left";
      ctx.fillText((anim.rows[i] * 100).toFixed(anim.rows[i] >= 0.1 ? 0 : 1) + "%", padL + maxW + 8, y);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function update() {
    var T = +elTemp.value, k = +elK.value, p = +elP.value;
    oTemp.textContent = T.toFixed(2);
    oK.textContent = k === 0 ? "off" : String(k);
    oP.textContent = p.toFixed(2);
    var rows = distribution(T, k, p);
    var st = stats(rows);
    sTop.textContent = st.top.t;
    sKept.textContent = st.kept + " / " + rows.length;
    sEnt.textContent = st.ent.toFixed(2) + " bits";
    sPtop.textContent = (st.top.p * 100).toFixed(0) + "%";

    var target = rows.map(function (r) { return r.p; });
    if (REDUCE) { anim.rows = target; draw(rows); return; }
    // ease bar widths toward target
    cancelAnimationFrame(anim.raf);
    (function step() {
      var done = true;
      for (var i = 0; i < target.length; i++) {
        var d = target[i] - anim.rows[i];
        if (Math.abs(d) > 0.002) { anim.rows[i] += d * 0.25; done = false; }
        else anim.rows[i] = target[i];
      }
      draw(rows);
      if (!done) anim.raf = requestAnimationFrame(step);
    })();
  }

  [elTemp, elK, elP].forEach(function (el) { el.addEventListener("input", update); });
  window.addEventListener("resize", function () { draw(distribution(+elTemp.value, +elK.value, +elP.value)); });
  update();

  /* ---------------------------------------------------------------- *
   * Positional encoding heatmap (exact sinusoidal PE)
   * ---------------------------------------------------------------- */
  (function posenc() {
    var cv = document.getElementById("pe-canvas");
    if (!cv) return;
    var elL = document.getElementById("pe-l"), elD = document.getElementById("pe-d");
    var oL = document.getElementById("pe-l-out"), oD = document.getElementById("pe-d-out");
    // diverging colormap stops: -1 -> accent2, 0 -> bg, +1 -> accent
    var NEG = [201, 154, 106], ZERO = [15, 19, 25], POS = [95, 168, 158];
    function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    function color(v) { // v in [-1,1]
      var c = v < 0 ? mix(ZERO, NEG, -v) : mix(ZERO, POS, v);
      return "rgb(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + ")";
    }
    function draw() {
      var L = +elL.value, D = +elD.value;
      oL.textContent = L; oD.textContent = D;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = cv.getBoundingClientRect();
      var W = Math.max(1, Math.floor(rect.width)), H = Math.max(1, Math.floor(rect.height));
      cv.width = W * dpr; cv.height = H * dpr;
      var ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var padL = 40, padB = 18, padT = 6, padR = 6;
      var gw = W - padL - padR, gh = H - padT - padB;
      var cw = gw / D, ch = gh / L;
      for (var pos = 0; pos < L; pos++) {
        for (var i = 0; i < D; i++) {
          var freq = Math.floor(i / 2);
          var angle = pos / Math.pow(10000, (2 * freq) / D);
          var val = (i % 2 === 0) ? Math.sin(angle) : Math.cos(angle);
          ctx.fillStyle = color(val);
          ctx.fillRect(padL + i * cw, padT + pos * ch, Math.ceil(cw), Math.ceil(ch));
        }
      }
      // axis labels
      ctx.fillStyle = MUTED; ctx.font = "500 10px -apple-system,Segoe UI,Roboto,sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("dimension \u2192", padL + gw / 2, H - 12);
      ctx.save();
      ctx.translate(12, padT + gh / 2); ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = "middle"; ctx.fillText("position \u2192", 0, 0);
      ctx.restore();
    }
    [elL, elD].forEach(function (el) { el.addEventListener("input", draw); });
    window.addEventListener("resize", draw);
    draw();
  })();
})();
