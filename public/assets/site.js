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

    // --- carrousel du hero : fondu très doux entre pizzas pendant la rotation
    //     (invisible à l'œil), + échange instantané quand le hero est hors écran. ---
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

      var FADE = 3200;    // durée du fondu (ms) — lent = imperceptible
      var CYCLE = 11000;  // temps entre deux changements
      var idx = 0, busy = false;

      function next() { idx = (idx + 1) % PIZZAS.length; return PIZZAS[idx]; }

      function swapSoft() {
        if (busy || document.hidden) return;   // onglet caché : on saute le cycle
        busy = true;
        b.src = next();
        var start = function () {
          b.style.transition = "opacity " + FADE + "ms ease-in-out";
          requestAnimationFrame(function () { requestAnimationFrame(function () {
            b.style.opacity = "1";
          }); });
          setTimeout(function () {
            a.src = b.src;
            b.style.transition = "none";
            b.style.opacity = "0";
            busy = false;
          }, FADE + 200);
        };
        // on ne démarre le fondu qu'une fois l'image ENTIÈREMENT décodée
        // (sinon elle apparaît d'un coup au lieu de fondre)
        if (b.decode) b.decode().then(start).catch(function () { busy = false; });
        else start();
      }

      setInterval(swapSoft, CYCLE);
    })();
  });
})();
