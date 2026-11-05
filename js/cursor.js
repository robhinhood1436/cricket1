(() => {
  const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const interactiveSelector = "a, button, input, select, textarea, [role='button']";
  let cursor;
  let trail;
  let animationFrame;
  let targetX = -100;
  let targetY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let trailX = -100;
  let trailY = -100;
  let rotation = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function renderCursor() {
    cursorX += (targetX - cursorX) * 0.24;
    cursorY += (targetY - cursorY) * 0.24;
    trailX += (targetX - trailX) * 0.1;
    trailY += (targetY - trailY) * 0.1;

    const horizontalSpeed = targetX - cursorX;
    rotation += (clamp(horizontalSpeed * 0.4, -13, 13) - rotation) * 0.12;

    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    cursor.style.setProperty("--cursor-rotation", `${rotation}deg`);
    trail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0)`;
    animationFrame = window.requestAnimationFrame(renderCursor);
  }

  function updateHoverState(event) {
    cursor.classList.toggle("is-hovering", Boolean(event.target.closest(interactiveSelector)));
  }

  function showCursor(event) {
    if (!cursor.classList.contains("is-visible")) {
      targetX = cursorX = trailX = event.clientX;
      targetY = cursorY = trailY = event.clientY;
      cursor.classList.add("is-visible");
      trail.classList.add("is-visible");
    }

    targetX = event.clientX;
    targetY = event.clientY;
    updateHoverState(event);
  }

  function hideCursor() {
    cursor.classList.remove("is-visible", "is-hovering");
    trail.classList.remove("is-visible");
  }

  function createCursor() {
    if (cursor || !desktopPointer.matches) return;

    cursor = document.createElement("span");
    cursor.className = "cricket-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<span class="cricket-cursor__ball"></span>';

    trail = document.createElement("span");
    trail.className = "cricket-cursor-trail";
    trail.setAttribute("aria-hidden", "true");

    document.body.append(trail, cursor);
    document.body.classList.add("has-cricket-cursor");

    document.addEventListener("pointermove", showCursor, { passive: true });
    document.addEventListener("pointerleave", hideCursor);
    window.addEventListener("blur", hideCursor);
    animationFrame = window.requestAnimationFrame(renderCursor);
  }

  function removeCursor() {
    if (!cursor) return;

    window.cancelAnimationFrame(animationFrame);
    document.removeEventListener("pointermove", showCursor);
    document.removeEventListener("pointerleave", hideCursor);
    window.removeEventListener("blur", hideCursor);
    cursor.remove();
    trail.remove();
    cursor = null;
    trail = null;
    document.body.classList.remove("has-cricket-cursor");
  }

  function syncCursorMode() {
    if (desktopPointer.matches) createCursor();
    else removeCursor();
  }

  document.addEventListener("DOMContentLoaded", syncCursorMode);
  desktopPointer.addEventListener("change", syncCursorMode);
})();
