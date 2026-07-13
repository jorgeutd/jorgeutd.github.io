/* Inference Lab — interactive visualizations. Vanilla JS + Canvas, no deps. */
(function () {
  "use strict";

  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ACCENT = "#5fa89e", ACCENT2 = "#82c3b8", PROMPT = "#3a557f",
      GRID = "#1a2338", DIM = "#202a41", INK = "#070b14", MUTED = "#a3afc7";

  var KIB = 1024, MIB = 1024 * 1024, GIB = 1024 * 1024 * 1024;

  function fmtBytes(b) {
    if (b >= GIB) return (b / GIB).toFixed(b / GIB >= 10 ? 0 : 2) + " GiB";
    if (b >= MIB) return (b / MIB).toFixed(b / MIB >= 10 ? 0 : 1) + " MiB";
    return (b / KIB).toFixed(0) + " KiB";
  }

  /* DPR-aware canvas sizing. Returns {ctx, w, h} in CSS pixels. */
  function fitCanvas(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.floor(rect.width));
    var h = Math.max(1, Math.floor(rect.height || canvas.clientHeight));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ------------------------------------------------------------------ *
   * 1. KV cache decode visualizer
   * ------------------------------------------------------------------ */
  (function kvViz() {
    var canvas = document.getElementById("kv-canvas");
    if (!canvas) return;
    var PER_TOKEN = 2 * 32 * 8 * 128 * 2; // Llama-3.1-8B, fp16 = 131072 B/token

    var ctxLen = 64, promptLen = 22, tokens = 0, playing = false, tps = 8;
    var acc = 0, last = 0, raf = 0, onScreen = true;

    var elPlay = document.getElementById("viz-play");
    var elStep = document.getElementById("viz-step");
    var elReset = document.getElementById("viz-reset");
    var elCtx = document.getElementById("viz-ctx");
    var elCtxOut = document.getElementById("viz-ctx-out");
    var elSpeed = document.getElementById("viz-speed");
    var sPhase = document.getElementById("stat-phase");
    var sTokens = document.getElementById("stat-tokens");
    var sMem = document.getElementById("stat-mem");
    var sPer = document.getElementById("stat-pertok");
    sPer.textContent = fmtBytes(PER_TOKEN);

    function phase() { return tokens < promptLen ? "prefill" : (tokens >= ctxLen ? "done" : "decode"); }

    function stats() {
      sPhase.textContent = phase();
      sTokens.textContent = tokens + " / " + ctxLen;
      sMem.textContent = fmtBytes(tokens * PER_TOKEN);
    }

    function draw() {
      var d = fitCanvas(canvas), ctx = d.ctx, W = d.w, H = d.h;
      ctx.clearRect(0, 0, W, H);
      var padX = 16, padTop = 18, barH = 26, gap = 6;
      var gridTop = padTop, gridBottom = H - barH - 34;
      var cols = Math.max(8, Math.floor((W - padX * 2 + gap) / 26));
      var cell = Math.min(22, (W - padX * 2 - (cols - 1) * gap) / cols);
      var rows = Math.ceil(ctxLen / cols);
      var needH = rows * (cell + gap);
      if (needH > gridBottom - gridTop) {
        cell = Math.max(6, (gridBottom - gridTop - (rows - 1) * gap) / rows);
      }
      var active = tokens > 0 ? tokens - 1 : -1;
      function cellXY(i) {
        var r = Math.floor(i / cols), c = i % cols;
        return { x: padX + c * (cell + gap), y: gridTop + r * (cell + gap) };
      }

      // attention lines from active token to all cached tokens
      if (active > 0 && phase() !== "done") {
        var a = cellXY(active);
        ctx.lineWidth = 1;
        for (var j = 0; j < active; j++) {
          var p = cellXY(j);
          ctx.strokeStyle = "rgba(130,195,184," + (j / active * 0.35 + 0.05).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x + cell / 2, a.y + cell / 2);
          ctx.lineTo(p.x + cell / 2, p.y + cell / 2);
          ctx.stroke();
        }
      }

      // cells
      for (var i = 0; i < ctxLen; i++) {
        var xy = cellXY(i);
        if (i >= tokens) {
          ctx.fillStyle = DIM;
        } else if (i === active) {
          ctx.fillStyle = ACCENT2;
        } else if (i < promptLen) {
          ctx.fillStyle = PROMPT;
        } else {
          ctx.fillStyle = ACCENT;
        }
        roundRect(ctx, xy.x, xy.y, cell, cell, 3);
        ctx.fill();
        if (i === active) { ctx.shadowColor = ACCENT2; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0; }
      }

      // memory bar
      var by = H - barH - 8;
      ctx.fillStyle = GRID;
      roundRect(ctx, padX, by, W - padX * 2, barH, 8); ctx.fill();
      var frac = ctxLen ? tokens / ctxLen : 0;
      var grad = ctx.createLinearGradient(padX, 0, W - padX, 0);
      grad.addColorStop(0, ACCENT); grad.addColorStop(1, ACCENT2);
      ctx.fillStyle = grad;
      roundRect(ctx, padX, by, Math.max(2, (W - padX * 2) * frac), barH, 8); ctx.fill();
      ctx.fillStyle = "#04121f";
      ctx.font = "600 12px -apple-system,Segoe UI,Roboto,sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText("KV cache: " + fmtBytes(tokens * PER_TOKEN), padX + 10, by + barH / 2);
    }

    function render() { draw(); stats(); }

    function addToken() {
      if (tokens < ctxLen) tokens++;
      if (tokens >= ctxLen) pause();
    }

    function loop(t) {
      if (!playing) return;
      if (!last) last = t;
      var dt = (t - last) / 1000; last = t;
      // prefill resolves in one visual beat, then decode at tps
      if (tokens < promptLen) { tokens = promptLen; }
      else { acc += dt * tps; while (acc >= 1 && tokens < ctxLen) { acc -= 1; tokens++; } }
      if (tokens >= ctxLen) { render(); pause(); return; }
      render();
      raf = requestAnimationFrame(loop);
    }

    function play() {
      if (playing || tokens >= ctxLen) return;
      playing = true; elPlay.textContent = "Pause"; elPlay.setAttribute("aria-pressed", "true");
      last = 0; acc = 0; raf = requestAnimationFrame(loop);
    }
    function pause() {
      playing = false; elPlay.textContent = "Play"; elPlay.setAttribute("aria-pressed", "false");
      if (raf) cancelAnimationFrame(raf);
    }

    elPlay.addEventListener("click", function () { playing ? pause() : play(); });
    elStep.addEventListener("click", function () { pause(); addToken(); render(); });
    elReset.addEventListener("click", function () { pause(); tokens = 0; acc = 0; render(); });
    elCtx.addEventListener("input", function () {
      pause(); ctxLen = +elCtx.value; promptLen = Math.max(4, Math.round(ctxLen * 0.34));
      if (tokens > ctxLen) tokens = ctxLen;
      elCtxOut.textContent = ctxLen; render();
    });
    elSpeed.addEventListener("input", function () { tps = +elSpeed.value; });
    window.addEventListener("resize", function () { render(); });

    // pause work when offscreen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting;
        if (!onScreen && playing) pause();
      }, { threshold: 0.05 }).observe(canvas);
    }

    render();
  })();

  /* ------------------------------------------------------------------ *
   * 2. KV cache memory calculator
   * ------------------------------------------------------------------ */
  (function calc() {
    var form = document.getElementById("calc-form");
    if (!form) return;
    var P = {
      // [num_layers, num_kv_heads, head_dim] — verified from model cards / configs
      "qwen3-8b": [36, 8, 128], "qwen3-32b": [64, 8, 128], "qwen3-235b": [94, 4, 128],
      "gptoss-20b": [24, 8, 64],
      "l31-8b": [32, 8, 128], "l31-70b": [80, 8, 128], "qwen25-7b": [28, 4, 128],
      "mistral-7b": [32, 8, 128], "l2-13b": [40, 40, 128]
    };
    var $ = function (id) { return document.getElementById(id); };
    var preset = $("calc-preset"), layers = $("calc-layers"), kv = $("calc-kvheads"),
        hd = $("calc-headdim"), dtype = $("calc-dtype"), seq = $("calc-seq"),
        batch = $("calc-batch"), gpu = $("calc-gpu");
    var oTotal = $("calc-total"), oUnit = $("calc-unit"), oPer = $("calc-pertok"),
        oPct = $("calc-pct"), oFill = $("calc-fill"), oHint = $("calc-hint");

    function compute() {
      var L = +layers.value, K = +kv.value, D = +hd.value, B = +dtype.value,
          S = +seq.value, N = +batch.value, G = +gpu.value;
      var perTok = 2 * L * K * D * B;
      var total = perTok * S * N;
      var parts = fmtBytes(total).split(" ");
      oTotal.textContent = parts[0]; oUnit.textContent = parts[1];
      oPer.textContent = fmtBytes(perTok);
      var gpuBytes = G * GIB;
      var pct = total / gpuBytes * 100;
      oPct.textContent = (pct < 0.1 ? pct.toFixed(2) : pct.toFixed(1)) + "%";
      oFill.style.width = Math.min(100, pct).toFixed(1) + "%";
      if (pct > 100) { oHint.className = "calc__hint warn"; oHint.textContent = "Won't fit — the KV cache alone exceeds the GPU. Shrink context/batch, use GQA, or quantize the cache."; }
      else if (pct > 85) { oHint.className = "calc__hint warn"; oHint.textContent = "Tight — little room left for weights and activations. Consider FP8 KV or a smaller batch."; }
      else { oHint.className = "calc__hint ok"; oHint.textContent = "Comfortable headroom for weights and activations alongside the cache."; }
    }
    function applyPreset() {
      var p = P[preset.value];
      if (p) { layers.value = p[0]; kv.value = p[1]; hd.value = p[2]; }
      compute();
    }
    preset.addEventListener("change", applyPreset);
    [layers, kv, hd].forEach(function (el) {
      el.addEventListener("input", function () { preset.value = "custom"; compute(); });
    });
    [dtype, seq, batch, gpu].forEach(function (el) { el.addEventListener("input", compute); });
    applyPreset();
  })();

  /* ------------------------------------------------------------------ *
   * 3a. PagedAttention: paged blocks vs contiguous fragmentation
   * ------------------------------------------------------------------ */
  (function paged() {
    var host = document.getElementById("paged-viz");
    if (!host) return;
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%"; canvas.style.height = "100%";
    host.appendChild(canvas);
    var contiguous = false;
    var btn = document.getElementById("paged-toggle");
    var metric = document.getElementById("paged-metric");
    // 4 sequences, each uses a different actual length but max is reserved when contiguous
    var seqs = [{ used: 5, color: ACCENT }, { used: 3, color: ACCENT2 },
                { used: 7, color: "#5eead4" }, { used: 2, color: "#f0a5c0" }];
    var MAXBLK = 8;

    function draw() {
      var d = fitCanvas(canvas), ctx = d.ctx, W = d.w, H = d.h;
      ctx.clearRect(0, 0, W, H);
      var padX = 10, padY = 12, rows = seqs.length;
      var rowH = (H - padY * 2) / rows, cellGap = 4;
      var cols = MAXBLK, cw = (W - padX * 2 - (cols - 1) * cellGap) / cols;
      var wasted = 0, totalReserved = 0, totalUsed = 0;
      for (var r = 0; r < rows; r++) {
        var y = padY + r * rowH + 4, ch = rowH - 8;
        for (var c = 0; c < cols; c++) {
          var x = padX + c * (cw + cellGap);
          var isUsed = c < seqs[r].used;
          if (contiguous) {
            // whole row reserved to MAX; unused = wasted
            totalReserved++; if (!isUsed) wasted++; else totalUsed++;
            ctx.fillStyle = isUsed ? seqs[r].color : DIM;
            ctx.globalAlpha = isUsed ? 1 : 0.5;
            roundRect(ctx, x, y, cw, ch, 3); ctx.fill(); ctx.globalAlpha = 1;
          } else {
            // paged: only allocate used blocks, scattered look via slight shuffle
            if (isUsed) { totalReserved++; totalUsed++; ctx.fillStyle = seqs[r].color; roundRect(ctx, x, y, cw, ch, 3); ctx.fill(); }
            else { ctx.strokeStyle = "rgba(255,255,255,0.06)"; roundRect(ctx, x, y, cw, ch, 3); ctx.stroke(); }
          }
        }
      }
      var pct = contiguous ? Math.round(wasted / totalReserved * 100) : 4;
      metric.textContent = contiguous ? ("Contiguous: ~" + pct + "% wasted to fragmentation")
                                      : "Paged: ~4% waste (last-block only)";
    }
    btn.addEventListener("click", function () {
      contiguous = !contiguous;
      btn.setAttribute("aria-pressed", String(contiguous));
      btn.textContent = contiguous ? "Show paged (vLLM)" : "Show contiguous (naive)";
      draw();
    });
    window.addEventListener("resize", draw);
    draw();
  })();

  /* ------------------------------------------------------------------ *
   * 3b. Continuous vs static batching timeline
   * ------------------------------------------------------------------ */
  (function batching() {
    var host = document.getElementById("batch-viz");
    if (!host) return;
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%"; canvas.style.height = "100%";
    host.appendChild(canvas);
    var isStatic = false;
    var btn = document.getElementById("batch-toggle");
    var metric = document.getElementById("batch-metric");
    var SLOTS = 4, STEPS = 12;
    // request lengths per slot for the first wave
    var lens = [4, 7, 3, 10];

    function build() {
      // returns grid[slot][step] = colorIndex (0 empty) ; reuse ids increment
      var grid = [];
      for (var s = 0; s < SLOTS; s++) {
        grid[s] = new Array(STEPS).fill(0);
        if (isStatic) {
          var maxLen = Math.max.apply(null, lens);
          for (var t = 0; t < STEPS; t++) {
            var wave = Math.floor(t / maxLen);
            var within = t % maxLen;
            grid[s][t] = within < lens[s] ? (1 + wave) : -1; // -1 = padded/idle
          }
        } else {
          var t2 = 0, id = 1, cursor = lens[s];
          while (t2 < STEPS) {
            for (var k = 0; k < cursor && t2 < STEPS; k++, t2++) grid[s][t2] = id;
            id++; cursor = lens[(s + id) % SLOTS]; // admit a new request immediately
          }
        }
      }
      return grid;
    }
    var palette = [null, ACCENT, ACCENT2, "#5eead4", "#f0a5c0", "#ffd166"];
    function colorFor(v) { if (v <= 0) return null; return palette[(v - 1) % (palette.length - 1) + 1]; }

    function draw() {
      var d = fitCanvas(canvas), ctx = d.ctx, W = d.w, H = d.h;
      ctx.clearRect(0, 0, W, H);
      var grid = build();
      var padX = 10, padY = 10, gap = 3;
      var cw = (W - padX * 2 - (STEPS - 1) * gap) / STEPS;
      var rh = (H - padY * 2 - (SLOTS - 1) * gap) / SLOTS;
      var busy = 0, cells = SLOTS * STEPS;
      for (var s = 0; s < SLOTS; s++) {
        for (var t = 0; t < STEPS; t++) {
          var x = padX + t * (cw + gap), y = padY + s * (rh + gap), v = grid[s][t];
          var col = colorFor(v);
          if (col) { busy++; ctx.fillStyle = col; roundRect(ctx, x, y, cw, rh, 2); ctx.fill(); }
          else if (v === -1) { ctx.fillStyle = "rgba(255,180,162,0.18)"; roundRect(ctx, x, y, cw, rh, 2); ctx.fill(); }
          else { ctx.strokeStyle = "rgba(255,255,255,0.05)"; roundRect(ctx, x, y, cw, rh, 2); ctx.stroke(); }
        }
      }
      var util = Math.round(busy / cells * 100);
      metric.textContent = isStatic ? ("Static: GPU busy ~" + util + "% (pink = padding/idle)")
                                     : ("Continuous: GPU busy ~" + util + "%");
    }
    btn.addEventListener("click", function () {
      isStatic = !isStatic;
      btn.setAttribute("aria-pressed", String(isStatic));
      btn.textContent = isStatic ? "Show continuous batching" : "Show static batching";
      draw();
    });
    window.addEventListener("resize", draw);
    draw();
  })();

  /* ------------------------------------------------------------------ *
   * 3c. Speculative decoding
   * ------------------------------------------------------------------ */
  (function spec() {
    var host = document.getElementById("spec-viz");
    if (!host) return;
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%"; canvas.style.height = "100%";
    host.appendChild(canvas);
    var btn = document.getElementById("spec-run");
    var metric = document.getElementById("spec-metric");
    var K = 5, accepted = 3, revealT = K + 1, raf = 0;

    function draw() {
      var d = fitCanvas(canvas), ctx = d.ctx, W = d.w, H = d.h;
      ctx.clearRect(0, 0, W, H);
      var padX = 14, gap = 8, cw = Math.min(52, (W - padX * 2 - (K - 1) * gap) / K);
      var y = H / 2 - cw / 2;
      ctx.font = "600 11px -apple-system,Segoe UI,Roboto,sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (var i = 0; i < K; i++) {
        var x = padX + i * (cw + gap);
        var revealed = i < revealT;
        var isAcc = i < accepted;
        if (!revealed) { ctx.fillStyle = "#26324c"; }
        else if (isAcc) { ctx.fillStyle = "#1f7a4d"; }
        else { ctx.fillStyle = i === accepted ? "#8a2f3a" : "#3a2330"; }
        roundRect(ctx, x, y, cw, cw, 6); ctx.fill();
        ctx.fillStyle = revealed ? "#eaf2ff" : "#5a6b86";
        ctx.fillText(revealed ? (isAcc ? "\u2713" : (i === accepted ? "\u2717" : "\u00b7")) : "?", x + cw / 2, y + cw / 2);
      }
      ctx.fillStyle = MUTED; ctx.textAlign = "left";
      ctx.fillText("draft proposes " + K + " \u2192 target verifies in 1 pass", padX, y - 18 > 8 ? y - 18 : 12);
    }
    function run() {
      accepted = 1 + Math.floor(Math.random() * K); // 1..K accepted
      if (accepted > K) accepted = K;
      metric.textContent = "verifying\u2026";
      if (REDUCE) { revealT = K; draw(); finish(); return; }
      revealT = 0;
      cancelAnimationFrame(raf);
      var t0 = 0;
      (function anim(t) {
        if (!t0) t0 = t;
        revealT = Math.min(K, Math.floor((t - t0) / 180));
        draw();
        if (revealT < K) raf = requestAnimationFrame(anim); else finish();
      })(performance.now());
    }
    function finish() {
      var kept = Math.min(accepted, K);
      metric.textContent = "accepted " + kept + "/" + K + " \u2192 " + kept + " tokens from 1 target pass";
    }
    btn.addEventListener("click", run);
    window.addEventListener("resize", draw);
    revealT = K; draw();
  })();

  /* ------------------------------------------------------------------ *
   * 3d. MHA / GQA / MQA head sharing
   * ------------------------------------------------------------------ */
  (function gqa() {
    var host = document.getElementById("gqa-viz");
    if (!host) return;
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%"; canvas.style.height = "100%";
    host.appendChild(canvas);
    var btn = document.getElementById("gqa-cycle");
    var metric = document.getElementById("gqa-metric");
    var Q = 8, modes = [{ n: "MHA", kv: 8 }, { n: "GQA", kv: 4 }, { n: "MQA", kv: 1 }], mi = 1;

    function draw() {
      var d = fitCanvas(canvas), ctx = d.ctx, W = d.w, H = d.h;
      ctx.clearRect(0, 0, W, H);
      var m = modes[mi], KV = m.kv;
      var padX = 16, topY = 30, botY = H - 30;
      var qGap = (W - padX * 2) / Q, kGap = (W - padX * 2) / KV;
      function qx(i) { return padX + qGap * (i + 0.5); }
      function kx(i) { return padX + kGap * (i + 0.5); }
      // links
      ctx.lineWidth = 1.2;
      for (var i = 0; i < Q; i++) {
        var g = Math.floor(i / (Q / KV));
        ctx.strokeStyle = "rgba(95,168,158,0.35)";
        ctx.beginPath(); ctx.moveTo(qx(i), topY + 8); ctx.lineTo(kx(g), botY - 8); ctx.stroke();
      }
      // query heads
      for (var q = 0; q < Q; q++) { ctx.fillStyle = ACCENT2; ctx.beginPath(); ctx.arc(qx(q), topY, 7, 0, 7); ctx.fill(); }
      // kv heads
      for (var k = 0; k < KV; k++) { ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(kx(k), botY, 9, 0, 7); ctx.fill(); }
      ctx.fillStyle = MUTED; ctx.font = "600 11px -apple-system,Segoe UI,Roboto,sans-serif"; ctx.textAlign = "left";
      ctx.fillText(Q + " query heads", padX, 14);
      ctx.fillText(KV + " KV head" + (KV > 1 ? "s" : ""), padX, H - 8);
      var factor = (Q / KV);
      metric.textContent = m.n + ": " + KV + " KV head" + (KV > 1 ? "s" : "") + " \u2192 " +
        (KV === Q ? "baseline cache" : factor + "\u00d7 smaller cache vs MHA");
    }
    btn.addEventListener("click", function () { mi = (mi + 1) % modes.length; draw(); });
    window.addEventListener("resize", draw);
    draw();
  })();

  /* ------------------------------------------------------------------ *
   * 3e. Prefix caching (static diagram)
   * ------------------------------------------------------------------ */
  (function prefix() {
    var host = document.getElementById("prefix-viz");
    if (!host) return;
    host.style.height = "150px";
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%"; canvas.style.height = "100%";
    host.appendChild(canvas);
    function draw() {
      var d = fitCanvas(canvas), ctx = d.ctx, W = d.w, H = d.h;
      ctx.clearRect(0, 0, W, H);
      var padX = 12, pw = Math.min(150, W * 0.42), ph = 22, py = H / 2 - ph / 2;
      // shared prefix
      var grad = ctx.createLinearGradient(padX, 0, padX + pw, 0);
      grad.addColorStop(0, ACCENT); grad.addColorStop(1, ACCENT2);
      ctx.fillStyle = grad; roundRect(ctx, padX, py, pw, ph, 5); ctx.fill();
      ctx.fillStyle = "#04121f"; ctx.font = "600 11px -apple-system,Segoe UI,Roboto,sans-serif";
      ctx.textBaseline = "middle"; ctx.textAlign = "center";
      ctx.fillText("shared prefix (cached once)", padX + pw / 2, py + ph / 2);
      // branching request tails
      var bx = padX + pw + 6, rows = 3, th = 12, spread = 40;
      for (var r = 0; r < rows; r++) {
        var ty = H / 2 + (r - 1) * spread - th / 2;
        ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.beginPath();
        ctx.moveTo(bx, py + ph / 2); ctx.lineTo(bx + 14, ty + th / 2); ctx.stroke();
        ctx.fillStyle = "#2b3a58"; roundRect(ctx, bx + 14, ty, Math.min(120, W - bx - 30), th, 4); ctx.fill();
      }
      ctx.fillStyle = MUTED; ctx.textAlign = "left";
      ctx.fillText("unique tails", bx + 20, py + ph / 2);
    }
    window.addEventListener("resize", draw);
    draw();
  })();

  /* ------------------------------------------------------------------ *
   * 3f. KV quantization memory bars (static)
   * ------------------------------------------------------------------ */
  (function quant() {
    var host = document.getElementById("quant-viz");
    if (!host) return;
    host.style.height = "150px";
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%"; canvas.style.height = "100%";
    host.appendChild(canvas);
    var bars = [{ n: "FP16", f: 1, c: ACCENT }, { n: "FP8/INT8", f: 0.5, c: ACCENT2 }, { n: "INT4", f: 0.25, c: "#5eead4" }];
    function draw() {
      var d = fitCanvas(canvas), ctx = d.ctx, W = d.w, H = d.h;
      ctx.clearRect(0, 0, W, H);
      var padX = 14, padY = 14, rowH = (H - padY * 2) / bars.length, maxW = W - padX * 2 - 90;
      ctx.font = "600 12px -apple-system,Segoe UI,Roboto,sans-serif"; ctx.textBaseline = "middle";
      for (var i = 0; i < bars.length; i++) {
        var y = padY + i * rowH + rowH / 2 - 9;
        ctx.fillStyle = MUTED; ctx.textAlign = "left"; ctx.fillText(bars[i].n, padX, y + 9);
        var bx = padX + 74;
        ctx.fillStyle = "#141b2e"; roundRect(ctx, bx, y, maxW, 18, 4); ctx.fill();
        ctx.fillStyle = bars[i].c; roundRect(ctx, bx, y, Math.max(6, maxW * bars[i].f), 18, 4); ctx.fill();
      }
    }
    window.addEventListener("resize", draw);
    draw();
  })();

  /* ------------------------------------------------------------------ *
   * 3g. Chunked prefill / prefill-decode disaggregation
   * ------------------------------------------------------------------ */
  (function disagg() {
    var host = document.getElementById("disagg-viz");
    if (!host) return;
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%"; canvas.style.height = "100%";
    host.appendChild(canvas);
    var colocated = false;
    var btn = document.getElementById("disagg-toggle");
    var metric = document.getElementById("disagg-metric");

    function box(ctx, x, y, w, h, label, sub) {
      ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1;
      roundRect(ctx, x, y, w, h, 8); ctx.stroke();
      ctx.fillStyle = "#cdd7ea"; ctx.font = "600 12px -apple-system,Segoe UI,Roboto,sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(label, x + w / 2, y + 8);
      ctx.fillStyle = MUTED; ctx.font = "500 10px -apple-system,Segoe UI,Roboto,sans-serif";
      ctx.fillText(sub, x + w / 2, y + 24);
    }
    function dots(ctx, x, y, w, h, n, color) {
      ctx.fillStyle = color;
      for (var i = 0; i < n; i++) {
        var cx = x + 16 + (i % 6) * ((w - 26) / 6);
        var cy = y + 44 + Math.floor(i / 6) * 16;
        if (cy < y + h - 8) { ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill(); }
      }
    }
    function draw() {
      var d = fitCanvas(canvas), ctx = d.ctx, W = d.w, H = d.h;
      ctx.clearRect(0, 0, W, H);
      var pad = 12;
      if (colocated) {
        box(ctx, pad, pad, W - pad * 2, H - pad * 2, "1 GPU — colocated", "prefill & decode contend");
        dots(ctx, pad, pad, W - pad * 2, H - pad * 2, 8, ACCENT);
        dots(ctx, pad + 12, pad + 12, W - pad * 2, H - pad * 2, 7, "rgba(255,180,162,0.9)");
        metric.textContent = "Colocated: prefill spikes stall decode (head-of-line latency)";
      } else {
        var bw = (W - pad * 3) / 2;
        box(ctx, pad, pad, bw, H - pad * 2, "Prefill pool", "compute-bound");
        dots(ctx, pad, pad, bw, H - pad * 2, 9, ACCENT2);
        box(ctx, pad * 2 + bw, pad, bw, H - pad * 2, "Decode pool", "bandwidth-bound");
        dots(ctx, pad * 2 + bw, pad, bw, H - pad * 2, 6, ACCENT);
        // KV stream arrow
        var ay = H / 2, ax0 = pad + bw + 2, ax1 = pad * 2 + bw - 2;
        ctx.strokeStyle = "#5eead4"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax1, ay); ctx.lineTo(ax1 - 6, ay - 4); ctx.lineTo(ax1 - 6, ay + 4); ctx.closePath(); ctx.fillStyle = "#5eead4"; ctx.fill();
        ctx.fillStyle = MUTED; ctx.font = "500 9px -apple-system,Segoe UI,Roboto,sans-serif"; ctx.textAlign = "center";
        ctx.fillText("KV", (ax0 + ax1) / 2, ay - 12);
        metric.textContent = "Disaggregated: phases scale independently; KV streamed between pools";
      }
    }
    btn.addEventListener("click", function () {
      colocated = !colocated;
      btn.setAttribute("aria-pressed", String(colocated));
      btn.textContent = colocated ? "Show disaggregated (PD split)" : "Show colocated (contention)";
      draw();
    });
    window.addEventListener("resize", draw);
    draw();
  })();
})();
