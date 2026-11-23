/* Jornada do Copo — Caramellê (GSAP 3 timeline única pausada, desktop + mobile) */
(function () {
  "use strict";

  const TOTAL_DURATION = 28;
  const STEPS = [2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 26.0, 28.0];
  const STEP_LOCK_MS = 1200;

  // Cor sólida de fundo do #viewport por passo (para eliminar letterbox escuro)
  const STEP_BG_COLORS = [
    "#FADDC6", // step 0: hero
    "#FCE3D1", // step 1: o pudim
    "#DE6E18", // step 2: tradicional
    "#3D1208", // step 3: café
    "#C98B4E", // step 4: duo
    "#B0304A", // step 5: morango
    "#5E1F1F", // step 6: nutella
    "#F4DCBB", // step 7: cocada
    "#FFE8D8", // step 8: tamanhos (copo e 1 kg)
    "#F9DCC6", // step 9: edição limitada
    "#FFE8D8", // step 10: depoimentos
    "#F9DCC6", // step 11: quem somos
    "#FFE8D8", // step 12: parceiros
    "#3D1208"  // step 13: peça o seu
  ];

  // Menu MESCLADO ao fundo (sem barra): só o texto/logo mudam por passo para manter o contraste.
  // fg = cor do texto; logoDark = 1 usa a logo laranja, 0 usa a logo creme; logoFilter escurece a logo laranja (fundo caramelo)
  const NAV_TONES = [
    { fg: "#3D1208", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 1, logoFilter: "brightness(1)" }, // 0 hero
    { fg: "#3D1208", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 1, logoFilter: "brightness(1)" }, // 1
    { fg: "#FFE8D8", cta: "#3D1208", ctaFg: "#FFE8D8", logoDark: 0, logoFilter: "brightness(1)" }, // 2 laranja
    { fg: "#FFE8D8", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 0, logoFilter: "brightness(1)" }, // 3 café
    { fg: "#3D1208", cta: "#3D1208", ctaFg: "#FFE8D8", logoDark: 1, logoFilter: "brightness(0.28)" }, // 4 duo (caramelo)
    { fg: "#FFE8D8", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 0, logoFilter: "brightness(1)" }, // 5 morango
    { fg: "#FFE8D8", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 0, logoFilter: "brightness(1)" }, // 6 nutella
    { fg: "#3D1208", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 1, logoFilter: "brightness(1)" }, // 7 cocada
    { fg: "#3D1208", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 1, logoFilter: "brightness(1)" }, // 8
    { fg: "#3D1208", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 1, logoFilter: "brightness(1)" }, // 9
    { fg: "#3D1208", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 1, logoFilter: "brightness(1)" }, // 10
    { fg: "#3D1208", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 1, logoFilter: "brightness(1)" }, // 11
    { fg: "#3D1208", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 1, logoFilter: "brightness(1)" }, // 12
    { fg: "#FFE8D8", cta: "#DE6E18", ctaFg: "#FFE8D8", logoDark: 0, logoFilter: "brightness(1)" }  // 13
  ];
  const CREME_BAR_STEPS = new Set([2, 3, 5, 6, 13]); // passos em que o menu usa texto creme

  let builtDiag = 0; // diagonal da janela usada na última construção da timeline
  const params = new URLSearchParams(window.location.search);
  const IS_RENDER = params.get("render") === "1";
  const FORCE_MOBILE = params.get("mobile") === "1";
  const PREFERS_REDUCED =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // API global determinística
  window.jornadaDuration = TOTAL_DURATION;
  window.__idleT = 0;
  window.__mouse = window.__mouse || { x: 960, y: 540 };

  function detectMobile() {
    return (
      FORCE_MOBILE ||
      window.innerWidth <= 820 ||
      window.innerHeight > window.innerWidth
    );
  }

  let isMobile = detectMobile();
  window.layoutMode = isMobile ? "mobile" : "desktop";

  // Dados dos 6 sabores (paleta editorial oficial + copos reais + flutuantes reais)
  const FLAVORS = [
    {
      id: 0,
      nome: "Tradicional",
      img: "img/copos/tradicional.webp",
      isWide: false,
      textColor: "#F2A55A",
      desktopSize: 280,
      mobileSize: 195,
      darkBg: true,
      ctaBg: "#3D1208",
      ctaColor: "#FFE8D8",
      edicao: "EDIÇÃO FIXA",
      sub: "Calda no ponto e cremosidade perfeita.",
      floats: [
        { img: "gota-calda.webp", layer: "back", dx: 240, dy: 230, mx: 150, my: 430, size: 115, mSize: 82, rot: -16 },
        { img: "gota-calda.webp", layer: "back", dx: 1660, dy: 250, mx: 920, my: 440, size: 125, mSize: 86, rot: 22 },
        { img: "gota-calda.webp", layer: "mid", dx: 450, dy: 720, mx: 210, my: 1210, size: 155, mSize: 108, rot: 14 },
        { img: "colher.webp", layer: "mid", dx: 1480, dy: 680, mx: 865, my: 1180, size: 195, mSize: 130, rot: -26 },
        { img: "gota-calda.webp", layer: "front", dx: 210, dy: 530, mx: 140, my: 930, size: 235, mSize: 145, rot: -20 }
      ]
    },
    {
      id: 1,
      nome: "Café",
      img: "img/copos/cafe.webp",
      isWide: false,
      textColor: "#6A2E1B",
      desktopSize: 470,
      mobileSize: 340,
      darkBg: true,
      ctaBg: "#DE6E18",
      ctaColor: "#FFE8D8",
      edicao: "EDIÇÃO FIXA",
      sub: "Intenso na medida, cremoso e viciante.",
      floats: [
        { img: "graos-cafe.webp", layer: "back", dx: 250, dy: 230, mx: 150, my: 430, size: 120, mSize: 86, rot: 18 },
        { img: "graos-cafe.webp", layer: "back", dx: 1650, dy: 270, mx: 920, my: 450, size: 110, mSize: 80, rot: -24 },
        { img: "gota-calda.webp", layer: "mid", dx: 430, dy: 740, mx: 210, my: 1215, size: 145, mSize: 102, rot: -12 },
        { img: "colher.webp", layer: "mid", dx: 1510, dy: 690, mx: 870, my: 1180, size: 190, mSize: 126, rot: 28 },
        { img: "graos-cafe.webp", layer: "front", dx: 220, dy: 520, mx: 140, my: 920, size: 240, mSize: 148, rot: -15 },
        { img: "graos-cafe.webp", layer: "front", dx: 1700, dy: 560, mx: 940, my: 940, size: 225, mSize: 136, rot: 26 }
      ]
    },
    {
      id: 2,
      nome: "Duo",
      img: "img/copos/duo.webp",
      isWide: false,
      textColor: "#FFE8D8",
      desktopSize: 520,
      mobileSize: 380,
      darkBg: false,
      ctaBg: "#3D1208",
      ctaColor: "#FFE8D8",
      edicao: "EDIÇÃO FIXA",
      sub: "Metade chocolate nobre, metade pudim tradicional.",
      floats: [
        { img: "chocolate.webp", layer: "back", dx: 260, dy: 240, mx: 155, my: 435, size: 120, mSize: 86, rot: -20 },
        { img: "gota-calda.webp", layer: "back", dx: 1650, dy: 245, mx: 915, my: 440, size: 112, mSize: 80, rot: 16 },
        { img: "chocolate.webp", layer: "mid", dx: 440, dy: 730, mx: 215, my: 1215, size: 160, mSize: 112, rot: 15 },
        { img: "colher.webp", layer: "mid", dx: 1495, dy: 700, mx: 870, my: 1185, size: 190, mSize: 128, rot: -24 },
        { img: "chocolate.webp", layer: "front", dx: 205, dy: 530, mx: 145, my: 920, size: 235, mSize: 146, rot: 22 },
        { img: "gota-calda.webp", layer: "front", dx: 1700, dy: 540, mx: 935, my: 940, size: 215, mSize: 132, rot: -18 }
      ]
    },
    {
      id: 3,
      nome: "Morango",
      img: "img/copos/morango.webp",
      isWide: true,
      textColor: "#E58AA0",
      desktopSize: 350,
      mobileSize: 245,
      darkBg: true,
      ctaBg: "#3D1208",
      ctaColor: "#FFE8D8",
      edicao: "EDIÇÃO FIXA",
      sub: "Pudim de Ninho com geleia artesanal de morango.",
      floats: [
        { img: "morango.webp", layer: "back", dx: 250, dy: 230, mx: 150, my: 430, size: 125, mSize: 88, rot: -18 },
        { img: "folha.webp", layer: "back", dx: 1655, dy: 255, mx: 920, my: 445, size: 120, mSize: 86, rot: 25 },
        { img: "morango.webp", layer: "mid", dx: 425, dy: 735, mx: 205, my: 1215, size: 165, mSize: 112, rot: 14 },
        { img: "gota-calda.webp", layer: "mid", dx: 1505, dy: 710, mx: 870, my: 1190, size: 108, mSize: 80, rot: -14 },
        { img: "morango.webp", layer: "front", dx: 210, dy: 530, mx: 140, my: 925, size: 235, mSize: 145, rot: 20 },
        { img: "morango.webp", layer: "front", dx: 1705, dy: 525, mx: 940, my: 935, size: 215, mSize: 135, rot: -22 }
      ]
    },
    {
      id: 4,
      nome: "Nutella",
      img: "img/copos/nutella.webp",
      isWide: false,
      textColor: "#8F4040",
      desktopSize: 390,
      mobileSize: 270,
      darkBg: true,
      ctaBg: "#DE6E18",
      ctaColor: "#FFE8D8",
      edicao: "EDIÇÃO FIXA",
      sub: "Muita Nutella. Sem miséria.",
      floats: [
        { img: "avelas.webp", layer: "back", dx: 255, dy: 235, mx: 150, my: 430, size: 120, mSize: 84, rot: 14 },
        { img: "chocolate.webp", layer: "back", dx: 1650, dy: 255, mx: 915, my: 445, size: 118, mSize: 82, rot: -18 },
        { img: "avelas.webp", layer: "mid", dx: 435, dy: 730, mx: 205, my: 1215, size: 165, mSize: 112, rot: -15 },
        { img: "gota-calda.webp", layer: "mid", dx: 1500, dy: 705, mx: 875, my: 1185, size: 140, mSize: 98, rot: 18 },
        { img: "chocolate.webp", layer: "front", dx: 210, dy: 535, mx: 140, my: 925, size: 235, mSize: 146, rot: -20 },
        { img: "avelas.webp", layer: "front", dx: 1700, dy: 530, mx: 940, my: 935, size: 225, mSize: 136, rot: 22 }
      ]
    },
    {
      id: 5,
      nome: "Cocada",
      img: "img/copos/cocada.webp",
      isWide: true,
      textColor: "#E3A86B",
      desktopSize: 400,
      mobileSize: 280,
      darkBg: false,
      ctaBg: "#3D1208",
      ctaColor: "#FFE8D8",
      edicao: "EDIÇÃO LIMITADA",
      sub: "O sabor mais nordestino, com coco artesanal.",
      floats: [
        { img: "coco.webp", layer: "back", dx: 245, dy: 235, mx: 150, my: 430, size: 125, mSize: 88, rot: -15 },
        { img: "folha.webp", layer: "back", dx: 1660, dy: 245, mx: 920, my: 440, size: 130, mSize: 90, rot: 20 },
        { img: "folha.webp", layer: "mid", dx: 425, dy: 735, mx: 205, my: 1215, size: 165, mSize: 114, rot: -22 },
        { img: "coco.webp", layer: "mid", dx: 1505, dy: 700, mx: 870, my: 1185, size: 175, mSize: 118, rot: 16 },
        { img: "coco.webp", layer: "front", dx: 205, dy: 530, mx: 140, my: 925, size: 235, mSize: 145, rot: 14 },
        { img: "folha.webp", layer: "front", dx: 1705, dy: 535, mx: 940, my: 935, size: 225, mSize: 138, rot: -24 }
      ]
    }
  ];

  // Referências DOM
  const viewport = document.getElementById("viewport");
  const stage = document.getElementById("stage");
  const siteNav = document.getElementById("site-nav");
  const navLogoDark = siteNav.querySelector(".nav-logo-dark");
  const navLogoLight = siteNav.querySelector(".nav-logo-light");
  const navCta = siteNav.querySelector(".nav-cta");
  const navLogoWrap = siteNav.querySelector(".nav-logo"); // some no hero (que já tem a logo grande)
  const navHamburger = document.getElementById("nav-hamburger");
  const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
  const mobileNavClose = document.getElementById("mobile-nav-close");
  const navActiveTargets = gsap.utils.toArray(".nav-link, .nav-cta, .mobile-nav-link, .mobile-nav-cta");
  const navStepTriggers = gsap.utils.toArray("[data-nav-step]");
  const copo = document.getElementById("copo");
  const copoMouse = copo.querySelector(".copo-mouse");
  const copoBob = copo.querySelector(".copo-bob");
  const copoShadow = document.getElementById("copo-shadow");
  const portalBack = document.getElementById("portal-back");
  const portalFront = document.getElementById("portal-front");
  const bgPudim = document.getElementById("bg-pudim");
  const secHero = document.getElementById("sec-hero");
  const heroContent = document.getElementById("hero-content");
  const heroLogo = document.querySelector(".hero-logo");
  const heroWords = gsap.utils.toArray(".hero-title .word");
  const heroSub = document.querySelector(".hero-sub");
  const heroCta = document.querySelector(".hero-cta");
  const heroXadrez = document.getElementById("hero-xadrez");
  const secPudim = document.getElementById("sec-pudim");
  const pudimEyebrow = document.querySelector(".pudim-eyebrow");
  const pudimTitle = document.querySelector(".pudim-title");
  const pudimParagraphs = gsap.utils.toArray(".pudim-p");
  const pudimSign = document.querySelector(".pudim-sign");
  const pudimFloatsWrap = document.getElementById("pudim-floats");
  const saborUi = document.getElementById("sabor-ui");
  const saborCta = document.querySelector(".sabor-cta");
  const saborEdicoes = document.getElementById("sabor-edicoes");
  const saborFloatsBack = document.getElementById("sabor-floats-back");
  const saborTextsBg = document.getElementById("sabor-texts-bg");
  const saborFloatsMid = document.getElementById("sabor-floats-mid");
  const saborCoposWrap = document.getElementById("sabor-copos");
  const saborFloatsFront = document.getElementById("sabor-floats-front");
  const saborSubs = document.getElementById("sabor-subs");
  const saborCounters = document.getElementById("sabor-counters");
  const navDotsWrap = document.getElementById("nav-dots");
  const navDots = gsap.utils.toArray(".nav-dot");

  // Referências das seções 4 a 9
  const bgSecs = [4, 5, 6, 7, 8, 9].map((n) => document.getElementById("bg-sec-" + n));
  const sec4 = document.getElementById("sec-4");
  const s4HeadEls = gsap.utils.toArray("#sec-4 .sec-eyebrow, #sec-4 .sec-title");
  const s4CopoInner = document.querySelector(".sec4-copo-inner");
  const s4Prato = document.querySelector(".sec4-prato-box");
  const s4TextEls = gsap.utils.toArray("#sec-4 .sec4-sub, #sec-4 .sec4-desc");
  const sec4FloatsWrap = document.getElementById("sec4-floats");

  const sec5 = document.getElementById("sec-5");
  const s5HeadEls = gsap.utils.toArray("#sec-5 .sec-eyebrow, #sec-5 .sec-title");
  const s5PacocaVis = document.querySelector(".sec5-circle");
  const s5CocadaVis = document.querySelector(".sec5-copo-wrap");
  const s5TextEls = gsap.utils.toArray("#sec-5 .sec5-name, #sec-5 .sec5-desc, #sec-5 .sec5-foot");
  const sec5FloatsWrap = document.getElementById("sec5-floats");

  const sec6 = document.getElementById("sec-6");
  const s6Giant = document.querySelector(".sec6-giant");
  const s6HeadEls = gsap.utils.toArray("#sec-6 .sec-eyebrow, #sec-6 .sec-title");
  const s6Stars = gsap.utils.toArray(".sec6-star");
  const s6Cards = gsap.utils.toArray(".sec6-card");

  const sec7 = document.getElementById("sec-7");
  const s7Band = document.querySelector(".sec7-band");
  const s7Seal = document.querySelector(".sec7-seal");
  const s7HeadEls = gsap.utils.toArray("#sec-7 .sec-eyebrow, #sec-7 .sec7-title");
  const s7Paragraphs = gsap.utils.toArray(".sec7-p");

  const sec8 = document.getElementById("sec-8");
  const s8HeadEls = gsap.utils.toArray("#sec-8 .sec-eyebrow, #sec-8 .sec-title");
  const s8Items = gsap.utils.toArray(".sec8-item");
  const s8Foot = document.querySelector(".sec8-foot");

  const sec9 = document.getElementById("sec-9");
  const s9TitleParts = gsap.utils.toArray(".sec9-tpart");
  const s9Cols = gsap.utils.toArray(".sec9-col");
  const s9Footer = document.querySelector(".sec9-footer");
  const footerBand = document.getElementById("footer-band");
  const s9ElipseBack = document.querySelector(".sec9-elipse-back");
  const s9ElipseFront = document.querySelector(".sec9-elipse-front");
  const s9Copo = document.querySelector(".sec9-copo");
  const s9CopoMouse = document.querySelector(".sec9-copo-mouse");

  s7Paragraphs.forEach((p) => {
    p.dataset.rawHtml = p.innerHTML;
  });

  function buildParagraphParts(paragraphs, splitSentencesOnly) {
    const allLines = [];
    paragraphs.forEach((p) => {
      p.innerHTML = p.dataset.rawHtml;
      Array.from(p.childNodes).forEach((node) => {
        if (node.nodeType === 3) {
          const rx = splitSentencesOnly ? /(?<=[.:])(?=\s)/ : /(?<=[.:,])(?=\s)/;
          const partes = node.textContent.split(rx).filter((t) => t.length > 0);
          const frag = document.createDocumentFragment();
          partes.forEach((txt) => {
            const s = document.createElement("span");
            s.className = "prose-line";
            s.textContent = txt;
            frag.appendChild(s);
            allLines.push(s);
          });
          node.replaceWith(frag);
        } else if (node.nodeType === 1) {
          node.classList.add("prose-line");
          allLines.push(node);
        }
      });
    });
    return allLines;
  }

  // Guarda o HTML original dos parágrafos da seção 2 para split responsivo em linhas
  pudimParagraphs.forEach((p) => {
    p.dataset.rawHtml = p.innerHTML;
  });

  // Divide cada parágrafo em trechos INLINE (frases/destaques) que entram em sequência.
  // Não mede linhas: a quebra de linha fica natural do navegador (sem quebras forçadas).
  function buildPudimLines() {
    const allLines = [];
    pudimParagraphs.forEach((p) => {
      p.innerHTML = p.dataset.rawHtml;
      Array.from(p.childNodes).forEach((node) => {
        if (node.nodeType === 3) {
          // texto puro: separa em frases curtas para o efeito sequencial, mantendo os espaços
          const partes = node.textContent.split(/(?<=[.:,])(?=\s)/).filter((t) => t.length > 0);
          const frag = document.createDocumentFragment();
          partes.forEach((txt) => {
            const s = document.createElement("span");
            s.className = "prose-line";
            s.textContent = txt;
            frag.appendChild(s);
            allLines.push(s);
          });
          node.replaceWith(frag);
        } else if (node.nodeType === 1) {
          node.classList.add("prose-line");
          allLines.push(node);
        }
      });
    });
    return allLines;
  }

  // (versão anterior com medição de linhas, mantida só como referência e não usada)
  function buildPudimLinesMedido() {
    const allLines = [];
    pudimParagraphs.forEach((p) => {
      p.innerHTML = p.dataset.rawHtml;
      const tokens = [];
      Array.from(p.childNodes).forEach((node) => {
        const isEm = node.nodeType === 1 && node.tagName === "EM";
        const text = node.textContent || "";
        text.trim().split(/\s+/).forEach((word) => {
          if (word) tokens.push({ word, isEm });
        });
      });

      p.innerHTML = "";
      const probes = tokens.map((tok, i) => {
        const span = document.createElement("span");
        span.textContent = tok.word;
        if (tok.isEm) {
          span.style.fontFamily = "var(--font-serif)";
          span.style.fontStyle = "italic";
          span.style.fontSize = "1.07em";
        }
        p.appendChild(span);
        if (i < tokens.length - 1) p.appendChild(document.createTextNode(" "));
        return { span, tok };
      });

      const lineGroups = [];
      probes.forEach(({ span, tok }) => {
        const top = span.offsetTop;
        const last = lineGroups[lineGroups.length - 1];
        if (!last || Math.abs(top - last.top) > 8) {
          lineGroups.push({ top, tokens: [tok] });
        } else {
          last.tokens.push(tok);
        }
      });

      p.innerHTML = "";
      lineGroups.forEach((grp) => {
        const lineEl = document.createElement("span");
        lineEl.className = "prose-line";
        let curEm = null;
        grp.tokens.forEach((tok, idx) => {
          if (idx > 0) {
            if (tok.isEm && curEm) {
              curEm.appendChild(document.createTextNode(" "));
            } else {
              curEm = null;
              lineEl.appendChild(document.createTextNode(" "));
            }
          }
          if (tok.isEm) {
            if (!curEm) {
              curEm = document.createElement("em");
              lineEl.appendChild(curEm);
            }
            curEm.appendChild(document.createTextNode(tok.word));
          } else {
            curEm = null;
            lineEl.appendChild(document.createTextNode(tok.word));
          }
        });
        p.appendChild(lineEl);
        allLines.push(lineEl);
      });
    });
    return allLines;
  }

  // Variáveis de layout (Desktop 1920x1080 | Mobile 1080x1920)
  function getLayout(mobile) {
    if (mobile) {
      return {
        w: 1080,
        h: 1920,
        cx: 540,
        cy: 1000,
        heroCupStartY: 1460,
        heroCupX: 540,
        heroCupY: 1330,
        heroCupScale: 1.125,
        portalX: 553,
        portalY: 1570,
        portalRot: -30,
        pudimCupX: 540,
        pudimCupY: 835,
        pudimCupScale: 1.18,
        pudimShadowY: 1240,
        carCupX: 540,
        carCupY: 1000,
        carCupWideY: 970,
        carCupScale: 1.218,
        carShadowY: 1388,
        maxGiantW: 960,
        giantSlide: 1120,
        heroExitX: -220,
        heroExitY: -120
      };
    }
    return {
      w: 1920,
      h: 1080,
      cx: 960,
      cy: 560,
      heroCupStartY: 680,
      heroCupX: 1335,
      heroCupY: 570,
      heroCupScale: 0.95,
      portalX: 1346,
      portalY: 773,
      portalRot: -30,
      pudimCupX: 760,
      pudimCupY: 540,
      pudimCupScale: 1.04,
      pudimShadowY: 880,
      carCupX: 960,
      carCupY: 580,
      carCupWideY: 550,
      carCupScale: 1.094,
      carShadowY: 928,
      maxGiantW: 1560,
      giantSlide: 1780,
      heroExitX: -280,
      heroExitY: 0
    };
  }

  function fitStage() {
    const L = getLayout(isMobile);
    // O palco fica SEMPRE abaixo do menu (que é transparente): assim nenhum conteúdo passa por trás dos links.
    // Os fundos ocupam a janela inteira (#bg-stack), então não há faixa nem emenda. Usa a altura REAL do menu.
    const navH = Math.ceil(siteNav.getBoundingClientRect().height) || (isMobile ? 64 : 68);
    viewport.classList.toggle("is-mobile", isMobile);
    stage.classList.toggle("is-mobile", isMobile);
    const availW = window.innerWidth;
    const availH = Math.max(1, window.innerHeight - navH);
    const s = Math.min(availW / L.w, availH / L.h);
    stage.style.top = (navH + availH / 2) + "px";
    stage.style.transform = "scale(" + s + ")";
    // Camada de fundos: faixa xadrez do hero e base do rodapé acompanham a escala do palco
    const stageBottom = navH + availH / 2 + (L.h * s) / 2;
    const extra = Math.max(0, window.innerHeight - stageBottom);
    const stripStage = isMobile ? 52 : 64;
    const footEl = document.querySelector(".sec9-footer");
    const footStage = footEl ? footEl.offsetHeight : (isMobile ? 600 : 220); // altura REAL do rodapé (unidades do palco)
    viewport.style.setProperty("--strip-h", (stripStage * s) + "px");
    viewport.style.setProperty("--strip-bottom", "0px"); // faixa colada na base da janela
    viewport.style.setProperty("--footer-h", (footStage * s + extra) + "px");
    const pv = document.getElementById("xadrez-pat-v");
    if (pv) pv.setAttribute("patternTransform", "scale(" + s + ")");
  }

  // Registros para idle e mouse parallax
  const idleItems = [];
  const mouseTargets = [];
  const LAYER_DEPTH = { back: 0.015, mid: 0.035, front: 0.07 };

  function registerMouseTarget(el, factor, withTilt) {
    const target = {
      el: el,
      factor: factor,
      withTilt: !!withTilt,
      qx: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
      qy: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
      qrx: withTilt ? gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3.out" }) : null,
      qry: withTilt ? gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3.out" }) : null
    };
    mouseTargets.push(target);
    return target;
  }

  registerMouseTarget(copoMouse, 0.012, true);
  registerMouseTarget(s6Giant, 0.008, false);
  registerMouseTarget(s9CopoMouse, 0.012, true);

  // Helper compartilhado para criar flutuantes reais com parallax e idle
  function createSectionFloats(wrap, specs) {
    return specs.map((spec) => {
      const outer = document.createElement("div");
      outer.className = "pudim-float";
      const mouseWrap = document.createElement("span");
      mouseWrap.className = "flut-mouse";
      const inner = document.createElement("span");
      inner.className = "flut-inner";
      const img = document.createElement("img");
      img.className = "flut-img";
      img.src = "img/flutuantes/" + spec.img;
      img.alt = "";
      img.draggable = false;
      inner.appendChild(img);
      mouseWrap.appendChild(inner);
      outer.appendChild(mouseWrap);
      wrap.appendChild(outer);

      registerMouseTarget(mouseWrap, LAYER_DEPTH[spec.layer || "mid"], false);
      idleItems.push({ el: inner, ampY: spec.ampY, ampR: spec.ampR, freq: spec.freq, phase: spec.phase });
      return { outer, img, spec };
    });
  }

  // Flutuantes da Seção 2 ("O pudim" — gota-calda e colher)
  const pudimFloatSpecs = [
    { img: "gota-calda.webp", layer: "mid", dx: 470, dy: 250, mx: 150, my: 465, size: 118, mSize: 84, rot: -15, ampY: 10, ampR: 5, freq: 1.5, phase: 0.3 },
    { img: "colher.webp", layer: "mid", dx: 950, dy: 250, mx: 920, my: 495, size: 170, mSize: 118, rot: 22, ampY: 9, ampR: 7, freq: 1.35, phase: 1.4 },
    { img: "gota-calda.webp", layer: "mid", dx: 455, dy: 635, mx: 155, my: 985, size: 138, mSize: 96, rot: 14, ampY: 11, ampR: -6, freq: 1.6, phase: 2.5 },
    { img: "gota-calda.webp", layer: "mid", dx: 960, dy: 730, mx: 925, my: 970, size: 105, mSize: 78, rot: -12, ampY: 8, ampR: 8, freq: 1.7, phase: 3.7 }
  ];

  const pudimFloatItems = createSectionFloats(pudimFloatsWrap, pudimFloatSpecs);

  // Flutuantes da Seção 4 ("Copo e 1 kg") e Seção 5 ("Edição limitada")
  const sec4FloatItems = createSectionFloats(sec4FloatsWrap, [
    { img: "gota-calda.webp", layer: "back", dx: 210, dy: 260, mx: 135, my: 440, size: 110, mSize: 78, rot: -18, ampY: 9, ampR: 5, freq: 1.3, phase: 0.4 },
    { img: "colher.webp", layer: "mid", dx: 1710, dy: 300, mx: 930, my: 480, size: 175, mSize: 116, rot: 24, ampY: 11, ampR: -7, freq: 1.45, phase: 1.8 },
    { img: "gota-calda.webp", layer: "mid", dx: 225, dy: 780, mx: 145, my: 1260, size: 135, mSize: 90, rot: 16, ampY: 10, ampR: 6, freq: 1.6, phase: 2.9 },
    { img: "gota-calda.webp", layer: "front", dx: 1720, dy: 790, mx: 935, my: 1320, size: 155, mSize: 95, rot: -14, ampY: 13, ampR: 8, freq: 1.7, phase: 4.1 }
  ]);

  const sec5FloatItems = createSectionFloats(sec5FloatsWrap, [
    { img: "coco.webp", layer: "back", dx: 210, dy: 250, mx: 135, my: 440, size: 125, mSize: 84, rot: -16, ampY: 9, ampR: 6, freq: 1.35, phase: 0.7 },
    { img: "folha.webp", layer: "mid", dx: 1705, dy: 280, mx: 935, my: 465, size: 155, mSize: 105, rot: 22, ampY: 11, ampR: -7, freq: 1.5, phase: 1.9 },
    { img: "folha.webp", layer: "mid", dx: 215, dy: 775, mx: 140, my: 1245, size: 145, mSize: 98, rot: -20, ampY: 10, ampR: 7, freq: 1.4, phase: 3.1 },
    { img: "coco.webp", layer: "front", dx: 1715, dy: 790, mx: 935, my: 1315, size: 160, mSize: 100, rot: 15, ampY: 12, ampR: -6, freq: 1.6, phase: 4.4 }
  ]);

  // Monta os 6 sabores (copos, textos gigantes, edições, subtítulos, contadores e flutuantes)
  const flavorDom = FLAVORS.map((f, idx) => {
    const bgEl = document.getElementById("bg-flavor-" + idx);

    // Copo próprio para sabores 2..6 (sabor 1 usa #copo)
    let cupObj = null;
    if (idx > 0) {
      const cupOuter = document.createElement("div");
      cupOuter.className = "sabor-copo" + (f.isWide ? " is-wide" : "");
      cupOuter.id = "copo-sabor-" + idx;
      const cMouse = document.createElement("div");
      cMouse.className = "copo-mouse";
      const cBob = document.createElement("div");
      cBob.className = "copo-bob";
      const cImg = document.createElement("img");
      cImg.src = f.img;
      cImg.alt = "Pudim Caramellê " + f.nome;
      cImg.draggable = false;
      cBob.appendChild(cImg);
      cMouse.appendChild(cBob);
      cupOuter.appendChild(cMouse);
      saborCoposWrap.appendChild(cupOuter);

      registerMouseTarget(cMouse, 0.012, true);
      idleItems.push({ el: cBob, ampY: 8, ampR: 1.4, freq: 2.1, phase: idx * 0.5, isCup: true });
      cupObj = { outer: cupOuter };
    }

    // Texto gigante atrás do copo
    const giant = document.createElement("div");
    giant.className = "giant-word";
    giant.id = "giant-" + idx;
    const giantMouse = document.createElement("span");
    giantMouse.className = "giant-word-mouse";
    const giantInner = document.createElement("span");
    giantInner.className = "giant-word-inner";
    giantInner.textContent = f.nome;
    giantMouse.appendChild(giantInner);
    giant.appendChild(giantMouse);
    giant.style.color = f.textColor;
    saborTextsBg.appendChild(giant);
    registerMouseTarget(giantMouse, 0.008, false);

    // Etiqueta de edição (texto simples maiúsculo espaçado, sem caixa)
    const edicao = document.createElement("span");
    edicao.className = "sabor-edicao-tag";
    edicao.textContent = idx === 5 ? "Edição limitada" : "Edição fixa";
    edicao.style.color = f.darkBg ? "#FFE8D8" : "#3D1208";
    saborEdicoes.appendChild(edicao);

    // Subtítulo
    const sub = document.createElement("div");
    sub.className = "sabor-sub" + (f.darkBg ? "" : " is-dark-text");
    sub.id = "sub-" + idx;
    sub.textContent = f.sub;
    saborSubs.appendChild(sub);

    // Contador tipográfico editorial: 01 —— 06
    const counter = document.createElement("div");
    counter.className = "sabor-counter" + (f.darkBg ? "" : " is-dark-text");
    counter.id = "counter-" + idx;
    counter.innerHTML =
      `<span class="counter-num">0${idx + 1}</span>` +
      `<span class="counter-line" aria-hidden="true"></span>` +
      `<span class="counter-total">0${FLAVORS.length}</span>`;
    saborCounters.appendChild(counter);

    // Flutuantes em 3 camadas
    const layerParents = {
      back: document.createElement("div"),
      mid: document.createElement("div"),
      front: document.createElement("div")
    };
    layerParents.back.className = "flavor-layer layer-back";
    layerParents.mid.className = "flavor-layer layer-mid";
    layerParents.front.className = "flavor-layer layer-front";
    saborFloatsBack.appendChild(layerParents.back);
    saborFloatsMid.appendChild(layerParents.mid);
    saborFloatsFront.appendChild(layerParents.front);

    const floatItems = f.floats.map((spec, fIdx) => {
      const outer = document.createElement("div");
      outer.className = "flut-item";
      const mouseWrap = document.createElement("span");
      mouseWrap.className = "flut-mouse";
      const inner = document.createElement("span");
      inner.className = "flut-inner";
      const img = document.createElement("img");
      img.className = "flut-img";
      img.src = "img/flutuantes/" + spec.img;
      img.alt = "";
      img.draggable = false;
      inner.appendChild(img);
      mouseWrap.appendChild(inner);
      outer.appendChild(mouseWrap);
      layerParents[spec.layer].appendChild(outer);

      registerMouseTarget(mouseWrap, LAYER_DEPTH[spec.layer], false);
      idleItems.push({
        el: inner,
        ampY: spec.layer === "front" ? 15 : spec.layer === "mid" ? 11 : 8,
        ampR: spec.layer === "front" ? 8 : 5,
        freq: 1.2 + (fIdx % 3) * 0.25,
        phase: idx * 0.9 + fIdx * 1.15
      });

      return { outer, img, spec };
    });

    return {
      bgEl,
      cupObj,
      giant,
      giantInner,
      edicao,
      sub,
      counter,
      floatItems,
      flavor: f
    };
  });

  // Recalibra tamanhos de fontes gigantes e flutuantes conforme desktop/mobile
  function applyResponsiveSizing(L) {
    flavorDom.forEach((dom) => {
      const f = dom.flavor;
      const baseFont = isMobile ? f.mobileSize : f.desktopSize;
      dom.giant.style.fontSize = baseFont + "px";
      const w = dom.giantInner.offsetWidth;
      if (w > L.maxGiantW && w > 0) {
        dom.giant.style.fontSize = Math.floor(baseFont * (L.maxGiantW / w)) + "px";
      }
      dom.floatItems.forEach((it, idx) => {
        const px = isMobile ? it.spec.mSize : it.spec.size;
        it.outer.style.width = px + "px";
        it.outer.style.marginLeft = -px / 2 + "px";
        it.outer.style.marginTop = -px / 2 + "px";
        // No mobile mostra 4-5 flutuantes (oculta o 6º se existir)
        it.outer.style.display = isMobile && idx >= 5 ? "none" : "block";
      });
    });

    [pudimFloatItems, sec4FloatItems, sec5FloatItems].forEach((group) => {
      group.forEach((it) => {
        const px = isMobile ? it.spec.mSize : it.spec.size;
        it.outer.style.width = px + "px";
        it.outer.style.marginLeft = -px / 2 + "px";
        it.outer.style.marginTop = -px / 2 + "px";
      });
    });
  }

  // Aplica flutuação senoidal baseada em window.__idleT
  function applyIdle() {
    if (PREFERS_REDUCED) return;
    const t = window.__idleT || 0;
    const curT = tl ? tl.time() : 0;
    const cupAmp = curT >= 1.65 ? 7 : 0;

    gsap.set(copoBob, {
      y: Math.sin(t * 2.1) * cupAmp,
      rotation: Math.sin(t * 1.4) * (cupAmp > 0 ? 1.3 : 0)
    });

    for (let i = 0; i < idleItems.length; i++) {
      const it = idleItems[i];
      const ampY = it.isCup ? cupAmp : it.ampY;
      const ampR = it.isCup ? (cupAmp > 0 ? 1.3 : 0) : it.ampR;
      gsap.set(it.el, {
        y: Math.sin(t * it.freq + it.phase) * ampY,
        rotation: Math.cos(t * (it.freq * 0.8) + it.phase) * ampR
      });
    }
  }

  // Aplica parallax de mouse (em mobile fica zerado; em ?render=1 usa window.__mouse síncrono)
  function applyMouseParallax() {
    if (isMobile || PREFERS_REDUCED) {
      for (let i = 0; i < mouseTargets.length; i++) {
        const mt = mouseTargets[i];
        gsap.set(mt.el, { x: 0, y: 0, rotationX: 0, rotationY: 0 });
      }
      return;
    }

    const mx = window.__mouse && typeof window.__mouse.x === "number" ? window.__mouse.x : 960;
    const my = window.__mouse && typeof window.__mouse.y === "number" ? window.__mouse.y : 540;
    const offX = mx - 960;
    const offY = my - 540;

    for (let i = 0; i < mouseTargets.length; i++) {
      const mt = mouseTargets[i];
      const dx = -offX * mt.factor;
      const dy = -offY * mt.factor;
      const rx = mt.withTilt ? (offY / 540) * 4 : 0;
      const ry = mt.withTilt ? -(offX / 960) * 4 : 0;

      if (IS_RENDER) {
        gsap.set(mt.el, { x: dx, y: dy, rotationX: rx, rotationY: ry });
      } else {
        mt.qx(dx);
        mt.qy(dy);
        if (mt.withTilt) {
          mt.qrx(rx);
          mt.qry(ry);
        }
      }
    }
  }

  function getNavGroup(step) {
    if (step >= 2 && step <= 7) return 2;
    if (step >= 8 && step <= 9) return 8;
    return step;
  }

  function syncUI(t) {
    let activeStep = 0;
    for (let i = 0; i < STEPS.length; i++) {
      if (t >= STEPS[i] - 0.9) activeStep = i;
    }
    for (let i = 0; i < navDots.length; i++) {
      navDots[i].classList.toggle("active", i === activeStep);
    }
    // Passos com fundo escuro usam pontos creme; fundos claros usam chocolate
    const isLightNav =
      activeStep === 13 ||
      (activeStep >= 2 && activeStep <= 7 && FLAVORS[activeStep - 2].darkBg);
    navDotsWrap.classList.toggle("is-light-nav", isLightNav);
    siteNav.classList.toggle("is-creme-bar", CREME_BAR_STEPS.has(activeStep));

    const activeGroup = getNavGroup(activeStep);
    for (let i = 0; i < navActiveTargets.length; i++) {
      const el = navActiveTargets[i];
      const targetStep = parseInt(el.getAttribute("data-nav-step"), 10);
      const isMatch = targetStep === activeGroup;
      el.classList.toggle("active", isMatch);
      if (isMatch) {
        el.setAttribute("aria-current", "page");
      } else {
        el.removeAttribute("aria-current");
      }
    }
  }

  // =========================================================================
  // CONSTRUÇÃO DA TIMELINE MESTRA PAUSADA (0 a 28s)
  // =========================================================================
  let tl = null;

  function buildTimeline() {
    if (tl) tl.kill();
    const L = getLayout(isMobile);
    fitStage();
    applyResponsiveSizing(L);
    const pudimLines = buildPudimLines();
    const sec7Lines = buildParagraphParts(s7Paragraphs, true);

    tl = gsap.timeline({
      paused: true,
      onUpdate: function () {
        applyIdle();
        if (IS_RENDER) applyMouseParallax();
        syncUI(tl.time());
      }
    });

    // Estados iniciais em t = 0
    gsap.set(viewport, { backgroundColor: STEP_BG_COLORS[0] });
    gsap.set(siteNav, { color: NAV_TONES[0].fg });
    gsap.set(navCta, { backgroundColor: NAV_TONES[0].cta, color: NAV_TONES[0].ctaFg });
    gsap.set(navLogoDark, { opacity: NAV_TONES[0].logoDark, filter: NAV_TONES[0].logoFilter });
    gsap.set(navLogoLight, { opacity: 1 - NAV_TONES[0].logoDark });
    gsap.set(navLogoWrap, { opacity: 0 });

    gsap.set(secHero, { autoAlpha: 1 });
    gsap.set(heroContent, { x: 0, y: 0, opacity: 1 });
    gsap.set(heroXadrez, { y: 0, opacity: 1 });
    gsap.set(heroLogo, { y: 42, opacity: 0 });
    gsap.set(heroWords, { y: 42, opacity: 0 });
    gsap.set([heroSub, heroCta], { y: 26, opacity: 0 });

    gsap.set([portalBack, portalFront], {
      x: L.portalX,
      y: L.portalY,
      rotation: L.portalRot,
      scale: 0,
      opacity: 0
    });

    gsap.set(copo, {
      x: L.heroCupX,
      y: L.heroCupStartY,
      rotation: 0,
      scaleX: L.heroCupScale * 0.42,
      scaleY: L.heroCupScale * 0.42,
      opacity: 0
    });
    gsap.set(copoShadow, { x: L.pudimCupX, y: L.pudimShadowY, scaleX: 1, opacity: 0 });

    gsap.set(bgPudim, { opacity: 0 });
    gsap.set(secPudim, { autoAlpha: 0 });
    gsap.set([pudimEyebrow, pudimTitle], { x: 0, y: 24, opacity: 0 });
    gsap.set(pudimLines, { x: 0, y: 18, opacity: 0 });
    gsap.set(pudimSign, { x: 0, y: 18, opacity: 0 });

    pudimFloatItems.forEach((it) => {
      const x = isMobile ? it.spec.mx : it.spec.dx;
      const y = isMobile ? it.spec.my : it.spec.dy;
      gsap.set(it.outer, { x: x, y: y, rotation: it.spec.rot, scale: 0, opacity: 0 });
    });

    gsap.set(saborUi, { autoAlpha: 0 });
    gsap.set(saborCta, { backgroundColor: FLAVORS[0].ctaBg, color: FLAVORS[0].ctaColor });

    // Estados iniciais das seções 4 a 9
    bgSecs.forEach((el) => gsap.set(el, { clipPath: `circle(0px at 50% 52%)` }));
    gsap.set([sec4, sec5, sec6, sec7, sec8, sec9], { autoAlpha: 0 });

    gsap.set(s4HeadEls, { y: 24, opacity: 0 });
    gsap.set(s4CopoInner, { y: 40, scale: 0.92, rotation: -10, opacity: 0 });
    gsap.set(s4Prato, { y: 40, scale: 0.92, opacity: 0 });
    gsap.set(s4TextEls, { y: 20, opacity: 0 });
    sec4FloatItems.forEach((it) => {
      const x = isMobile ? it.spec.mx : it.spec.dx;
      const y = isMobile ? it.spec.my : it.spec.dy;
      gsap.set(it.outer, { x: x, y: y, rotation: it.spec.rot, scale: 0, opacity: 0 });
    });

    gsap.set(s5HeadEls, { y: 24, opacity: 0 });
    gsap.set(s5PacocaVis, { x: -80, opacity: 0 });
    gsap.set(s5CocadaVis, { x: 80, opacity: 0 });
    gsap.set(s5TextEls, { y: 20, opacity: 0 });
    sec5FloatItems.forEach((it) => {
      const x = isMobile ? it.spec.mx : it.spec.dx;
      const y = isMobile ? it.spec.my : it.spec.dy;
      gsap.set(it.outer, { x: x, y: y, rotation: it.spec.rot, scale: 0, opacity: 0 });
    });

    gsap.set(s6Giant, { scale: 0.92, opacity: 0 });
    gsap.set(s6HeadEls, { y: 24, opacity: 0 });
    gsap.set(s6Stars, { scale: 0.7, opacity: 0.16 });
    gsap.set(s6Cards, { y: 24, opacity: 0 });

    gsap.set(s7Band, { y: isMobile ? -260 : -1080 });
    gsap.set(s7Seal, { scale: 0.78, opacity: 0 });
    gsap.set(s7HeadEls, { y: 24, opacity: 0 });
    gsap.set(sec7Lines, { y: 18, opacity: 0 });

    gsap.set(s8HeadEls, { y: 24, opacity: 0 });
    gsap.set(s8Items, { y: 22, opacity: 0 });
    gsap.set(s8Foot, { y: 16, opacity: 0 });

    gsap.set(s9TitleParts, { y: 36, scale: 0.92, opacity: 0 });
    gsap.set(s9Cols, { y: 22, opacity: 0 });
    gsap.set(s9Footer, { y: 28, opacity: 0 });
    gsap.set(footerBand, { opacity: 0 });
    gsap.set([s9ElipseBack, s9ElipseFront], { rotation: -8, scale: 0.2, opacity: 0 });
    gsap.set(s9Copo, { y: 180, rotation: 0, scale: 0.7, opacity: 0 });

    flavorDom.forEach((dom, idx) => {
      gsap.set(dom.bgEl, { clipPath: `circle(0px at 50% 52%)` });
      gsap.set(dom.giant, { x: L.giantSlide, y: 0, opacity: 0 });
      gsap.set(dom.edicao, { y: 16, opacity: 0 });
      gsap.set(dom.sub, { y: 22, opacity: 0 });
      gsap.set(dom.counter, { opacity: 0, scale: 0.85 });

      if (dom.cupObj) {
        const restY = dom.flavor.isWide && isMobile
          ? L.carCupWideY
          : dom.flavor.isWide && !isMobile
            ? L.carCupWideY
            : L.carCupY;
        const dir = idx % 2 === 1 ? 1 : -1;
        gsap.set(dom.cupObj.outer, {
          x: L.carCupX + dir * 130,
          y: restY + 130,
          rotation: dir * 10,
          scale: 0.86,
          opacity: 0
        });
      }

      dom.floatItems.forEach((it) => {
        const x = isMobile ? it.spec.mx : it.spec.dx;
        const y = isMobile ? it.spec.my : it.spec.dy;
        gsap.set(it.outer, {
          x: x + 320,
          y: y,
          rotation: it.spec.rot,
          scale: 0.7,
          opacity: 0
        });
      });
    });

    const maxCircle = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight)); // cobre a janela inteira
    builtDiag = maxCircle;

    // Anima cor do #viewport e contraste da barra superior (#site-nav) em cada passo (reversível)
    function addEnvStepTransitions(dur) {
      tl.to(navLogoWrap, { opacity: 1, duration: dur, ease: "power1.inOut" }, 2.0);
      for (let stepIdx = 1; stepIdx < STEP_BG_COLORS.length; stepIdx++) {
        const tStart = stepIdx * 2.0;
        tl.to(
          viewport,
          { backgroundColor: STEP_BG_COLORS[stepIdx], duration: dur, ease: "power1.inOut" },
          tStart
        );
        const tone = NAV_TONES[stepIdx];
        const prev = NAV_TONES[stepIdx - 1];
        if (JSON.stringify(tone) !== JSON.stringify(prev)) {
          tl.to(siteNav, { color: tone.fg, duration: dur, ease: "power1.inOut" }, tStart)
            .to(navCta, { backgroundColor: tone.cta, color: tone.ctaFg, duration: dur, ease: "power1.inOut" }, tStart)
            .to(navLogoDark, { opacity: tone.logoDark, filter: tone.logoFilter, duration: dur * 0.65, ease: "power1.inOut" }, tStart)
            .to(navLogoLight, { opacity: 1 - tone.logoDark, duration: dur * 0.65, ease: "power1.inOut" }, tStart);
        }
      }
    }

    addEnvStepTransitions(PREFERS_REDUCED ? 0.3 : 0.6);

    if (PREFERS_REDUCED) {
      // Versão reduzida (crossfades simples de 0.3s, sem giros)
      tl.to([portalBack, portalFront], { scale: 1, opacity: 1, duration: 0.3 }, 0.1)
        .to(copo, { y: L.heroCupY, scaleX: L.heroCupScale, scaleY: L.heroCupScale, opacity: 1, duration: 0.3 }, 0.2)
        .to([heroLogo, heroWords, heroSub, heroCta], { y: 0, opacity: 1, stagger: 0.05, duration: 0.3 }, 0.35);

      tl.to([heroContent, heroXadrez, portalBack, portalFront], { opacity: 0, duration: 0.3 }, 2.0)
        .set(secHero, { autoAlpha: 0 }, 2.35)
        .to(bgPudim, { opacity: 1, duration: 0.3 }, 2.05)
        .to(copo, { x: L.pudimCupX, y: L.pudimCupY, rotation: -20, scaleX: L.pudimCupScale, scaleY: L.pudimCupScale, duration: 0.3 }, 2.1)
        .to(copoShadow, { opacity: 0.28, duration: 0.3 }, 2.1)
        .set(secPudim, { autoAlpha: 1 }, 2.15)
        .to([pudimEyebrow, pudimTitle, ...pudimLines, pudimSign], { y: 0, opacity: 1, duration: 0.3 }, 2.25)
        .to(pudimFloatItems.map((i) => i.outer), { scale: 1, opacity: 0.9, duration: 0.3 }, 2.3);

      tl.to([pudimEyebrow, pudimTitle, ...pudimLines, pudimSign, ...pudimFloatItems.map((i) => i.outer)], { opacity: 0, duration: 0.3 }, 4.0)
        .set(secPudim, { autoAlpha: 0 }, 4.35)
        .to(copo, { x: L.carCupX, y: L.carCupY, rotation: 0, scaleX: L.carCupScale, scaleY: L.carCupScale, duration: 0.3 }, 4.1)
        .to(copoShadow, { x: L.carCupX, y: L.carShadowY, opacity: 0.34, duration: 0.3 }, 4.1)
        .to(flavorDom[0].bgEl, { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 0.3 }, 4.1)
        .set(saborUi, { autoAlpha: 1 }, 4.2)
        .to(flavorDom[0].giant, { x: 0, opacity: 1, duration: 0.3 }, 4.25)
        .to([flavorDom[0].edicao, flavorDom[0].sub, flavorDom[0].counter], { opacity: 1, y: 0, scale: 1, duration: 0.3 }, 4.3);

      for (let i = 1; i < FLAVORS.length; i++) {
        const t0 = 4.0 + i * 2.0;
        const prev = flavorDom[i - 1];
        const curr = flavorDom[i];
        const prevCup = i === 1 ? copo : prev.cupObj.outer;
        const currCup = curr.cupObj.outer;
        const currRestY = curr.flavor.isWide ? L.carCupWideY : L.carCupY;

        tl.to([prev.giant, prev.edicao, prev.sub, prev.counter, prevCup], { opacity: 0, duration: 0.3 }, t0)
          .to(curr.bgEl, { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 0.3 }, t0)
          .to(saborCta, { backgroundColor: curr.flavor.ctaBg, color: curr.flavor.ctaColor, duration: 0.3 }, t0)
          .to(currCup, { x: L.carCupX, y: currRestY, rotation: 0, scale: 1, opacity: 1, duration: 0.3 }, t0 + 0.15)
          .to(curr.giant, { x: 0, opacity: 1, duration: 0.3 }, t0 + 0.15)
          .to([curr.edicao, curr.sub, curr.counter], { opacity: 1, y: 0, scale: 1, duration: 0.3 }, t0 + 0.2);
      }

      // Passos 8 a 13 (16 -> 28) em prefers-reduced-motion
      const cocadaDom = flavorDom[5];
      tl.to([cocadaDom.giant, cocadaDom.edicao, cocadaDom.sub, cocadaDom.counter, cocadaDom.cupObj.outer, copoShadow], { opacity: 0, duration: 0.3 }, 16.0)
        .set(saborUi, { autoAlpha: 0 }, 16.35)
        .to(bgSecs[0], { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 0.3 }, 16.05)
        .set(sec4, { autoAlpha: 1 }, 16.15)
        .to([s4HeadEls, s4CopoInner, s4Prato, s4TextEls], { y: 0, scale: 1, rotation: (i, el) => (el === s4CopoInner ? -4 : 0), opacity: 1, duration: 0.3 }, 16.25);

      tl.to([s4HeadEls, s4CopoInner, s4Prato, s4TextEls], { opacity: 0, duration: 0.3 }, 18.0)
        .set(sec4, { autoAlpha: 0 }, 18.35)
        .to(bgSecs[1], { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 0.3 }, 18.05)
        .set(sec5, { autoAlpha: 1 }, 18.15)
        .to([s5HeadEls, s5PacocaVis, s5CocadaVis, s5TextEls], { x: 0, y: 0, opacity: 1, duration: 0.3 }, 18.25);

      tl.to([s5HeadEls, s5PacocaVis, s5CocadaVis, s5TextEls], { opacity: 0, duration: 0.3 }, 20.0)
        .set(sec5, { autoAlpha: 0 }, 20.35)
        .to(bgSecs[2], { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 0.3 }, 20.05)
        .set(sec6, { autoAlpha: 1 }, 20.15)
        .to([s6Giant, s6HeadEls, s6Stars, ...s6Cards], { y: 0, scale: 1, opacity: 1, duration: 0.3 }, 20.25);

      tl.to([s6Giant, s6HeadEls, s6Stars, ...s6Cards], { opacity: 0, duration: 0.3 }, 22.0)
        .set(sec6, { autoAlpha: 0 }, 22.35)
        .to(bgSecs[3], { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 0.3 }, 22.05)
        .set(sec7, { autoAlpha: 1 }, 22.15)
        .to([s7Band, s7Seal, s7HeadEls, ...sec7Lines], { y: 0, scale: 1, opacity: 1, duration: 0.3 }, 22.25);

      tl.to([s7Band, s7Seal, s7HeadEls, ...sec7Lines], { opacity: 0, duration: 0.3 }, 24.0)
        .set(sec7, { autoAlpha: 0 }, 24.35)
        .to(bgSecs[4], { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 0.3 }, 24.05)
        .set(sec8, { autoAlpha: 1 }, 24.15)
        .to([s8HeadEls, s8Items, s8Foot], { y: 0, opacity: 1, duration: 0.3 }, 24.25);

      tl.to([s8HeadEls, s8Items, s8Foot], { opacity: 0, duration: 0.3 }, 26.0)
        .set(sec8, { autoAlpha: 0 }, 26.35)
        .to(bgSecs[5], { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 0.3 }, 26.05)
        .set(sec9, { autoAlpha: 1 }, 26.15)
        .to([s9TitleParts, s9Cols, s9Footer, s9ElipseBack, s9ElipseFront, footerBand], { y: 0, scale: 1, opacity: 1, duration: 0.3 }, 26.25)
        .to(s9Copo, { y: 0, rotation: 8, scale: 1, opacity: 1, duration: 0.3 }, 26.25);

      tl.set({}, {}, TOTAL_DURATION);
      return;
    }

    // -----------------------------------------------------------------------
    // 0.0 -> 2.0s: ENTRADA DO HERO
    // -----------------------------------------------------------------------
    tl.to(
      [portalBack, portalFront],
      { scale: 1, opacity: 1, duration: 0.72, ease: "elastic.out(1, 0.58)" },
      0.05
    )
      .to(copo, { opacity: 1, duration: 0.22, ease: "power1.out" }, 0.32)
      .to(
        copo,
        {
          y: L.heroCupY - 58,
          scaleX: L.heroCupScale * 0.92,
          scaleY: L.heroCupScale * 1.09,
          duration: 0.68,
          ease: "power2.out"
        },
        0.34
      )
      .to(
        copo,
        {
          y: L.heroCupY,
          scaleX: L.heroCupScale,
          scaleY: L.heroCupScale,
          duration: 0.55,
          ease: "elastic.out(1, 0.55)"
        },
        1.02
      )
      .to(
        heroLogo,
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
        0.38
      )
      .to(
        heroWords,
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.54,
          ease: "power3.out"
        },
        0.48
      )
      .to(
        [heroSub, heroCta],
        { y: 0, opacity: 1, stagger: 0.14, duration: 0.52, ease: "power3.out" },
        1.02
      );

    // -----------------------------------------------------------------------
    // PASSO 1 (2.0 -> 4.0s): HERO -> SEÇÃO 2 "O PUDIM"
    // -----------------------------------------------------------------------
    tl.to(
      heroContent,
      { x: L.heroExitX, y: L.heroExitY, opacity: 0, duration: 0.62, ease: "power2.in" },
      2.0
    )
      .to(heroXadrez, { y: 72, opacity: 0, duration: 0.45, ease: "power2.in" }, 2.0)
      .set(secHero, { autoAlpha: 0 }, 2.66)
      .to(
        [portalBack, portalFront],
        { y: L.portalY + 180, scale: 0.12, opacity: 0, duration: 0.7, ease: "back.in(1.4)" },
        2.0
      )
      .to(bgPudim, { opacity: 1, duration: 1.0, ease: "power1.inOut" }, 2.15)
      // Copo sai do portal em arco, gira 360° e pousa inclinado em -20°
      .to(copo, { x: L.pudimCupX, duration: 1.35, ease: "power2.inOut" }, 2.05)
      .to(
        copo,
        {
          y: Math.min(L.heroCupY, L.pudimCupY) - 255,
          scaleX: L.pudimCupScale * 0.88,
          scaleY: L.pudimCupScale * 0.88,
          duration: 0.65,
          ease: "power2.out"
        },
        2.05
      )
      .to(
        copo,
        {
          y: L.pudimCupY,
          scaleX: L.pudimCupScale,
          scaleY: L.pudimCupScale,
          duration: 0.7,
          ease: "bounce.out"
        },
        2.7
      )
      .to(copo, { rotation: 340, duration: 1.32, ease: "power2.inOut" }, 2.05)
      .set(copo, { rotation: -20 }, 3.55)
      .to(copoShadow, { opacity: 0.28, duration: 0.45, ease: "power1.out" }, 2.95)
      // Entrada editorial da Seção 2
      .set(secPudim, { autoAlpha: 1 }, 2.22)
      .to(
        [pudimEyebrow, pudimTitle],
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" },
        2.3
      )
      .to(
        pudimLines,
        { y: 0, opacity: 1, stagger: Math.min(0.12, 0.85 / Math.max(1, pudimLines.length)), duration: 0.4, ease: "power3.out" },
        2.5
      )
      .to(
        pudimSign,
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
        3.35
      );

    pudimFloatItems.forEach((it, idx) => {
      tl.to(
        it.outer,
        { scale: 1, opacity: 0.92, duration: 0.55, ease: "back.out(1.6)" },
        2.55 + idx * 0.08
      );
    });

    // -----------------------------------------------------------------------
    // PASSO 2 (4.0 -> 6.0s): SEÇÃO 2 -> SEÇÃO 3 (SABOR 1 TRADICIONAL)
    // -----------------------------------------------------------------------
    tl.to(
      [pudimEyebrow, pudimTitle, ...pudimLines, pudimSign],
      { x: 140, opacity: 0, stagger: 0.025, duration: 0.45, ease: "power2.in" },
      4.0
    );

    pudimFloatItems.forEach((it, idx) => {
      tl.to(
        it.outer,
        { scale: 0, opacity: 0, duration: 0.42, ease: "back.in(1.4)" },
        4.0 + idx * 0.04
      );
    });

    tl.set(secPudim, { autoAlpha: 0 }, 4.58)
      // Copo sai de -20° sem giro e pousa reto no centro
      .to(
        copo,
        {
          x: L.carCupX,
          rotation: 0,
          scaleX: L.carCupScale,
          scaleY: L.carCupScale,
          duration: 1.15,
          ease: "power3.out"
        },
        4.05
      )
      .to(copo, { y: L.carCupY, duration: 1.32, ease: "back.out(1.2)" }, 4.05)
      .to(
        copoShadow,
        { x: L.carCupX, y: L.carShadowY, scaleX: 1.15, opacity: 0.34, duration: 1.1, ease: "power3.out" },
        4.1
      )
      .to(
        flavorDom[0].bgEl,
        {
          clipPath: `circle(${maxCircle}px at 50% 52%)`,
          duration: 1.15,
          ease: "power2.inOut"
        },
        4.15
      )
      .set(saborUi, { autoAlpha: 1 }, 4.48)
      .to(flavorDom[0].giant, { x: 0, opacity: 1, duration: 0.95, ease: "power3.out" }, 4.45)
      .to(
        [flavorDom[0].edicao, flavorDom[0].sub, flavorDom[0].counter],
        { y: 0, scale: 1, opacity: 1, duration: 0.52, ease: "power2.out" },
        4.75
      );

    // Helpers de entrada/saída em parallax das 3 camadas de flutuantes
    function enterFlavorFloats(dom, tStart) {
      dom.floatItems.forEach((it, idx) => {
        const targetX = isMobile ? it.spec.mx : it.spec.dx;
        const opacity = it.spec.layer === "back" ? 0.64 : it.spec.layer === "front" ? 0.92 : 0.96;
        const delay = it.spec.layer === "back" ? 0 : it.spec.layer === "mid" ? 0.05 : 0.1;
        tl.to(
          it.outer,
          { x: targetX, scale: 1, opacity: opacity, duration: 0.9, ease: "power3.out" },
          tStart + delay + idx * 0.015
        );
      });
    }

    function exitFlavorFloats(dom, tStart) {
      dom.floatItems.forEach((it) => {
        const baseX = isMobile ? it.spec.mx : it.spec.dx;
        const shift = it.spec.layer === "front" ? -420 : it.spec.layer === "mid" ? -280 : -160;
        tl.to(
          it.outer,
          { x: baseX + shift, scale: 0.72, opacity: 0, duration: 0.6, ease: "power2.in" },
          tStart
        );
      });
    }

    enterFlavorFloats(flavorDom[0], 4.5);

    // -----------------------------------------------------------------------
    // PASSOS 3 a 7 (6.0 -> 16.0s): TROCAS DE SABOR COM COPOS REAIS
    // -----------------------------------------------------------------------
    for (let i = 1; i < FLAVORS.length; i++) {
      const tStart = 4.0 + i * 2.0; // 6, 8, 10, 12, 14
      const prev = flavorDom[i - 1];
      const curr = flavorDom[i];
      const tilt = i % 2 === 1 ? 8 : -8;
      const dir = i % 2 === 1 ? 1 : -1;

      const prevCup = i === 1 ? copo : prev.cupObj.outer;
      const prevRestY = prev.flavor.isWide ? L.carCupWideY : L.carCupY;
      const prevScale = i === 1 ? L.carCupScale : 1;
      const currCup = curr.cupObj.outer;
      const currRestY = curr.flavor.isWide ? L.carCupWideY : L.carCupY;

      // Expansão circular do fundo
      tl.to(
        curr.bgEl,
        {
          clipPath: `circle(${maxCircle}px at 50% 52%)`,
          duration: 1.1,
          ease: "power2.inOut"
        },
        tStart
      )
        .to(
          saborCta,
          { backgroundColor: curr.flavor.ctaBg, color: curr.flavor.ctaColor, duration: 0.45 },
          tStart + 0.25
        )
        // Texto gigante antigo sai à esquerda; novo entra à direita e centra em x=0
        .to(prev.giant, { x: -L.giantSlide, opacity: 0, duration: 0.68, ease: "power2.in" }, tStart)
        .to(curr.giant, { x: 0, opacity: 1, duration: 0.92, ease: "power3.out" }, tStart + 0.25)
        // UI inferior (edição, subtítulo, contador)
        .to([prev.edicao, prev.sub, prev.counter], { opacity: 0, duration: 0.32, ease: "power2.in" }, tStart)
        .to(
          [curr.edicao, curr.sub, curr.counter],
          { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
          tStart + 0.42
        )
        // Copo atual: pulinho com ±8° e sai descendo/desvanecendo para o lado
        .to(
          prevCup,
          {
            y: prevRestY - 52,
            rotation: tilt,
            scaleX: prevScale * 1.03,
            scaleY: prevScale * 1.03,
            duration: 0.34,
            ease: "power2.out"
          },
          tStart + 0.05
        )
        .to(
          prevCup,
          {
            x: L.carCupX - dir * 130,
            y: prevRestY + 135,
            rotation: -dir * 14,
            scaleX: prevScale * 0.86,
            scaleY: prevScale * 0.86,
            opacity: 0,
            duration: 0.54,
            ease: "power2.in"
          },
          tStart + 0.39
        )
        // Novo copo: entra pelo lado oposto/de baixo com ±10° até 0 e quique final
        .to(
          currCup,
          {
            x: L.carCupX,
            y: currRestY - 26,
            rotation: 0,
            scale: 1.03,
            opacity: 1,
            duration: 0.62,
            ease: "power3.out"
          },
          tStart + 0.22
        )
        .to(
          currCup,
          {
            y: currRestY,
            scale: 1,
            duration: 0.38,
            ease: "back.out(1.7)"
          },
          tStart + 0.84
        )
        .to(copoShadow, { scaleX: 0.94, opacity: 0.2, duration: 0.38, ease: "power2.out" }, tStart + 0.1)
        .to(copoShadow, { scaleX: 1.15, opacity: 0.34, duration: 0.62, ease: "back.out(1.4)" }, tStart + 0.52);

      exitFlavorFloats(prev, tStart);
      enterFlavorFloats(curr, tStart + 0.24);
    }

    // -----------------------------------------------------------------------
    // PASSO 8 (16.0 -> 18.0s): CARROSSEL (COCADA) -> SEÇÃO 4 "COPO E 1 KG"
    // -----------------------------------------------------------------------
    const cocada = flavorDom[5];
    const cocadaRestY = L.carCupWideY;

    tl.to(
      cocada.cupObj.outer,
      { y: cocadaRestY - 52, rotation: 8, scaleX: 1.03, scaleY: 1.03, duration: 0.34, ease: "power2.out" },
      16.05
    )
      .to(
        cocada.cupObj.outer,
        { x: L.carCupX - 130, y: cocadaRestY + 135, rotation: -14, scaleX: 0.86, scaleY: 0.86, opacity: 0, duration: 0.54, ease: "power2.in" },
        16.39
      )
      .to(copoShadow, { opacity: 0, duration: 0.4, ease: "power1.in" }, 16.05)
      .to(cocada.giant, { x: -L.giantSlide, opacity: 0, duration: 0.68, ease: "power2.in" }, 16.0)
      .to([cocada.edicao, cocada.sub, cocada.counter], { opacity: 0, duration: 0.32, ease: "power2.in" }, 16.0)
      .set(saborUi, { autoAlpha: 0 }, 16.45)
      .to(
        bgSecs[0],
        { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 1.1, ease: "power2.inOut" },
        16.05
      )
      .set(sec4, { autoAlpha: 1 }, 16.22)
      .to(s4HeadEls, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" }, 16.32)
      .to(s4CopoInner, { y: 0, scale: 1, opacity: 1, duration: 0.56, ease: "back.out(1.4)" }, 16.48)
      .to(s4CopoInner, { rotation: -4, duration: 0.68, ease: "back.out(2)" }, 16.56)
      .to(s4Prato, { y: 0, scale: 1, opacity: 1, duration: 0.58, ease: "back.out(1.3)" }, 16.56)
      .to(s4TextEls, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" }, 16.72);

    exitFlavorFloats(cocada, 16.0);
    sec4FloatItems.forEach((it, idx) => {
      tl.to(
        it.outer,
        { scale: 1, opacity: it.spec.layer === "back" ? 0.68 : 0.92, duration: 0.55, ease: "back.out(1.5)" },
        16.52 + idx * 0.08
      );
    });

    // -----------------------------------------------------------------------
    // PASSO 9 (18.0 -> 20.0s): SEÇÃO 4 -> SEÇÃO 5 "EDIÇÃO LIMITADA"
    // -----------------------------------------------------------------------
    tl.to([s4HeadEls, s4TextEls], { y: -32, opacity: 0, stagger: 0.03, duration: 0.4, ease: "power2.in" }, 18.0)
      .to([s4CopoInner, s4Prato], { scale: 0.9, y: 36, opacity: 0, duration: 0.42, ease: "power2.in" }, 18.0)
      .to(sec4FloatItems.map((i) => i.outer), { scale: 0, opacity: 0, duration: 0.38, ease: "back.in(1.3)" }, 18.0)
      .set(sec4, { autoAlpha: 0 }, 18.52)
      .to(
        bgSecs[1],
        { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 1.05, ease: "power2.inOut" },
        18.05
      )
      .set(sec5, { autoAlpha: 1 }, 18.22)
      .to(s5HeadEls, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" }, 18.32)
      .to(s5PacocaVis, { x: 0, opacity: 1, duration: 0.68, ease: "power3.out" }, 18.45)
      .to(s5CocadaVis, { x: 0, opacity: 1, duration: 0.68, ease: "power3.out" }, 18.48)
      .to(s5TextEls, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" }, 18.68);

    sec5FloatItems.forEach((it, idx) => {
      tl.to(
        it.outer,
        { scale: 1, opacity: it.spec.layer === "back" ? 0.68 : 0.92, duration: 0.55, ease: "back.out(1.5)" },
        18.52 + idx * 0.08
      );
    });

    // -----------------------------------------------------------------------
    // PASSO 10 (20.0 -> 22.0s): SEÇÃO 5 -> SEÇÃO 6 "FEEDBACKS"
    // -----------------------------------------------------------------------
    tl.to([s5HeadEls, s5TextEls], { y: -28, opacity: 0, duration: 0.4, ease: "power2.in" }, 20.0)
      .to(s5PacocaVis, { x: -70, opacity: 0, duration: 0.42, ease: "power2.in" }, 20.0)
      .to(s5CocadaVis, { x: 70, opacity: 0, duration: 0.42, ease: "power2.in" }, 20.0)
      .to(sec5FloatItems.map((i) => i.outer), { scale: 0, opacity: 0, duration: 0.38, ease: "back.in(1.3)" }, 20.0)
      .set(sec5, { autoAlpha: 0 }, 20.52)
      .to(
        bgSecs[2],
        { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 1.05, ease: "power2.inOut" },
        20.05
      )
      .set(sec6, { autoAlpha: 1 }, 20.22)
      .to(s6Giant, { scale: 1, opacity: 0.92, duration: 0.82, ease: "power3.out" }, 20.28)
      .to(s6HeadEls, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" }, 20.32)
      .to(s6Stars, { scale: 1, opacity: 1, stagger: 0.08, duration: 0.36, ease: "back.out(1.7)" }, 20.52)
      .to(s6Cards, { y: 0, opacity: 1, stagger: 0.1, duration: 0.48, ease: "power3.out" }, 20.92);

    // -----------------------------------------------------------------------
    // PASSO 11 (22.0 -> 24.0s): SEÇÃO 6 -> SEÇÃO 7 "QUEM SOMOS"
    // -----------------------------------------------------------------------
    tl.to([s6Giant, s6HeadEls, s6Stars, ...s6Cards], { y: -26, opacity: 0, duration: 0.42, ease: "power2.in" }, 22.0)
      .set(sec6, { autoAlpha: 0 }, 22.52)
      .to(
        bgSecs[3],
        { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 1.05, ease: "power2.inOut" },
        22.05
      )
      .set(sec7, { autoAlpha: 1 }, 22.2)
      .to(s7Band, { y: 0, duration: 0.7, ease: "power3.out" }, 22.25)
      .to(s7Seal, { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.5)" }, 22.5)
      .to(s7HeadEls, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" }, 22.3)
      .to(sec7Lines, { y: 0, opacity: 1, stagger: 0.1, duration: 0.46, ease: "power3.out" }, 22.55);

    // -----------------------------------------------------------------------
    // PASSO 12 (24.0 -> 26.0s): SEÇÃO 7 -> SEÇÃO 8 "PARCEIROS"
    // -----------------------------------------------------------------------
    tl.to([s7HeadEls, ...sec7Lines], { x: -80, opacity: 0, duration: 0.42, ease: "power2.in" }, 24.0)
      .to(s7Band, { y: isMobile ? -260 : -1080, duration: 0.45, ease: "power2.in" }, 24.0)
      .to(s7Seal, { scale: 0.8, opacity: 0, duration: 0.35, ease: "power2.in" }, 24.0)
      .set(sec7, { autoAlpha: 0 }, 24.52)
      .to(
        bgSecs[4],
        { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 1.05, ease: "power2.inOut" },
        24.05
      )
      .set(sec8, { autoAlpha: 1 }, 24.2)
      .to(s8HeadEls, { y: 0, opacity: 1, stagger: 0.08, duration: 0.48, ease: "power3.out" }, 24.28)
      .to(s8Items, { y: 0, opacity: 1, stagger: 0.1, duration: 0.44, ease: "power3.out" }, 24.42)
      .to(s8Foot, { y: 0, opacity: 1, duration: 0.44, ease: "power2.out" }, 25.15);

    // -----------------------------------------------------------------------
    // PASSO 13 (26.0 -> 28.0s): SEÇÃO 8 -> SEÇÃO 9 "PEÇA O SEU"
    // -----------------------------------------------------------------------
    tl.to([s8HeadEls, s8Items, s8Foot], { y: -28, opacity: 0, duration: 0.42, ease: "power2.in" }, 26.0)
      .set(sec8, { autoAlpha: 0 }, 26.52)
      .to(
        bgSecs[5],
        { clipPath: `circle(${maxCircle}px at 50% 52%)`, duration: 1.1, ease: "power2.inOut" },
        26.05
      )
      .set(sec9, { autoAlpha: 1 }, 26.22)
      .to(s9TitleParts, { y: 0, scale: 1, opacity: 1, stagger: 0.12, duration: 0.56, ease: "back.out(1.4)" }, 26.32)
      .to(s9Cols, { y: 0, opacity: 1, duration: 0.52, ease: "power3.out" }, 26.58)
      .to([s9ElipseBack, s9ElipseFront], { scale: 1, opacity: 1, duration: 0.65, ease: "elastic.out(1, 0.6)" }, 26.38)
      .to(s9Copo, { y: 0, rotation: 8, scale: 1, opacity: 1, duration: 0.78, ease: "back.out(1.4)" }, 26.52)
      .to(s9Footer, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 26.78)
      .to(footerBand, { opacity: 1, duration: 0.55, ease: "power3.out" }, 26.78);

    tl.set({}, {}, TOTAL_DURATION);
  }

  // =========================================================================
  // API EXPOSTA & RECONSTRUÇÃO RESPONSIVA
  // =========================================================================
  let currentStep = 0;

  window.seekTo = function (t) {
    const clamped = Math.max(0, Math.min(TOTAL_DURATION, Number(t) || 0));
    gsap.killTweensOf(tl);
    window.__idleT = clamped;
    tl.time(clamped, false);
    applyIdle();
    applyMouseParallax();
    syncUI(clamped);

    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < STEPS.length; i++) {
      const d = Math.abs(STEPS[i] - clamped);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    currentStep = nearest;
    return clamped;
  };

  window.goStep = function (n) {
    const targetIdx = Math.max(0, Math.min(STEPS.length - 1, Math.round(n)));
    currentStep = targetIdx;
    const targetTime = STEPS[targetIdx];
    const delta = Math.abs(targetTime - tl.time());

    gsap.killTweensOf(tl);
    if (delta < 0.001) {
      tl.time(targetTime, false);
      syncUI(targetTime);
      return;
    }

    const dur = PREFERS_REDUCED
      ? 0.3
      : delta <= 2
        ? Math.max(0.35, delta * 0.72)
        : Math.min(2.4, 1.44 + (delta - 2) * 0.04);
    gsap.to(tl, {
      time: targetTime,
      duration: dur,
      ease: "none"
    });
  };

  let mobileMenuOpen = false;
  function setMobileMenu(open) {
    mobileMenuOpen = !!open;
    mobileNavOverlay.classList.toggle("is-open", mobileMenuOpen);
    mobileNavOverlay.setAttribute("aria-hidden", mobileMenuOpen ? "false" : "true");
    navHamburger.setAttribute("aria-expanded", mobileMenuOpen ? "true" : "false");
    if (mobileMenuOpen) {
      mobileNavClose.focus({ preventScroll: true });
    }
  }

  navHamburger.addEventListener("click", function () {
    setMobileMenu(!mobileMenuOpen);
  });

  mobileNavClose.addEventListener("click", function () {
    setMobileMenu(false);
    navHamburger.focus({ preventScroll: true });
  });

  navStepTriggers.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetStep = parseInt(link.getAttribute("data-nav-step"), 10);
      if (mobileMenuOpen) setMobileMenu(false);
      if (!isNaN(targetStep)) window.goStep(targetStep);
    });
  });

  function handleResize() {
    const nextMobile = detectMobile();
    if (nextMobile !== isMobile) {
      const savedTime = tl ? tl.time() : STEPS[currentStep];
      isMobile = nextMobile;
      window.layoutMode = isMobile ? "mobile" : "desktop";
      if (!isMobile && mobileMenuOpen) setMobileMenu(false);
      buildTimeline();
      window.seekTo(IS_RENDER ? savedTime : STEPS[currentStep]);
    } else {
      fitStage();
      const diag = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight));
      if (diag > builtDiag + 2) {
        const savedTime = tl ? tl.time() : STEPS[currentStep];
        buildTimeline();
        window.seekTo(IS_RENDER ? savedTime : STEPS[currentStep]);
      }
    }
  }
  window.addEventListener("resize", handleResize);

  // =========================================================================
  // ENTRADAS (Mouse parallax, roda, teclado, swipe V/H, giroscópio, pontos)
  // =========================================================================
  window.addEventListener("mousemove", function (e) {
    if (IS_RENDER || isMobile) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    window.__mouse.x = ((e.clientX - rect.left) / rect.width) * 1920;
    window.__mouse.y = ((e.clientY - rect.top) / rect.height) * 1080;
    applyMouseParallax();
  });

  // Giroscópio opcional em dispositivos de toque (sem exigir permissão intrusiva)
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function") {
    window.addEventListener("deviceorientation", function (e) {
      if (IS_RENDER || !isMobile || e.gamma == null || e.beta == null) return;
      const gx = Math.max(-25, Math.min(25, e.gamma));
      const gy = Math.max(-25, Math.min(25, e.beta - 45));
      for (let i = 0; i < mouseTargets.length; i++) {
        const mt = mouseTargets[i];
        mt.qx(-gx * 16 * mt.factor);
        mt.qy(-gy * 12 * mt.factor);
      }
    });
  }

  let lastStepAt = 0;

  function stepBy(dir) {
    const next = currentStep + dir;
    if (next < 0 || next >= STEPS.length) return;
    window.goStep(next);
  }

  window.addEventListener(
    "wheel",
    function (e) {
      if (mobileMenuOpen) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < 15) return;
      const now = performance.now();
      if (now - lastStepAt < STEP_LOCK_MS) return;
      lastStepAt = now;
      stepBy(e.deltaY > 0 ? 1 : -1);
    },
    { passive: false }
  );

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenuOpen) {
      e.preventDefault();
      setMobileMenu(false);
      navHamburger.focus({ preventScroll: true });
      return;
    }
    if (mobileMenuOpen) return;
    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowRight" ||
      e.key === "PageDown" ||
      e.key === " "
    ) {
      e.preventDefault();
      stepBy(1);
    } else if (
      e.key === "ArrowUp" ||
      e.key === "ArrowLeft" ||
      e.key === "PageUp"
    ) {
      e.preventDefault();
      stepBy(-1);
    }
  });

  let touchStartY = 0;
  let touchStartX = 0;
  window.addEventListener(
    "touchstart",
    function (e) {
      if (mobileMenuOpen) return;
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    function (e) {
      if (mobileMenuOpen) return;
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const absY = Math.abs(dy);
      const absX = Math.abs(dx);
      if (Math.max(absY, absX) > 42) {
        const now = performance.now();
        if (now - lastStepAt < STEP_LOCK_MS) return;
        lastStepAt = now;
        const primary = absY >= absX ? dy : dx;
        stepBy(primary < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  navDots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const idx = parseInt(dot.getAttribute("data-step"), 10);
      if (!isNaN(idx)) window.goStep(idx);
    });
  });

  // =========================================================================
  // INICIALIZAÇÃO E IDLE TICKER
  // =========================================================================
  buildTimeline();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      applyResponsiveSizing(getLayout(isMobile));
    });
  }

  if (!IS_RENDER && !PREFERS_REDUCED) {
    gsap.ticker.add(function (_time, deltaTime) {
      const dt = Math.min(0.05, (deltaTime || 16.67) / 1000);
      window.__idleT += dt;
      applyIdle();
    });
  }

  if (IS_RENDER) {
    window.seekTo(0);
  } else {
    tl.time(0, false);
    applyIdle();
    applyMouseParallax();
    syncUI(0);
    if (window.__preloaderActive) {
      window.addEventListener("preloader:reveal", function () {
        window.goStep(0);
      }, { once: true });
    } else {
      window.goStep(0);
    }
  }
})();
