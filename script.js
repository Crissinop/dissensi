document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // SCROLL SMOOTH PER LINK
  // ---------------------------
  const links = document.querySelectorAll(".scroll-link[href^='#']");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        event.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });

  // ---------------------------
  // HAMBURGER MENU OTTIMIZZATO
  // ---------------------------
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.getElementById("nav-menu");
  const overlay = document.getElementById("menu-overlay");
  const body = document.body;

  const closeMenu = () => {
    navMenu.classList.remove("open");
    hamburger.classList.remove("open");
    overlay.classList.remove("active");
    body.classList.remove("menu-open");
    hamburger.setAttribute("aria-expanded", "false");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    overlay.classList.toggle("active", isOpen);
    body.classList.toggle("menu-open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  overlay.addEventListener("click", closeMenu);

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // ---------------------------
  // FADE-IN IMMAGINE HOMEPAGE
  // ---------------------------
  const fadeImage = document.getElementById("fade-image-container");
  if (fadeImage) setTimeout(() => fadeImage.classList.add("visible"), 200);

  const overlayText = document.querySelector(".overlay-text");
  if (overlayText) setTimeout(() => overlayText.classList.add("visible"), 300);

  const suboverlayText = document.querySelector(".suboverlay-text");
  if (suboverlayText) setTimeout(() => suboverlayText.classList.add("visible"), 600);
});
