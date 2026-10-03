/* Slice & Co — interactions discrètes, dans la présentation d'origine. */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.documentElement;
    var motion = matchMedia("(prefers-reduced-motion: reduce)");
    function motionIsPaused() { return motion.matches; }
    function applyMotionPreference() {
      var paused = motionIsPaused();
      root.classList.toggle("motion-paused", paused);
      root.classList.add("motion-ready");
      if (paused) {
        root.classList.remove("intro-pending");
        root.classList.add("intro-seen");
        document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      }
      document.dispatchEvent(new Event("sco:motionchange"));
    }
    motion.addEventListener("change", applyMotionPreference);
    addEventListener("pageshow", applyMotionPreference);
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
      var elements = document.querySelectorAll(".card,.feature,.offer,.menu-cat,.section-head,.info,.cta-band .wrap,.map-shell,.pizza-tile,.menu-poster,.deal,.order-option,.faq-list details");
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            reveal.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06 });
      elements.forEach(function (el) { el.classList.add("reveal"); reveal.observe(el); });
      document.querySelectorAll(".pizza-tile").forEach(function (el, index) {
        el.style.setProperty("--reveal-delay", ((index % (matchMedia("(max-width: 760px)").matches ? 2 : 3)) * 60) + "ms");
      });
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
      var background = [document.querySelector(".topbar"), document.querySelector("main"), document.querySelector("footer"), document.querySelector(".mobile-actions"), document.querySelector(".skip-link"), header && header.querySelector(".brand")].filter(Boolean);
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

    // Rotation automatique et changement au clic, avec des WebP chargés à la demande.
    var box = document.querySelector(".hero-pizza");
    if (!box) return;
    var pizzaButton = box.querySelector(".hero-pizza-switch");
    var a = box.querySelector("img.pz-a"), b = box.querySelector("img.pz-b");
    if (!a || !b || !pizzaButton) return;
    var pizzas = [
      { slug: "margherita", name: "Margherita", width: 1254 },
      { slug: "pepperoni", name: "Pepperoni", width: 1024 },
      { slug: "bbq-chicken", name: "BBQ Chicken", width: 760 },
      { slug: "veggie-supreme-hq", name: "Veggie Supreme", width: 1254 },
      { slug: "full-cheesy-hq", name: "Full Cheesy", width: 1254 },
      { slug: "buffalo-spicy-chicken-hq", name: "Buffalo Spicy Chicken", width: 1254 },
      { slug: "manhattan-cheesecake", name: "Manhattan Cheesecake", width: 1254 }
    ];
    var imageVersion = "20261003-hq";
    var announcement = document.getElementById("hero-pizza-announcement");
    var index = 0, busy = false, heroVisible = true, fadeTimer = null, autoTimer = null;
    var transitionVersion = 0, pendingManual = 0, activeManual = false, finishCurrent = null, keyboardFocused = false;
    function paused() {
      var pause = document.hidden || !heroVisible || motionIsPaused() || keyboardFocused;
      box.classList.toggle("is-paused", pause);
      return pause;
    }
    function scheduleAuto() {
      clearTimeout(autoTimer);
      autoTimer = null;
      if (!paused()) autoTimer = setTimeout(function () { autoTimer = null; swap(false); }, 11000);
    }
    function cancelSwap() {
      transitionVersion += 1;
      clearTimeout(fadeTimer);
      fadeTimer = null;
      b.style.transition = "none";
      b.style.opacity = "0";
      busy = false;
      pendingManual = 0;
      finishCurrent = null;
    }
    function syncHeroMotion() {
      paused();
      if (document.hidden || !heroVisible || motionIsPaused()) cancelSwap();
      scheduleAuto();
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; syncHeroMotion(); }).observe(box);
    }
    document.addEventListener("visibilitychange", syncHeroMotion);
    document.addEventListener("sco:motionchange", syncHeroMotion);
    function syncKeyboardFocus() {
      paused();
      clearTimeout(autoTimer);
      if (keyboardFocused && busy && !activeManual) cancelSwap();
    }
    pizzaButton.addEventListener("focus", function () {
      keyboardFocused = pizzaButton.matches(":focus-visible");
      syncKeyboardFocus();
    });
    pizzaButton.addEventListener("keydown", function () { keyboardFocused = true; syncKeyboardFocus(); });
    // Un clic sur un bouton déjà utilisé au clavier ne déclenche pas un nouveau focus.
    pizzaButton.addEventListener("pointerdown", function () { keyboardFocused = false; scheduleAuto(); });
    pizzaButton.addEventListener("blur", function () { keyboardFocused = false; scheduleAuto(); });
    addEventListener("pagehide", function () { clearTimeout(autoTimer); cancelSwap(); });
    addEventListener("pageshow", syncHeroMotion);
    function setImage(img, pizza) {
      var base = "assets/img/pizzas/web/" + pizza.slug + "-";
      var sizes = [480, 800, 1280].filter(function (size) { return size < pizza.width; }).concat(pizza.width);
      img.srcset = sizes.map(function (size) { return base + size + ".webp?v=" + imageVersion + " " + size + "w"; }).join(", ");
      img.src = base + Math.min(800, pizza.width) + ".webp?v=" + imageVersion;
      img.width = pizza.width;
      img.height = pizza.width;
      if (img === a) img.alt = "Pizza " + pizza.name + " Slice & Co, vue de dessus";
    }
    async function swap(manual) {
      if (document.hidden || (!manual && paused())) return;
      clearTimeout(autoTimer);
      if (busy) {
        if (manual) {
          pendingManual += 1;
          if (!activeManual && finishCurrent && fadeTimer !== null) {
            clearTimeout(fadeTimer);
            b.style.transition = "opacity 420ms ease-in-out";
            fadeTimer = setTimeout(finishCurrent, 470);
          }
        }
        return;
      }
      busy = true;
      activeManual = manual;
      var version = ++transitionVersion;
      var next = (index + 1) % pizzas.length;
      setImage(b, pizzas[next]);
      try { await b.decode(); } catch (e) {
        if (version === transitionVersion) { cancelSwap(); scheduleAuto(); }
        return;
      }
      if (version !== transitionVersion) return;
      if (document.hidden || !heroVisible || (!manual && paused())) { cancelSwap(); scheduleAuto(); return; }
      var duration = motionIsPaused() ? 0 : manual || pendingManual ? 420 : 2400;
      async function commit() {
        if (version !== transitionVersion) return;
        if (document.hidden || !heroVisible || (!manual && paused())) { cancelSwap(); scheduleAuto(); return; }
        index = next;
        setImage(a, pizzas[next]);
        pizzaButton.setAttribute("aria-label", "Afficher la pizza suivante — " + pizzas[next].name + " affichée");
        if (manual && announcement) announcement.textContent = "Pizza " + pizzas[next].name;
        try { await a.decode(); } catch (e) {}
        if (version !== transitionVersion) return;
        b.style.transition = "none";
        b.style.opacity = "0";
        busy = false;
        fadeTimer = null;
        finishCurrent = null;
        if (pendingManual) { pendingManual -= 1; swap(true); }
        else scheduleAuto();
      }
      finishCurrent = commit;
      if (!duration) {
        b.style.transition = "none";
        b.style.opacity = "1";
        await commit();
        return;
      }
      b.style.transition = "opacity " + duration + "ms ease-in-out";
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        if (version !== transitionVersion) return;
        if (document.hidden || !heroVisible || (!manual && paused())) { cancelSwap(); scheduleAuto(); return; }
        if (pendingManual && !manual) { duration = 420; b.style.transition = "opacity 420ms ease-in-out"; }
        b.style.opacity = "1";
        fadeTimer = setTimeout(commit, duration + 50);
      }); });
    }
    pizzaButton.addEventListener("click", function () { swap(true); });
    pizzaButton.disabled = false;
    scheduleAuto();
  });
})();
