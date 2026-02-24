document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile Navigation ---
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const bar1 = document.getElementById("bar1");
  const bar2 = document.getElementById("bar2");
  const bar3 = document.getElementById("bar3");

  if (menuToggle && mobileMenu) {
    let menuOpen = false;
    menuToggle.addEventListener("click", () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle("hidden", !menuOpen);
      menuToggle.setAttribute("aria-expanded", menuOpen);
      if (bar1) bar1.style.transform = menuOpen ? "translateY(8px) rotate(45deg)" : "";
      if (bar2) bar2.style.opacity = menuOpen ? "0" : "";
      if (bar3) bar3.style.transform = menuOpen ? "translateY(-8px) rotate(-45deg)" : "";
    });
  }

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


// --- Tabs (added by Ink CLI) ---
(function () {
  document.querySelectorAll(".tabs").forEach(function (tabsContainer) {
    var tabList = tabsContainer.querySelector('[role="tablist"]');
    var tabs = tabList.querySelectorAll('[role="tab"]');
    var panels = tabsContainer.querySelectorAll('[role="tabpanel"]');

    function activateTab(tab) {
      tabs.forEach(function (t) {
        t.setAttribute("aria-selected", "false");
        t.setAttribute("tabindex", "-1");
      });
      panels.forEach(function (p) {
        p.hidden = true;
      });

      tab.setAttribute("aria-selected", "true");
      tab.removeAttribute("tabindex");
      tab.focus();

      var panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = false;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateTab(tab);
      });
    });

    tabList.addEventListener("keydown", function (e) {
      var index = Array.from(tabs).indexOf(document.activeElement);
      if (index === -1) return;

      var next;
      if (e.key === "ArrowRight") {
        next = tabs[(index + 1) % tabs.length];
      } else if (e.key === "ArrowLeft") {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (e.key === "Home") {
        next = tabs[0];
      } else if (e.key === "End") {
        next = tabs[tabs.length - 1];
      }

      if (next) {
        e.preventDefault();
        activateTab(next);
      }
    });
  });
})();


// --- Stats Counter (added by Ink CLI) ---
(function () {
  var counters = document.querySelectorAll(".stats-counter__value[data-count]");
  if (!counters.length) return;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var prefix = el.textContent.match(/^[^\d]*/)[0] || "";
    var suffix = el.textContent.match(/[^\d]*$/)[0] || "";
    var duration = 1500;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    counters.forEach(function (el) {
      var target = el.getAttribute("data-count");
      var prefix = el.textContent.match(/^[^\d]*/)[0] || "";
      var suffix = el.textContent.match(/[^\d]*$/)[0] || "";
      el.textContent = prefix + parseInt(target, 10).toLocaleString() + suffix;
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach(function (el) {
    observer.observe(el);
  });
})();


// --- Social Share (added by Ink CLI) ---
(function () {
  document.querySelectorAll(".social-share__btn--copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = btn.getAttribute("data-share-url");
      if (!url) return;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          showCopied(btn);
        });
      } else {
        var input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        showCopied(btn);
      }
    });
  });

  function showCopied(btn) {
    btn.classList.add("copied");
    var original = btn.getAttribute("aria-label");
    btn.setAttribute("aria-label", "Link copied!");
    setTimeout(function () {
      btn.classList.remove("copied");
      btn.setAttribute("aria-label", original);
    }, 2000);
  }
})();

