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
