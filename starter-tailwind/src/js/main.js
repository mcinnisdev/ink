document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile Navigation ---
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !expanded);
      nav.classList.toggle("is-open");
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-dropdown")) {
      document.querySelectorAll(".has-dropdown").forEach((item) => {
        item.classList.remove("is-open");
        const link = item.querySelector("[aria-haspopup]");
        if (link) link.setAttribute("aria-expanded", "false");
      });
    }
  });

  // Toggle dropdowns on click (mobile)
  document.querySelectorAll(".has-dropdown > .main-nav__link").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth < 768) {
        e.preventDefault();
        const parent = link.parentElement;
        const wasOpen = parent.classList.contains("is-open");
        document.querySelectorAll(".has-dropdown").forEach((item) => {
          item.classList.remove("is-open");
        });
        if (!wasOpen) parent.classList.add("is-open");
        link.setAttribute("aria-expanded", !wasOpen);
      }
    });
  });

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", anchor.getAttribute("href"));
      }
    });
  });

  // --- Scroll Animations (IntersectionObserver) ---
  const animatedEls = document.querySelectorAll("[data-animate]");
  if (animatedEls.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    animatedEls.forEach((el) => observer.observe(el));
  } else {
    // Reduced motion or no observer: show immediately
    animatedEls.forEach((el) => el.classList.add("is-visible"));
  }

  // --- Accordion Enhancement (smooth details/summary) ---
  document.querySelectorAll(".accordion__item").forEach((details) => {
    const summary = details.querySelector(".accordion__header");
    const body = details.querySelector(".accordion__body");
    if (!summary || !body) return;

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      const accordion = details.closest("[data-single]");

      if (details.open) {
        // Closing
        body.style.maxHeight = body.scrollHeight + "px";
        requestAnimationFrame(() => {
          body.style.maxHeight = "0px";
        });
        body.addEventListener(
          "transitionend",
          () => {
            details.open = false;
            body.style.maxHeight = "";
          },
          { once: true }
        );
      } else {
        // Close siblings if data-single
        if (accordion) {
          accordion.querySelectorAll(".accordion__item[open]").forEach((sibling) => {
            if (sibling !== details) {
              sibling.open = false;
              const sibBody = sibling.querySelector(".accordion__body");
              if (sibBody) sibBody.style.maxHeight = "";
            }
          });
        }
        // Opening
        details.open = true;
        const height = body.scrollHeight;
        body.style.maxHeight = "0px";
        requestAnimationFrame(() => {
          body.style.maxHeight = height + "px";
        });
        body.addEventListener(
          "transitionend",
          () => {
            body.style.maxHeight = "";
          },
          { once: true }
        );
      }
    });
  });
});

