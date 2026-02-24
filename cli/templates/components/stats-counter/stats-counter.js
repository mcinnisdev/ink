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
