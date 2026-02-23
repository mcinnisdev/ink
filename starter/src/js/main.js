document.addEventListener("DOMContentLoaded", () => {
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
});
