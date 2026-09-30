/* Une intro par onglet/session, décidée avant le premier affichage. */
(function () {
  var root = document.documentElement, seen = false;
  try {
    seen = sessionStorage.getItem("sco_intro_seen") === "1";
    sessionStorage.setItem("sco_intro_seen", "1");
  } catch (e) {
    try { seen = new URL(document.referrer).origin === location.origin; } catch (ignored) {}
  }
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try { reduced = reduced || localStorage.getItem("sco_motion_paused") === "1"; } catch (e) {}
  root.classList.toggle("motion-paused", reduced);
  root.classList.add(seen || reduced ? "intro-seen" : "intro-pending");
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      root.classList.remove("intro-pending");
      root.classList.add("intro-seen");
    }
  });
})();
