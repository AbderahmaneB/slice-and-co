/* Slice & Co — interactions : intro splash, reveal au scroll, header dynamique, menu mobile */
(function () {
  // --- intro : rejouée à chaque chargement / refresh ---
  // (l'animation et le retrait sont gérés en CSS pur)

  document.addEventListener("DOMContentLoaded", function () {
    // --- apparition des blocs au scroll ---
    var sel = ".section,.card,.feature,.offer,.menu-cat,.menu-list,.cta-band .wrap,.info-grid,.section-head,.map";
    var els = [].slice.call(document.querySelectorAll(sel));
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      els.forEach(function (el, i) { el.classList.add("reveal"); io.observe(el); });
    }

    // --- ombre du header au scroll ---
    var h = document.querySelector(".site-header");
    if (h) {
      var on = function () { h.classList.toggle("scrolled", window.scrollY > 8); };
      on(); addEventListener("scroll", on, { passive: true });
    }

    // --- fermer le menu mobile au clic sur un lien ---
    var nav = document.getElementById("nav");
    if (nav) nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });

    // --- pastille : position désormais figée en CSS, on purge l'éventuel réglage de test ---
    try { localStorage.removeItem("sco_badge"); localStorage.removeItem("sco_badge_d"); localStorage.removeItem("sco_badge_m"); } catch (e) {}

    // --- carrousel du hero : la pizza se remplace PART PAR PART pendant que
    //     chaque part passe dans la zone cachée sous le bas de la section.
    //     Résultat : ce qui remonte en tournant est déjà la nouvelle pizza. ---
    (function () {
      var box = document.querySelector(".hero-pizza");
      if (!box || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var a = box.querySelector("img.pz-a"), b = box.querySelector("img.pz-b");
      if (!a || !b) return;

      var PIZZAS = [
        "assets/img/pizzas/pepperoni.png",
        "assets/img/pizzas/bbq-chicken.png",
        "assets/img/pizzas/brooklyn-hot-honey.png",
        "assets/img/pizzas/everything-bagel.png",
        "assets/img/pizzas/chicago.png",
        "assets/img/pizzas/chicken-creamy-bacon.png",
        "assets/img/pizzas/brooklyn-choco-dreams.png"
      ];
      PIZZAS.forEach(function (s) { var i = new Image(); i.src = s; });

      var N = 12, SLICE = 360 / N;          // 12 parts de 30°
      var HIDE_MIN = 125, HIDE_MAX = 235;   // angles écran cachés sous le pli (0° = haut)
      var DWELL = 6000;                     // pause entre deux pizzas
      var idx = 0, revealed = null, waitUntil = performance.now() + DWELL;

      function rot() { // rotation courante réelle, lue sur la matrice CSS
        var t = getComputedStyle(a).transform, m = t && t.match(/matrix\(([^)]+)\)/);
        if (!m) return 0;
        var p = m[1].split(",");
        return ((Math.atan2(parseFloat(p[1]), parseFloat(p[0])) * 180 / Math.PI) + 360) % 360;
      }
      function applyMask() {
        var stops = [];
        for (var i = 0; i < N; i++) {
          stops.push((revealed.has(i) ? "#000 " : "transparent ") + (i * SLICE) + "deg " + ((i + 1) * SLICE) + "deg");
        }
        var g = "conic-gradient(from 0deg," + stops.join(",") + ")";
        b.style.webkitMaskImage = g; b.style.maskImage = g;
      }
      function tick(now) {
        requestAnimationFrame(tick);
        if (revealed === null) {            // pause entre deux pizzas
          if (now < waitUntil) return;
          idx = (idx + 1) % PIZZAS.length;
          b.src = PIZZAS[idx];
          revealed = new Set(); applyMask();
          b.style.visibility = "visible";
          return;
        }
        var r = rot(), changed = false;
        for (var i = 0; i < N; i++) {
          if (revealed.has(i)) continue;
          var s = (i * SLICE + r) % 360;    // position écran de la part
          if (s >= HIDE_MIN && s + SLICE <= HIDE_MAX) { revealed.add(i); changed = true; }
        }
        if (changed) applyMask();
        if (revealed.size === N) {          // remplacement terminé
          a.src = b.src;
          b.style.visibility = "hidden"; b.style.maskImage = ""; b.style.webkitMaskImage = "";
          revealed = null; waitUntil = now + DWELL;
        }
      }
      requestAnimationFrame(tick);
    })();
  });
})();
