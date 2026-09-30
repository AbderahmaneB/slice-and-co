/* Slice & Co — interactions discrètes, dans la présentation d'origine. */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.documentElement;
    var motion = matchMedia("(prefers-reduced-motion: reduce)");
    var motionUserPaused = false;
    try { motionUserPaused = localStorage.getItem("sco_motion_paused") === "1"; } catch (e) {}
    var motionButton = document.querySelector(".motion-toggle");
    function motionIsPaused() { return motion.matches || motionUserPaused; }
    function applyMotionPreference() {
      var paused = motionIsPaused();
      root.classList.toggle("motion-paused", paused);
      root.classList.add("motion-ready");
      if (paused) {
        root.classList.remove("intro-pending");
        root.classList.add("intro-seen");
        document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      }
      if (motionButton) {
        motionButton.hidden = false;
        motionButton.setAttribute("aria-pressed", String(paused));
        motionButton.setAttribute("aria-disabled", String(motion.matches));
        motionButton.title = motion.matches ? "Animations arrêtées selon votre appareil" : paused ? "Reprendre les animations" : "Mettre les animations en pause";
        if (motion.matches) motionButton.setAttribute("aria-describedby", "motion-preference-note");
        else motionButton.removeAttribute("aria-describedby");
      }
      document.dispatchEvent(new Event("sco:motionchange"));
    }
    if (motionButton) motionButton.addEventListener("click", function () {
      if (motion.matches) return;
      motionUserPaused = !motionUserPaused;
      try { localStorage.setItem("sco_motion_paused", motionUserPaused ? "1" : "0"); } catch (e) {}
      applyMotionPreference();
    });
    motion.addEventListener("change", applyMotionPreference);
    addEventListener("storage", function (event) {
      if (event.key === "sco_motion_paused") {
        motionUserPaused = event.newValue === "1";
        applyMotionPreference();
      }
    });
    addEventListener("pageshow", function () {
      try { motionUserPaused = localStorage.getItem("sco_motion_paused") === "1"; } catch (e) {}
      applyMotionPreference();
    });
    applyMotionPreference();
    var intro = document.getElementById("intro");
    if (intro) intro.addEventListener("animationend", function (event) {
      if (event.animationName === "introOut") {
        root.classList.remove("intro-pending");
        root.classList.add("intro-seen");
      }
    });

    // Ne jamais masquer une grande section dont le seuil serait hors écran.
    if ("IntersectionObserver" in window && !motionIsPaused()) {
      var elements = document.querySelectorAll(".card,.feature,.offer,.menu-cat,.section-head,.info,.cta-band .wrap,.map");
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            reveal.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06 });
      elements.forEach(function (el) { el.classList.add("reveal"); reveal.observe(el); });
      motion.addEventListener("change", function () {
        if (motion.matches) {
          elements.forEach(function (el) { el.classList.add("in"); });
          reveal.disconnect();
        }
      });
    }

    var header = document.querySelector(".site-header");
    var categoryNav = document.querySelector(".menu-category-nav");
    var categoryLinks = categoryNav ? Array.from(categoryNav.querySelectorAll('a[href^="#"]')) : [];
    var categories = categoryLinks.map(function (link) { return document.getElementById(link.hash.slice(1)); });
    var activeCategory = -1;
    var categoryPicker = categoryNav && categoryNav.querySelector(".menu-category-picker");
    var currentCategoryLabel = categoryNav && categoryNav.querySelector(".menu-current-category");
    if (categoryPicker) {
      var categoryMobile = matchMedia("(max-width: 900px)");
      var categorySummary = categoryPicker.querySelector("summary");
      function syncCategoryPicker() {
        var focused = document.activeElement;
        categoryPicker.open = !categoryMobile.matches;
        if (categoryMobile.matches && categoryLinks.indexOf(focused) !== -1) categorySummary.focus({ preventScroll: true });
        else if (!categoryMobile.matches && focused === categorySummary) {
          (categoryLinks[activeCategory] || categoryLinks[0]).focus({ preventScroll: true });
        }
      }
      syncCategoryPicker();
      categoryMobile.addEventListener("change", syncCategoryPicker);
      categoryPicker.addEventListener("click", function (event) {
        if (categoryMobile.matches && event.target.closest("a[href]")) categoryPicker.open = false;
      });
      document.addEventListener("click", function (event) {
        if (categoryMobile.matches && categoryPicker.open && !categoryPicker.contains(event.target)) categoryPicker.open = false;
      });
      categoryPicker.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && categoryMobile.matches && categoryPicker.open) {
          event.preventDefault();
          categoryPicker.open = false;
          categorySummary.focus({ preventScroll: true });
        }
      });
    }
    function updateHeaderSize() {
      if (header) root.style.setProperty("--header-height", header.offsetHeight + "px");
      if (categoryNav) root.style.setProperty("--category-nav-height", categoryNav.offsetHeight + "px");
    }
    updateHeaderSize();
    if ("ResizeObserver" in window) {
      var sizes = new ResizeObserver(updateHeaderSize);
      if (header) sizes.observe(header);
      if (categoryNav) sizes.observe(categoryNav);
    } else addEventListener("resize", updateHeaderSize);
    function updateScroll() {
      if (header) header.classList.toggle("scrolled", scrollY > 8);
      if (!categoryLinks.length) return;
      var limit = (header ? header.offsetHeight : 85) + categoryNav.offsetHeight + 80;
      var current = 0;
      categories.forEach(function (heading, index) {
        if (heading && heading.getBoundingClientRect().top <= limit) current = index;
      });
      if (current === activeCategory) return;
      activeCategory = current;
      categoryLinks.forEach(function (link, index) {
        if (index === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      if (currentCategoryLabel) currentCategoryLabel.textContent = categoryLinks[current].textContent;
    }
    var scheduled = false;
    addEventListener("scroll", function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () { updateScroll(); scheduled = false; });
    }, { passive: true });
    updateScroll();

    var nav = document.getElementById("nav");
    var burger = document.querySelector(".burger");
    if (nav && burger) {
      var mobile = matchMedia("(max-width: 900px)");
      var backdrop = document.createElement("button");
      backdrop.className = "nav-backdrop";
      backdrop.type = "button";
      backdrop.tabIndex = -1;
      backdrop.setAttribute("aria-hidden", "true");
      backdrop.hidden = true;
      document.body.appendChild(backdrop);
      var background = [document.querySelector(".topbar"), document.querySelector("main"), document.querySelector("footer"), document.querySelector(".skip-link"), header && header.querySelector(".brand")].filter(Boolean);
      var previousInert = new Map();
      function setOpen(open, focus) {
        open = open && mobile.matches;
        if (!open && mobile.matches && nav.contains(document.activeElement)) burger.focus({ preventScroll: true });
        nav.classList.toggle("open", open);
        document.body.classList.toggle("nav-open", open);
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
        backdrop.hidden = !open;
        nav.inert = mobile.matches && !open;
        background.forEach(function (el) {
          if (open) {
            if (!previousInert.has(el)) previousInert.set(el, el.inert);
            el.inert = true;
          } else if (previousInert.has(el)) {
            el.inert = previousInert.get(el);
            previousInert.delete(el);
          }
        });
        if (focus) (open ? nav.querySelector("a") : burger).focus({ preventScroll: true });
      }
      burger.addEventListener("click", function () { setOpen(!nav.classList.contains("open"), true); });
      backdrop.addEventListener("click", function () { setOpen(false, true); });
      nav.addEventListener("click", function (event) { if (event.target.closest("a")) setOpen(false, false); });
      document.addEventListener("keydown", function (event) {
        if (!nav.classList.contains("open")) return;
        if (event.key === "Escape") { event.preventDefault(); setOpen(false, true); }
        if (event.key === "Tab") {
          var stops = [burger].concat(Array.from(nav.querySelectorAll("a[href]")));
          var index = stops.indexOf(document.activeElement);
          event.preventDefault();
          var next = index < 0 ? (event.shiftKey ? stops.length - 1 : 0) : (index + (event.shiftKey ? -1 : 1) + stops.length) % stops.length;
          stops[next].focus();
        }
      });
      mobile.addEventListener("change", function () { setOpen(false, false); updateHeaderSize(); });
      addEventListener("pageshow", function () { setOpen(false, false); });
      root.classList.add("nav-ready");
      setOpen(false, false);
    }

    // Même rotation et fondu doux, avec des WebP chargés à la demande.
    var box = document.querySelector(".hero-pizza");
    if (!box) return;
    var a = box.querySelector("img.pz-a"), b = box.querySelector("img.pz-b");
    if (!a || !b) return;
    var pizzas = ["pepperoni", "bbq-chicken", "brooklyn-hot-honey", "everything-bagel", "chicago", "chicken-creamy-bacon", "brooklyn-choco-dreams"];
    var index = 0, busy = false, heroVisible = true, fadeTimer = null, transitionVersion = 0;
    function paused() {
      var pause = document.hidden || !heroVisible || motionIsPaused();
      box.classList.toggle("is-paused", pause);
      return pause;
    }
    function cancelSwap() {
      transitionVersion += 1;
      clearTimeout(fadeTimer);
      fadeTimer = null;
      b.style.transition = "none";
      b.style.opacity = "0";
      busy = false;
    }
    function syncHeroMotion() { if (paused()) cancelSwap(); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; syncHeroMotion(); }).observe(box);
    }
    document.addEventListener("visibilitychange", syncHeroMotion);
    document.addEventListener("sco:motionchange", syncHeroMotion);
    function setImage(img, slug) {
      img.srcset = "assets/img/pizzas/web/" + slug + "-480.webp 480w, assets/img/pizzas/web/" + slug + "-800.webp 800w";
      img.src = "assets/img/pizzas/web/" + slug + "-800.webp";
    }
    async function swap() {
      if (busy || paused()) return;
      busy = true;
      var version = ++transitionVersion;
      var next = (index + 1) % pizzas.length;
      setImage(b, pizzas[next]);
      try { await b.decode(); } catch (e) { if (version === transitionVersion) busy = false; return; }
      if (version !== transitionVersion) return;
      if (paused()) { cancelSwap(); return; }
      b.style.transition = "opacity 2400ms ease-in-out";
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        if (version === transitionVersion && !paused()) b.style.opacity = "1";
      }); });
      fadeTimer = setTimeout(async function () {
        if (version !== transitionVersion || paused()) return;
        setImage(a, pizzas[next]);
        try { await a.decode(); } catch (e) {}
        if (version !== transitionVersion) return;
        b.style.transition = "none";
        b.style.opacity = "0";
        index = next;
        busy = false;
        fadeTimer = null;
      }, 2500);
    }
    paused();
    setInterval(swap, 11000);
  });
})();
