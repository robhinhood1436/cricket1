document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.textContent = isOpen ? "Close" : "Menu";
    });
  }

  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    const onScroll = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    backToTop.addEventListener("click", () => {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((year) => {
    year.textContent = new Date().getFullYear();
  });

  const countdown = document.getElementById("offer-countdown");
  if (countdown) {
    // Set your offer deadline here (local time).
    const OFFER_END = new Date("2026-12-31T23:59:59");
    const digits = {
      days: document.getElementById("cd-days"),
      hours: document.getElementById("cd-hours"),
      minutes: document.getElementById("cd-minutes"),
      seconds: document.getElementById("cd-seconds")
    };
    const note = document.querySelector(".countdown-note");

    function updateDigit(element, value) {
      if (!element) return;
      const str = String(value).padStart(2, "0");
      if (element.textContent === str) return;
      element.classList.remove("flip-in");
      element.classList.add("flip-out");
      setTimeout(() => {
        element.textContent = str;
        element.classList.remove("flip-out");
        element.classList.add("flip-in");
        setTimeout(() => element.classList.remove("flip-in"), 260);
      }, 240);
    }

    function tick() {
      const remaining = OFFER_END.getTime() - Date.now();
      if (remaining <= 0) {
        ["days", "hours", "minutes", "seconds"].forEach((key) => updateDigit(digits[key], 0));
        if (note) note.textContent = "The offer has ended — contact us for current admission options.";
        clearInterval(timer);
        return;
      }
      updateDigit(digits.days, Math.floor(remaining / 86400000));
      updateDigit(digits.hours, Math.floor(remaining / 3600000) % 24);
      updateDigit(digits.minutes, Math.floor(remaining / 60000) % 60);
      updateDigit(digits.seconds, Math.floor(remaining / 1000) % 60);
    }

    tick();
    const timer = setInterval(tick, 1000);
  }
});
