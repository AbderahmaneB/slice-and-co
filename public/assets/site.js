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
  });
})();
