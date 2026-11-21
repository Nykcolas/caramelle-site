/* Preloader editorial Caramellê — progresso real, calda ondulada e cortina de caramelo */
(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const skipPreloader =
    params.get("render") === "1" || params.get("preloader") === "0";
  const preloaderEl = document.getElementById("preloader");

  // Modo ?render=1 ou ?preloader=0: remove imediatamente e não bloqueia nada
  if (skipPreloader || !preloaderEl) {
    if (preloaderEl && preloaderEl.parentNode) {
      preloaderEl.parentNode.removeChild(preloaderEl);
    }
    window.__preloaderActive = false;
    return;
  }

  window.__preloaderActive = true;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Bloqueio de entradas enquanto o preloader estiver ativo (fase de captura)
  const BLOCKED_EVENTS = [
    "wheel",
    "touchstart",
    "touchmove",
    "touchend",
    "keydown",
    "keyup"
  ];

  function isBrowserShortcut(e) {
    return (
      e.key === "F5" ||
      e.key === "F12" ||
      e.ctrlKey ||
      e.metaKey
    );
  }

  function blockInputHandler(e) {
    if (!window.__preloaderActive) return;
    if ((e.type === "keydown" || e.type === "keyup") && isBrowserShortcut(e)) {
      return;
    }
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  BLOCKED_EVENTS.forEach(function (evtName) {
    window.addEventListener(evtName, blockInputHandler, {
      capture: true,
      passive: false
    });
  });

  function unblockInputs() {
    BLOCKED_EVENTS.forEach(function (evtName) {
      window.removeEventListener(evtName, blockInputHandler, { capture: true });
    });
  }

  // Referências DOM do preloader
  const logoWrap = preloaderEl.querySelector(".preloader-logo");
  const caldaPath = document.getElementById("preloader-calda-path");
  const pctWrap = preloaderEl.querySelector(".preloader-pct-wrap");
  const pctNumEl = document.getElementById("preloader-pct");
  const barFillEl = document.getElementById("preloader-bar-fill");
  const curtainBackEl = document.getElementById("preloader-curtain-back");
  const curtainFrontEl = document.getElementById("preloader-curtain-front");

  // Gerador pseudo-aleatório determinístico (Mulberry32)
  function createRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Entrada editorial da logo e do percentual
  if (!prefersReduced && typeof gsap !== "undefined") {
    gsap.fromTo(
      logoWrap,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
    gsap.fromTo(
      pctWrap,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, delay: 0.16, ease: "power2.out" }
    );
  } else {
    if (logoWrap) logoWrap.style.opacity = "1";
    if (pctWrap) pctWrap.style.opacity = "1";
  }

  // Desenho da calda ondulada dentro da logo (viewBox 1540x517)
  const LOGO_VW = 1540;
  const LOGO_VH = 517;
  const WAVE_SEGMENTS = 38;
  let lastShownInt = -1;
  let waveTime = 0;

  function updateCaldaVisual(progress, tSec) {
    const p = Math.max(0, Math.min(1, progress));
    const baseY = (LOGO_VH + 4) * (1 - p) - 4 * p;

    let amp = 0;
    if (!prefersReduced && p > 0 && p < 0.999) {
      const rampIn = Math.min(1, p / 0.06);
      const rampOut = p > 0.88 ? Math.max(0, (1 - p) / 0.12) : 1;
      amp = 14 * rampIn * rampOut;
    }

    if (caldaPath) {
      if (amp < 0.05) {
        const yFlat = baseY.toFixed(1);
        caldaPath.setAttribute(
          "d",
          "M 0," +
            yFlat +
            " L " +
            LOGO_VW +
            "," +
            yFlat +
            " L " +
            LOGO_VW +
            "," +
            (LOGO_VH + 10) +
            " L 0," +
            (LOGO_VH + 10) +
            " Z"
        );
      } else {
        const phase1 = tSec * 2.8;
        const phase2 = tSec * 1.9 + 1.35;
        let d = "";
        for (let i = 0; i <= WAVE_SEGMENTS; i++) {
          const nx = i / WAVE_SEGMENTS;
          const x = nx * LOGO_VW;
          const wave =
            0.64 * Math.sin(nx * Math.PI * 2 * 1.75 + phase1) +
            0.36 * Math.sin(nx * Math.PI * 2 * 3.1 - phase2);
          const y = baseY + amp * wave;
          d +=
            (i === 0 ? "M " : " L ") +
            x.toFixed(1) +
            "," +
            y.toFixed(1);
        }
        d +=
          " L " +
          LOGO_VW +
          "," +
          (LOGO_VH + 10) +
          " L 0," +
          (LOGO_VH + 10) +
          " Z";
        caldaPath.setAttribute("d", d);
      }
    }

    const pctInt = Math.round(p * 100);
    if (pctNumEl && pctInt !== lastShownInt) {
      lastShownInt = pctInt;
      pctNumEl.textContent = String(pctInt);
    }
    if (barFillEl) {
      barFillEl.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }
  }

  // Geração das cortinas de caramelo (SVG dinâmico conforme largura da janela)
  const SVG_NS = "http://www.w3.org/2000/svg";
  let curtainMeta = null;
  let lastBuildW = 0;
  let lastBuildH = 0;
  let curtainStarted = false;

  function buildCurtainPanel(containerEl, opts) {
    const W = Math.max(320, window.innerWidth);
    const H = Math.max(320, window.innerHeight);
    const bodyH = Math.max(Math.round(H * 1.4), H + 280);
    const maxDrip = 260;
    const svgH = bodyH + maxDrip + 60;
    const rng = createRng(opts.seed);

    function waveY(x) {
      const nx = x / W;
      return (
        bodyH +
        opts.waveAmp *
          (0.65 * Math.sin(nx * Math.PI * 2 * opts.freq1 + opts.phase1) +
            0.35 * Math.sin(nx * Math.PI * 2 * opts.freq2 + opts.phase2))
      );
    }

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + svgH);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");

    let fillAttr = opts.solidFill || "#B4500E";
    if (opts.gradientId) {
      const defs = document.createElementNS(SVG_NS, "defs");
      const grad = document.createElementNS(SVG_NS, "linearGradient");
      grad.setAttribute("id", opts.gradientId);
      grad.setAttribute("gradientUnits", "userSpaceOnUse");
      grad.setAttribute("x1", "0");
      grad.setAttribute("y1", "0");
      grad.setAttribute("x2", "0");
      grad.setAttribute("y2", String(bodyH + maxDrip));

      const stops = [
        { offset: "0%", color: "#F29A3E" },
        { offset: "52%", color: "#DE6E18" },
        { offset: "100%", color: "#C4570C" }
      ];
      stops.forEach(function (s) {
        const stop = document.createElementNS(SVG_NS, "stop");
        stop.setAttribute("offset", s.offset);
        stop.setAttribute("stop-color", s.color);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);
      fillAttr = "url(#" + opts.gradientId + ")";
    }

    // Corpo principal com borda inferior ondulada
    const BODY_STEPS = 48;
    let bodyD = "M 0,0 L " + W + ",0";
    for (let i = BODY_STEPS; i >= 0; i--) {
      const x = (i / BODY_STEPS) * W;
      bodyD += " L " + x.toFixed(1) + "," + waveY(x).toFixed(1);
    }
    bodyD += " Z";

    const bodyPath = document.createElementNS(SVG_NS, "path");
    bodyPath.setAttribute("d", bodyD);
    bodyPath.setAttribute("fill", fillAttr);
    svg.appendChild(bodyPath);

    // Escorridos de calda em formato de gota alongada (40px a 260px)
    const dripCount = Math.max(3, Math.round(W / 170));
    const slotW = W / dripCount;
    const longDrips = [];

    for (let i = 0; i < dripCount; i++) {
      let cx = (i + 0.5) * slotW + (rng() - 0.5) * slotW * 0.56;
      cx = Math.max(36, Math.min(W - 36, cx));

      // Mistura comprimentos curtos, médios e longos (40 a 260px)
      const len = 40 + Math.pow(rng(), 0.85) * 220;
      const baseHalfW = Math.min(
        slotW * 0.34,
        18 + rng() * 14 + len * 0.045
      );
      const neckHalfW = baseHalfW * (0.28 + rng() * 0.12);
      const bulbHalfW = Math.max(
        neckHalfW * 1.4,
        baseHalfW * (0.5 + rng() * 0.16)
      );

      const y0 = waveY(cx);
      const yTop = y0 - 12;
      const yNeck = y0 + len * 0.52;
      const yTip = y0 + len;
      const yBulbMax = yTip - bulbHalfW * 0.95;

      const d =
        "M " +
        (cx - baseHalfW).toFixed(1) +
        "," +
        yTop.toFixed(1) +
        " C " +
        (cx - baseHalfW * 0.55).toFixed(1) +
        "," +
        (y0 + len * 0.14).toFixed(1) +
        " " +
        (cx - neckHalfW).toFixed(1) +
        "," +
        (y0 + len * 0.3).toFixed(1) +
        " " +
        (cx - neckHalfW).toFixed(1) +
        "," +
        yNeck.toFixed(1) +
        " C " +
        (cx - neckHalfW).toFixed(1) +
        "," +
        (y0 + len * 0.68).toFixed(1) +
        " " +
        (cx - bulbHalfW).toFixed(1) +
        "," +
        (yBulbMax - bulbHalfW * 0.55).toFixed(1) +
        " " +
        (cx - bulbHalfW).toFixed(1) +
        "," +
        yBulbMax.toFixed(1) +
        " C " +
        (cx - bulbHalfW).toFixed(1) +
        "," +
        (yTip - bulbHalfW * 0.14).toFixed(1) +
        " " +
        (cx - bulbHalfW * 0.45).toFixed(1) +
        "," +
        yTip.toFixed(1) +
        " " +
        cx.toFixed(1) +
        "," +
        yTip.toFixed(1) +
        " C " +
        (cx + bulbHalfW * 0.45).toFixed(1) +
        "," +
        yTip.toFixed(1) +
        " " +
        (cx + bulbHalfW).toFixed(1) +
        "," +
        (yTip - bulbHalfW * 0.14).toFixed(1) +
        " " +
        (cx + bulbHalfW).toFixed(1) +
        "," +
        yBulbMax.toFixed(1) +
        " C " +
        (cx + bulbHalfW).toFixed(1) +
        "," +
        (yBulbMax - bulbHalfW * 0.55).toFixed(1) +
        " " +
        (cx + neckHalfW).toFixed(1) +
        "," +
        (y0 + len * 0.68).toFixed(1) +
        " " +
        (cx + neckHalfW).toFixed(1) +
        "," +
        yNeck.toFixed(1) +
        " C " +
        (cx + neckHalfW).toFixed(1) +
        "," +
        (y0 + len * 0.3).toFixed(1) +
        " " +
        (cx + baseHalfW * 0.55).toFixed(1) +
        "," +
        (y0 + len * 0.14).toFixed(1) +
        " " +
        (cx + baseHalfW).toFixed(1) +
        "," +
        yTop.toFixed(1) +
        " Z";

      const dripPath = document.createElementNS(SVG_NS, "path");
      dripPath.setAttribute("d", d);
      dripPath.setAttribute("fill", fillAttr);
      svg.appendChild(dripPath);

      if (len >= 110) {
        longDrips.push({ el: dripPath, len: len, cx: cx, y0: y0 });
      }
    }

    // Faixas verticais translúcidas de brilho no painel da frente
    if (opts.withGloss) {
      const glossCount = Math.max(3, Math.min(7, Math.round(W / 270)));
      const glossSlot = W / glossCount;
      for (let g = 0; g < glossCount; g++) {
        const gw = 10 + rng() * 16;
        const gx = (g + 0.25 + rng() * 0.5) * glossSlot;
        const gy = H * (0.08 + rng() * 0.18);
        const maxGh = Math.max(120, bodyH - gy - 48);
        const gh = Math.min(maxGh, bodyH * (0.4 + rng() * 0.32));
        const op = (0.1 + rng() * 0.08).toFixed(2);

        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", gx.toFixed(1));
        rect.setAttribute("y", gy.toFixed(1));
        rect.setAttribute("width", gw.toFixed(1));
        rect.setAttribute("height", gh.toFixed(1));
        rect.setAttribute("rx", (gw / 2).toFixed(1));
        rect.setAttribute("fill", "#FFFFFF");
        rect.setAttribute("opacity", op);
        svg.appendChild(rect);
      }
    }

    containerEl.innerHTML = "";
    containerEl.appendChild(svg);

    return { bodyH: bodyH, svgH: svgH, longDrips: longDrips };
  }

  function buildCurtains() {
    if (prefersReduced || !curtainBackEl || !curtainFrontEl) return;
    lastBuildW = window.innerWidth;
    lastBuildH = window.innerHeight;

    const back = buildCurtainPanel(curtainBackEl, {
      seed: 0x7a41b09d,
      solidFill: "#B4500E",
      waveAmp: 18,
      freq1: 1.6,
      freq2: 2.9,
      phase1: 0.7,
      phase2: 2.1,
      withGloss: false
    });

    const front = buildCurtainPanel(curtainFrontEl, {
      seed: 0xca2a3e11,
      gradientId: "preloader-curtain-grad",
      waveAmp: 20,
      freq1: 1.85,
      freq2: 3.25,
      phase1: 1.9,
      phase2: 0.4,
      withGloss: true
    });

    curtainMeta = { back: back, front: front };
  }

  buildCurtains();

  function handlePreloaderResize() {
    if (curtainStarted || prefersReduced || !window.__preloaderActive) return;
    if (
      window.innerWidth !== lastBuildW ||
      window.innerHeight !== lastBuildH
    ) {
      buildCurtains();
    }
  }
  window.addEventListener("resize", handlePreloaderResize);

  // Rastreamento de progresso real (imagens + fontes + window.load)
  const startTime = performance.now();
  const MIN_DURATION_MS = 2400;
  const MAX_DURATION_MS = 12000;

  const observedImgs = new WeakSet();
  const settledImgs = new WeakSet();
  let fontsReady = !(document.fonts && document.fonts.ready);
  let windowLoaded = document.readyState === "complete";
  let forceComplete = false;
  let loadingFinished = false;

  let maxRawProgress = 0;
  let monotonicTarget = 0;
  let lastTweenTarget = -1;
  let shownProgress = 0;
  const smoothState = { value: 0 };

  function checkReadyToComplete() {
    if (
      !loadingFinished &&
      shownProgress >= 0.999 &&
      monotonicTarget >= 1 &&
      performance.now() - startTime >= MIN_DURATION_MS
    ) {
      triggerCompletion();
    }
  }

  function onWaveTick(_time, deltaTime) {
    const dt = Math.min(0.05, (deltaTime || 16.67) / 1000);
    waveTime += dt;
    updateCaldaVisual(shownProgress, waveTime);
  }

  if (!prefersReduced && typeof gsap !== "undefined") {
    gsap.ticker.add(onWaveTick);
  }

  function finishSitePreloader(creamHiddenFlag, revealedFlag) {
    if (!creamHiddenFlag) {
      preloaderEl.classList.add("is-revealing");
    }
    if (!prefersReduced && typeof gsap !== "undefined") {
      gsap.ticker.remove(onWaveTick);
    }
    if (!revealedFlag) {
      window.dispatchEvent(new CustomEvent("preloader:reveal"));
    }
    window.removeEventListener("resize", handlePreloaderResize);
    if (preloaderEl.parentNode) {
      preloaderEl.parentNode.removeChild(preloaderEl);
    }
    window.__preloaderActive = false;
    unblockInputs();
    document.documentElement.classList.add("is-loaded");
    window.dispatchEvent(new CustomEvent("preloader:done"));
  }

  function startCurtainPhase() {
    if (prefersReduced || typeof gsap === "undefined") {
      window.dispatchEvent(new CustomEvent("preloader:reveal"));
      if (typeof gsap !== "undefined") {
        gsap.to(preloaderEl, {
          opacity: 0,
          duration: 0.4,
          ease: "power1.out",
          onComplete: function () {
            finishSitePreloader(true, true);
          }
        });
      } else {
        finishSitePreloader(true, true);
      }
      return;
    }

    curtainStarted = true;
    if (!curtainMeta) buildCurtains();

    const H = Math.max(320, window.innerHeight);
    const backInfo = curtainMeta.back;
    const frontInfo = curtainMeta.front;
    const backEndY = -(backInfo.bodyH + 320);
    const frontEndY = -(frontInfo.bodyH + 320);

    gsap.set([curtainBackEl, curtainFrontEl], { y: H });

    let creamHidden = false;
    let revealed = false;

    const curtainTl = gsap.timeline({
      onComplete: function () {
        finishSitePreloader(creamHidden, revealed);
      }
    });

    // Painel de trás parte 0.12 s antes do painel da frente
    curtainTl.to(
      curtainBackEl,
      {
        y: backEndY,
        duration: 1.35,
        ease: "power3.inOut"
      },
      0
    );

    backInfo.longDrips.forEach(function (d) {
      const extraPx = 20 + ((d.len - 110) / 150) * 18;
      curtainTl.to(
        d.el,
        {
          scaleY: 1 + extraPx / d.len,
          svgOrigin: d.cx + " " + d.y0,
          duration: 0.72,
          ease: "power2.out"
        },
        0.56
      );
    });

    // Painel da frente sobe logo em seguida e dispara a revelação ao cruzar 70%
    curtainTl.to(
      curtainFrontEl,
      {
        y: frontEndY,
        duration: 1.35,
        ease: "power3.inOut",
        onUpdate: function () {
          const curY = Number(gsap.getProperty(curtainFrontEl, "y")) || 0;
          const bottomY = curY + frontInfo.bodyH;

          if (!creamHidden && curY <= -10 && bottomY >= H + 10) {
            creamHidden = true;
            preloaderEl.classList.add("is-revealing");
            gsap.ticker.remove(onWaveTick);
          }

          if (!revealed && bottomY <= H * 0.7) {
            revealed = true;
            window.dispatchEvent(new CustomEvent("preloader:reveal"));
          }
        }
      },
      0.12
    );

    frontInfo.longDrips.forEach(function (d) {
      const extraPx = 20 + ((d.len - 110) / 150) * 20;
      curtainTl.to(
        d.el,
        {
          scaleY: 1 + extraPx / d.len,
          svgOrigin: d.cx + " " + d.y0,
          duration: 0.72,
          ease: "power2.out"
        },
        0.68
      );
    });
  }

  function triggerCompletion() {
    if (loadingFinished) return;
    loadingFinished = true;
    clearInterval(pollTimer);
    clearTimeout(maxTimer);

    shownProgress = 1;
    updateCaldaVisual(1, waveTime);

    if (prefersReduced) {
      startCurtainPhase();
    } else {
      gsap.delayedCall(0.35, startCurtainPhase);
    }
  }

  function updateProgress() {
    if (loadingFinished) return;

    const imgs = document.images;
    const imgCount = imgs.length;
    let loadedCount = 0;

    for (let i = 0; i < imgCount; i++) {
      const img = imgs[i];
      if (!observedImgs.has(img)) {
        observedImgs.add(img);
        if (!img.complete) {
          const onSettle = function () {
            settledImgs.add(img);
            updateProgress();
          };
          img.addEventListener("load", onSettle, { once: true });
          img.addEventListener("error", onSettle, { once: true });
        }
      }
      if (img.complete || settledImgs.has(img)) {
        loadedCount++;
      }
    }

    const total = Math.max(imgCount, 60);
    const imgFrac = Math.min(1, loadedCount / total);
    const allImgsDone = imgCount > 0 ? loadedCount >= imgCount : windowLoaded;
    const everythingDone =
      forceComplete || (allImgsDone && fontsReady && windowLoaded);

    let rawTarget;
    if (everythingDone) {
      rawTarget = 1;
    } else {
      const fontPart = fontsReady ? 0.08 : 0;
      const loadPart = windowLoaded ? 0.07 : 0;
      rawTarget = Math.min(0.99, imgFrac * 0.85 + fontPart + loadPart);
    }

    maxRawProgress = Math.max(maxRawProgress, rawTarget);

    const elapsedMs = performance.now() - startTime;
    const minPaceCap = Math.min(1, elapsedMs / 2200);
    const pacedTarget = Math.min(maxRawProgress, minPaceCap);
    monotonicTarget = Math.max(monotonicTarget, pacedTarget);

    if (typeof gsap !== "undefined") {
      const targetChanged =
        Math.abs(monotonicTarget - lastTweenTarget) > 0.0005 ||
        (monotonicTarget >= 1 && lastTweenTarget < 1);

      if (targetChanged) {
        lastTweenTarget = monotonicTarget;
        gsap.to(smoothState, {
          value: monotonicTarget,
          duration: forceComplete ? 0.9 : 0.28, // limite de tempo: o enchimento final acelera suave, sem salto
          ease: "power1.out",
          overwrite: "auto",
          onUpdate: function () {
            shownProgress = Math.max(shownProgress, smoothState.value);
            if (prefersReduced) {
              updateCaldaVisual(shownProgress, 0);
            }
            checkReadyToComplete();
          },
          onComplete: function () {
            shownProgress = Math.max(shownProgress, smoothState.value);
            if (prefersReduced) {
              updateCaldaVisual(shownProgress, 0);
            }
            checkReadyToComplete();
          }
        });
      } else {
        checkReadyToComplete();
      }
    } else {
      shownProgress = Math.max(shownProgress, monotonicTarget);
      updateCaldaVisual(shownProgress, 0);
      checkReadyToComplete();
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(
      function () {
        fontsReady = true;
        updateProgress();
      },
      function () {
        fontsReady = true;
        updateProgress();
      }
    );
  }

  if (!windowLoaded) {
    window.addEventListener(
      "load",
      function () {
        windowLoaded = true;
        updateProgress();
      },
      { once: true }
    );
  }

  const pollTimer = setInterval(updateProgress, 100);
  const maxTimer = setTimeout(function () {
    forceComplete = true;
    updateProgress();
  }, MAX_DURATION_MS);

  updateCaldaVisual(0, 0);
  updateProgress();
})();
