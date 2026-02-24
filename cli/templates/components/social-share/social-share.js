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
