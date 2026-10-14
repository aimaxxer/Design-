/* 10X Affiliation motion helpers for HyperFrames reels.
   Brand curves as CustomEases, text splitting, a seeded PRNG, and the reusable transitions.
   Everything here only ADDS tweens to the paused timeline it is given, so it stays seekable. */
(function () {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("brandOut", "0.23,1,0.32,1");
  CustomEase.create("brandReveal", "0.16,1,0.3,1");
  CustomEase.create("brandInOut", "0.77,0,0.175,1");
  CustomEase.create("softOut", "0.25,0.46,0.45,0.94");

  var B = (window.B = {});

  // Seeded PRNG (mulberry32): same numbers on every render.
  B.rand = function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Wrap each word in .w (nowrap) and each character in .ch. Returns the char spans.
  B.chars = function (el) {
    var words = el.textContent.split(" ");
    el.textContent = "";
    var out = [];
    words.forEach(function (w, i) {
      var ws = document.createElement("span");
      ws.className = "w";
      for (var k = 0; k < w.length; k++) {
        var c = document.createElement("span");
        c.className = "ch";
        c.textContent = w[k];
        ws.appendChild(c);
        out.push(c);
      }
      el.appendChild(ws);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return out;
  };

  // Wrap each word in .w and return them.
  B.words = function (el) {
    var words = el.textContent.split(" ");
    el.textContent = "";
    var out = [];
    words.forEach(function (w, i) {
      var ws = document.createElement("span");
      ws.className = "w";
      ws.textContent = w;
      el.appendChild(ws);
      out.push(ws);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return out;
  };

  // Hard scene switch: show `next`, hide `prev` at time t.
  B.cut = function (tl, prev, next, t) {
    if (next) tl.set(next, { opacity: 1 }, t);
    if (prev) tl.set(prev, { opacity: 0 }, t);
  };

  // Diagonal band wipe on the 45-degree line of the 10X mark.
  // The band's navy core is wider than the frame's diagonal extent, so the swap at the midpoint is never seen.
  // band: element (.band) inside a full-frame overlay. Returns the swap time.
  B.bandWipe = function (tl, band, prev, next, t, dur) {
    dur = dur || 0.62;
    var D = 2600 / Math.SQRT2;
    tl.set(band, { opacity: 1 }, t);
    tl.fromTo(band, { x: -D, y: D, rotation: 45 }, { x: D, y: -D, rotation: 45, duration: dur, ease: "brandInOut", immediateRender: false }, t);
    var swap = t + dur / 2;
    B.cut(tl, prev, next, swap);
    tl.set(band, { opacity: 0 }, t + dur);
    return swap;
  };

  // Chamfered block wipe: blocks cover from the left, the scene swaps, blocks leave to the right.
  B.blockWipe = function (tl, blocks, prev, next, t) {
    var n = blocks.length;
    tl.set(blocks, { opacity: 1 }, t);
    blocks.forEach(function (b, i) {
      tl.fromTo(b, { xPercent: -101 }, { xPercent: 0, duration: 0.26, ease: "power3.in", immediateRender: false }, t + i * 0.035);
    });
    var swap = t + 0.26 + (n - 1) * 0.035;
    B.cut(tl, prev, next, swap);
    blocks.forEach(function (b, i) {
      tl.to(b, { xPercent: 101, duration: 0.32, ease: "brandOut" }, swap + 0.02 + i * 0.035);
    });
    tl.set(blocks, { opacity: 0 }, swap + 0.4 + n * 0.035);
    return swap;
  };

  // Zoom-through: outgoing pushes past camera, incoming lands from behind.
  B.zoomThrough = function (tl, prev, next, t) {
    tl.to(prev, { scale: 1.22, filter: "blur(14px)", duration: 0.24, ease: "power3.in" }, t);
    tl.set(next, { opacity: 1 }, t + 0.24);
    tl.set(prev, { opacity: 0 }, t + 0.24);
    tl.fromTo(next, { scale: 0.84, filter: "blur(14px)" }, { scale: 1, filter: "blur(0px)", duration: 0.5, ease: "brandReveal", immediateRender: false }, t + 0.24);
    return t + 0.24;
  };

  // Tracking collapse without animating letter-spacing: each glyph travels in from a wider spread.
  B.track = function (tl, el, t, spread, dur, ease) {
    var chars = B.chars(el);
    chars.forEach(function (c, i) {
      tl.fromTo(c, { x: i * spread, opacity: 0 }, { x: 0, opacity: 1, duration: dur || 0.7, ease: ease || "brandOut" }, t);
    });
    return chars;
  };

  // Film grain: shift a tiled noise texture 15 times a second from a seeded table.
  B.grain = function (tl, el, dur, seed) {
    var r = B.rand(seed || 7);
    for (var i = 0; i * (1 / 15) < dur; i++) {
      tl.set(el, { backgroundPosition: Math.round(r() * 512) + "px " + Math.round(r() * 512) + "px" }, i / 15);
    }
  };
})();
