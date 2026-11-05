(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function initAnimations() {
    if (!window.gsap || !window.ScrollTrigger || reduceMotion.matches) return;

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("gsap-ready");

    const animationApi = {
      revealText(targets, options = {}) {
        const elements = gsap.utils.toArray(targets);
        if (!elements.length) return null;

        return gsap.from(elements, {
          autoAlpha: 0,
          y: options.y ?? 28,
          duration: options.duration ?? 0.78,
          stagger: options.stagger ?? 0.1,
          ease: options.ease ?? "power3.out",
          scrollTrigger: options.trigger === false ? undefined : {
            trigger: options.trigger || elements[0],
            start: options.start || "top 88%",
            once: true
          }
        });
      },

      revealSection(target, options = {}) {
        if (!target) return null;

        return gsap.from(target, {
          autoAlpha: 0,
          y: options.y ?? 38,
          duration: options.duration ?? 0.9,
          ease: options.ease ?? "power3.out",
          scrollTrigger: {
            trigger: options.trigger || target,
            start: options.start || "top 86%",
            once: true
          }
        });
      },

      parallax(target, options = {}) {
        if (!target) return null;

        return gsap.to(target, {
          yPercent: options.yPercent ?? -5,
          ease: "none",
          scrollTrigger: {
            trigger: options.trigger || target.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: options.scrub ?? 0.7,
            invalidateOnRefresh: true
          }
        });
      },

      staggerCards(container, options = {}) {
        if (!container) return null;
        const cards = Array.from(container.children);
        if (!cards.length) return null;

        return gsap.from(cards, {
          autoAlpha: 0,
          y: options.y ?? 32,
          scale: options.scale ?? 1,
          duration: options.duration ?? 0.72,
          stagger: options.stagger ?? 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: options.start || "top 84%",
            once: true
          }
        });
      },

      countUp(target, options = {}) {
        if (!target) return null;
        const end = Number.parseFloat(target.dataset.counter);
        if (!Number.isFinite(end)) return null;
        const state = { value: 0 };
        target.textContent = "0";
        return gsap.to(state, {
          value: end,
          duration: options.duration ?? 1.7,
          ease: options.ease ?? "power2.out",
          scrollTrigger: { trigger: target, start: "top 88%", once: true },
          onUpdate: () => { target.textContent = String(Math.round(state.value)); },
          onComplete: () => { target.textContent = String(end); }
        });
      },

      tiltCards(targets, options = {}) {
        const cards = gsap.utils.toArray(targets);
        if (!cards.length) return null;
        const cleanups = [];

        cards.forEach((card) => {
          const maxAngle = card.classList.contains("program-card") ? 2.2 : options.max ?? 5;
          const glare = document.createElement("span");
          glare.className = "card-glare";
          glare.setAttribute("aria-hidden", "true");
          card.appendChild(glare);
          gsap.set(card, { transformPerspective: 900 });

          const rotateXTo = gsap.quickTo(card, "rotationX", { duration: 0.45, ease: "power2.out" });
          const rotateYTo = gsap.quickTo(card, "rotationY", { duration: 0.45, ease: "power2.out" });

          const onMove = (event) => {
            if (event.pointerType !== "mouse") return;
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            rotateXTo((py - 0.5) * -2 * maxAngle);
            rotateYTo((px - 0.5) * 2 * maxAngle);
            card.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
            card.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
            glare.style.opacity = "1";
          };
          const onLeave = () => {
            rotateXTo(0);
            rotateYTo(0);
            glare.style.opacity = "0";
          };

          card.addEventListener("pointermove", onMove);
          card.addEventListener("pointerleave", onLeave);
          cleanups.push([card, glare, onMove, onLeave]);
        });

        return () => cleanups.forEach(([card, glare, onMove, onLeave]) => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
          glare.remove();
          gsap.set(card, { clearProps: "transform,transformPerspective" });
        });
      },

      addHoverMotion(targets, options = {}) {
        const elements = gsap.utils.toArray(targets);
        const y = options.y ?? -5;
        const scale = options.scale ?? 1.015;
        const listeners = [];

        elements.forEach((element) => {
          const onEnter = (event) => {
            if (event.pointerType !== "mouse") return;
            gsap.to(element, { y, scale, duration: 0.28, ease: "power2.out", overwrite: "auto" });
          };
          const onLeave = () => {
            gsap.to(element, { y: 0, scale: 1, duration: 0.34, ease: "power2.out", overwrite: "auto" });
          };

          element.addEventListener("pointerenter", onEnter);
          element.addEventListener("pointerleave", onLeave);
          listeners.push([element, onEnter, onLeave]);
        });

        return () => listeners.forEach(([element, onEnter, onLeave]) => {
          element.removeEventListener("pointerenter", onEnter);
          element.removeEventListener("pointerleave", onLeave);
          gsap.set(element, { clearProps: "transform" });
        });
      }
    };

    window.AJAnimations = animationApi;

    const homeHero = document.querySelector(".home-page .cinematic-content");
    if (homeHero) {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .from(".cinematic-kicker", { autoAlpha: 0, y: 22, duration: 0.55 })
        .from(".cinematic-content h1 span", { autoAlpha: 0, y: 54, duration: 0.78, stagger: 0.12 }, "-=0.16")
        .from(".cinematic-copy", { autoAlpha: 0, y: 18, duration: 0.52 }, "-=0.4")
        .from(".cinematic-actions", { autoAlpha: 0, y: 18, duration: 0.52 }, "-=0.32");
    }

    document.querySelectorAll(".mask-link").forEach((link) => {
      const dot = link.querySelector(".nav-dot");
      if (!dot) return;
      let bounceTween = null;

      // The dot becomes a delivery: drops, pitches with a squash bounce,
      // then spins away past the crease like a bowled ball.
      const playDelivery = () => {
        if (bounceTween) bounceTween.kill();
        const distance = -(link.offsetWidth + 24);
        bounceTween = gsap.timeline({ onComplete: () => { bounceTween = null; } });
        bounceTween
          .set(dot, { rotation: 0 })
          .to(dot, { y: 9, scaleX: 1.3, scaleY: 0.7, duration: 0.16, ease: "power2.in" })
          .to(dot, { y: -5, scaleX: 0.9, scaleY: 1.1, duration: 0.16, ease: "power2.out" })
          .to(dot, { y: 4, scaleX: 1.15, scaleY: 0.82, duration: 0.13, ease: "power2.in" })
          .to(dot, { x: distance, y: 0, rotation: -320, scaleX: 1, scaleY: 1, duration: 0.34, ease: "power1.out" });
      };

      const returnBall = () => {
        if (bounceTween) {
          bounceTween.kill();
          bounceTween = null;
        }
        gsap.to(dot, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.5, ease: "power3.out" });
      };

      link.addEventListener("mouseenter", () => {
        link.classList.add("hovered");
        playDelivery();
      });
      link.addEventListener("mouseleave", () => {
        link.classList.remove("hovered");
        returnBall();
      });
    });

    animationApi.revealText(".page-hero .eyebrow", { trigger: ".page-hero", y: 18 });
    const pageHeroTitle = document.querySelector(".page-hero h1");
    if (pageHeroTitle) {
      gsap.fromTo(pageHeroTitle,
        { autoAlpha: 0, y: 26, clipPath: "inset(-8% -4% 100% -4%)" },
        {
          autoAlpha: 1,
          y: 0,
          clipPath: "inset(-8% -4% -12% -4%)",
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".page-hero", start: "top 78%", once: true }
        });
    }
    animationApi.revealText(".page-hero p:last-child", { trigger: ".page-hero", y: 18 });

    document.querySelectorAll(".intro-grid, .split-layout, .contact-layout, .section-heading, .callout").forEach((section) => {
      animationApi.revealSection(section, { trigger: section.closest(".section") || section });
    });

    document.querySelectorAll(".card-grid, .program-list, .gallery-grid").forEach((group) => {
      animationApi.staggerCards(group, group.classList.contains("gallery-grid") ? { scale: 0.92 } : {});
    });

    document.querySelectorAll("[data-counter]").forEach((el) => animationApi.countUp(el));

    const responsiveAnimations = gsap.matchMedia();
    responsiveAnimations.add("(min-width: 781px)", () => {
      const playerParallax = animationApi.parallax(document.querySelector(".home-page .cinematic-player"), {
        trigger: document.querySelector(".cinematic-hero"),
        yPercent: -7
      });
      const removeHoverMotion = animationApi.addHoverMotion(".button, .feature-card, .coach-card, .gallery-tile");

      return () => {
        playerParallax?.scrollTrigger?.kill();
        playerParallax?.kill();
        removeHoverMotion?.();
      };
    });

    responsiveAnimations.add("(min-width: 781px) and (pointer: fine)", () => {
      const removeTilt = animationApi.tiltCards(".feature-card, .coach-card, .program-card");
      return () => removeTilt?.();
    });

    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.documentElement.classList.contains("page-transition-incoming")) {
      document.addEventListener("aj:transition-revealed", initAnimations, { once: true });
    } else {
      initAnimations();
    }
  });
})();
