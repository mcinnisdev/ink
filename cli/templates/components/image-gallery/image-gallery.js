(function () {
  document.querySelectorAll(".gallery").forEach(function (gallery) {
    var galleryId = gallery.id || "gallery";
    var lightbox = document.getElementById("lightbox-" + galleryId);
    if (!lightbox) return;

    var links = gallery.querySelectorAll(".gallery__link");
    var lbImg = lightbox.querySelector(".lightbox__img");
    var lbCaption = lightbox.querySelector(".lightbox__caption");
    var currentIndex = 0;
    var images = [];

    links.forEach(function (link, i) {
      var img = link.querySelector("img");
      var caption = link.closest(".gallery__item").querySelector(".gallery__caption");
      images.push({
        src: link.href,
        alt: img ? img.alt : "",
        caption: caption ? caption.textContent : "",
      });
      link.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(i);
      });
    });

    function openLightbox(index) {
      currentIndex = index;
      updateImage();
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      lightbox.querySelector(".lightbox__close").focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      links[currentIndex].focus();
    }

    function updateImage() {
      var data = images[currentIndex];
      lbImg.src = data.src;
      lbImg.alt = data.alt;
      lbCaption.textContent = data.caption;
    }

    function navigate(dir) {
      currentIndex = (currentIndex + dir + images.length) % images.length;
      updateImage();
    }

    lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox__overlay").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox__prev").addEventListener("click", function () { navigate(-1); });
    lightbox.querySelector(".lightbox__next").addEventListener("click", function () { navigate(1); });

    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    });
  });
})();
