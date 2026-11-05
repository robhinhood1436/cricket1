(() => {
  "use strict";

  const STORAGE_KEY = "aj-cricket-theme";
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (error) {}
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      const isDark = theme === "dark";
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (error) {}

  const initial = stored === "dark" || stored === "light"
    ? stored
    : (systemDark.matches ? "dark" : "light");
  apply(initial);

  const SWITCH_CLASS = "is-switching";

  function pulseSwitch(button) {
    if (!button) return;
    button.classList.add(SWITCH_CLASS);
    window.setTimeout(() => button.classList.remove(SWITCH_CLASS), 800);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".theme-toggle");
    if (!button) return;
    pulseSwitch(button);
    apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  systemDark.addEventListener("change", (event) => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) apply(event.matches ? "dark" : "light");
    } catch (error) {}
  });
})();