document.documentElement.classList.add('light');
document.documentElement.classList.remove('dark');

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
  // SCROLL SMOOTH PER LINK
  // ---------------------------
const themeToggle = document.getElementById("theme-toggle");

// 1️⃣ Carica preferenza utente
if (localStorage.getItem("theme") === "dark" ||
   (!localStorage.getItem("theme") &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
}

// 2️⃣ Cambia tema al click
themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");

  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});


  // ---------------------------
  // HAMBURGER MENU OTTIMIZZATO
  // ---------------------------
const hamburger = document.querySelector('.hamburger');
const navMenu   = document.getElementById('nav-menu');
const overlay   = document.getElementById('menu-overlay');
const body      = document.body;

const closeMenu = () => {
  navMenu.classList.remove('open');
  hamburger.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  body.classList.remove('menu-open');
  hamburger.setAttribute('aria-expanded', 'false');
};

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open');
  if (overlay) overlay.classList.toggle('active', isOpen);
  body.classList.toggle('menu-open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

if (overlay) {
  overlay.addEventListener('click', closeMenu);
}


  
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
