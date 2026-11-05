(() => {
  "use strict";

  const STORAGE_KEY = "aj-cricket-transition";
  const TRANSITION_EVENT = "aj:transition-revealed";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let transitionRunning = false;
  let activeTween = null;
  const prefetchedPages = new Set();

  function getLayer() {
    return document.getElementById("page-transition-layer");
  }

  const BALL_WRAP_SELECTOR = ".page-transition-ball-wrap";
  const BALL_SELECTOR = ".page-transition-ball";

  function getPendingTransition() {
    try {
      const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (!value || !value.destination || Date.now() - value.startedAt > 6000) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return new URL(value.destination, window.location.href).href === window.location.href ? value : null;
    } catch (error) {
      return null;
    }
  }

  function storePendingTransition(destination) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        destination: destination.href,
        startedAt: Date.now()
      }));
    } catch (error) {
      // A normal navigation still works if storage is unavailable.
    }
  }

  function clearPendingTransition() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Storage may be disabled; there is nothing else to clear.
    }
  }

  function prepareLayer(layer) {
    layer.classList.add("is-active");
    document.body.classList.add("is-page-transitioning");
  }

  function clearLayer(layer) {
    layer.classList.remove("is-active");
    document.body.classList.remove("is-page-transitioning");
    document.documentElement.classList.remove("page-transition-incoming");
    if (window.gsap) {
      gsap.set(layer, { clearProps: "transform,opacity,visibility" });
    }
  }

  function revealDestination(layer) {
    clearLayer(layer);
    transitionRunning = false;
    activeTween = null;
    document.dispatchEvent(new CustomEvent(TRANSITION_EVENT));
  }

  function startExit(destination) {
    const layer = getLayer();
    const { gsap } = window;
    if (!layer || !gsap) {
      window.location.assign(destination.href);
      return;
    }
    prepareLayer(layer);
    gsap.set(layer, { x: 0, autoAlpha: 0 });
    gsap.set(BALL_WRAP_SELECTOR, { x: "-72px" });
    const safetyTimer = window.setTimeout(() => {
      storePendingTransition(destination);
      window.location.assign(destination.href);
    }, 1100);
    activeTween = gsap.to(layer, {
      autoAlpha: 1,
      duration: 0.12,
      ease: "power1.in",
      onComplete: () => {
        window.clearTimeout(safetyTimer);
        storePendingTransition(destination);
        window.location.assign(destination.href);
      }
    });
  }

  function startTransition(destination) {
    if (transitionRunning) {
      // A click arrived mid-animation (outgoing exit or incoming reveal).
      // Rather than dropping it, cancel whatever is running and cut
      // straight to a clean slate so the new transition can start at once.
      if (activeTween) {
        activeTween.kill();
        activeTween = null;
      }
      const runningLayer = getLayer();
      if (runningLayer) clearLayer(runningLayer);
      transitionRunning = false;
    }
    transitionRunning = true;
    if (prefersReducedMotion.matches) {
      window.location.assign(destination.href);
      return;
    }
    startExit(destination);
  }

  function startIncomingTransition(pending) {
    const layer = getLayer();
    if (!layer || !window.gsap || prefersReducedMotion.matches) {
      document.documentElement.classList.remove("page-transition-incoming");
      document.dispatchEvent(new CustomEvent(TRANSITION_EVENT));
      return;
    }
    const { gsap } = window;
    transitionRunning = true;
    prepareLayer(layer);
    clearPendingTransition();

    // The rolling-ball reveal is reserved for arrivals on the homepage;
    // every other page gets a plain, clean veil slide instead.
    const rollingBall = document.body.classList.contains("home-page");

    gsap.set(layer, { x: 0, autoAlpha: 1 });
    gsap.set(BALL_WRAP_SELECTOR, rollingBall ? { x: "-72px", autoAlpha: 1 } : { autoAlpha: 0 });

    if (!rollingBall) {
      activeTween = gsap.to(layer, {
        x: "100vw",
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => revealDestination(layer)
      });
      return;
    }

    gsap.set(BALL_SELECTOR, { rotation: 0 });

    activeTween = gsap.timeline({
      onComplete: () => revealDestination(layer)
    });
    activeTween
      .to(layer, { x: "100vw", duration: 0.3, ease: "power1.inOut" }, 0)
      .to(BALL_WRAP_SELECTOR, { x: "110vw", duration: 0.3, ease: "power1.inOut" }, 0)
      .to(BALL_SELECTOR, { rotation: 600, duration: 0.3, ease: "none" }, 0);
  }

  const navigableProtocols = new Set(["http:", "https:", "file:"]);

  function isNavigableLink(link) {
    if (!link || link.target === "_blank" || link.hasAttribute("download") || link.hasAttribute("data-no-transition")) return null;
    const rawHref = link.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#")) return null;
    if (link.closest("#page-transition-layer")) return null;
    const destination = new URL(link.href, window.location.href);
    const current = new URL(window.location.href);
    if (!navigableProtocols.has(destination.protocol) || destination.protocol !== current.protocol) return null;
    const isSamePage = destination.pathname === current.pathname && destination.search === current.search;
    return destination.origin === current.origin && !isSamePage ? destination : null;
  }

  function prefetchPage(link) {
    const destination = isNavigableLink(link);
    if (!destination || prefetchedPages.has(destination.href) || window.location.protocol === "file:") return;
    prefetchedPages.add(destination.href);
    window.fetch(destination.href, { credentials: "same-origin" }).catch(() => {});
  }

  function closeMobileNav() {
    const nav = document.querySelector(".site-nav");
    if (!nav || !nav.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    const toggle = document.querySelector(".menu-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
    }
  }

  function bindNavigation() {
    // Every internal link on the site gets the transition, not just the
    // top nav — hero buttons, callouts, "Enquire now" links, footer logo —
    // otherwise navigation feels smooth in some spots and abrupt in others.
    document.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("pointerenter", () => prefetchPage(link), { passive: true });
      link.addEventListener("focus", () => prefetchPage(link), { passive: true });
    });
    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest("a[href]");
      const destination = isNavigableLink(link);
      if (!destination) return;
      event.preventDefault();
      closeMobileNav();
      try {
        startTransition(destination);
      } catch (error) {
        window.location.assign(destination.href);
      }
    });
  }

  function initialiseTransition() {
    const pending = getPendingTransition();
    bindNavigation();
    if (pending) startIncomingTransition(pending);
    else {
      clearPendingTransition();
      document.documentElement.classList.remove("page-transition-incoming");
    }
  }

  document.addEventListener("DOMContentLoaded", initialiseTransition);

  // If a page gets frozen mid-transition (layer still opaque, scroll locked)
  // and the browser later restores it from bfcache on a back/forward
  // navigation, DOMContentLoaded never fires again to clean it up. Without
  // this, the page can come back stuck behind a black overlay.
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    if (activeTween) {
      activeTween.kill();
      activeTween = null;
    }
    const layer = getLayer();
    if (layer) clearLayer(layer);
    transitionRunning = false;
    clearPendingTransition();
    document.documentElement.classList.remove("page-transition-incoming");
  });
  document.documentElement.setAttribute("data-transition-ready", "1");
})();