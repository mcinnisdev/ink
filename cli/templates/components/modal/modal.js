(function () {
  var openButtons = document.querySelectorAll("[data-modal-open]");
  var lastFocused = null;

  function openModal(modal) {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var close = modal.querySelector(".modal__close");
    if (close) close.focus();
    trapFocus(modal);
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function trapFocus(modal) {
    var focusable = modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    modal.addEventListener("keydown", function handler(e) {
      if (modal.hidden) {
        modal.removeEventListener("keydown", handler);
        return;
      }
      if (e.key === "Escape") {
        closeModal(modal);
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  openButtons.forEach(function (btn) {
    var modalId = btn.getAttribute("data-modal-open");
    var modal = document.getElementById(modalId);
    if (!modal) return;
    btn.addEventListener("click", function () {
      openModal(modal);
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", function () {
      var modal = el.closest(".modal");
      if (modal) closeModal(modal);
    });
  });
})();
