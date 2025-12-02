document.documentElement.classList.add('light');
document.documentElement.classList.remove('dark');


// ---------------------------
// SCROLL SMOOTH PER LINK
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".scroll-link[href^='#']");
    links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        event.preventDefault();

        // chiudi eventuale menu mobile aperto
        body.classList.remove('menu-open');

        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });



  // ---------------------------
  // THEME TOGGLE
  // ---------------------------
  const themeToggle = document.getElementById("theme-toggle");

  // 1️⃣ Carica preferenza utente
  if (
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }

  // 2️⃣ Cambia tema al click
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      const isDark = document.documentElement.classList.contains("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }


  // ---------------------------
  // HAMBURGER MENU + OVERLAY
  // ---------------------------
  const hamburger = document.querySelector('.hamburger');
  const navMenu   = document.getElementById('nav-menu');
  const overlay   = document.getElementById('menu-overlay');
  const body      = document.body;
  const navClose  = document.querySelector('.nav-close');

  if (!hamburger || !navMenu) return;

  const openMenu = () => {
    navMenu.classList.add('open');          // usa solo la classe, niente scroll
    hamburger.classList.add('open');
    if (overlay) overlay.classList.add('active');
    body.classList.add('menu-open');        // blocca scroll verticale
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    body.classList.remove('menu-open');     // riabilita scroll
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });


  // bottone X interno al menu
  if (navClose) {
    navClose.addEventListener('click', closeMenu);
  }

  // chiusura cliccando sull'overlay
  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  // chiudi menu cliccando ovunque fuori dal pannello e fuori dall'hamburger
  document.addEventListener('click', (e) => {
    const menuIsOpen = navMenu.classList.contains('open');
    if (!menuIsOpen) return;

    const clickInsideMenu  = navMenu.contains(e.target);
    const clickOnHamburger = hamburger.contains(e.target);

    if (!clickInsideMenu && !clickOnHamburger) {
      closeMenu();
    }
  });


  // ---------------------------
  // GESTURE SWIPE LIVE MENU (MOBILE)
  // ---------------------------
  let touchStartX = null;
  const SWIPE_THRESHOLD = 60; // px
  const MENU_WIDTH = 260;     // deve corrispondere alla width del menu in CSS

  const isMobileWidth = () => window.innerWidth <= 720;

  const applyMenuTransform = (percent) => {
    // percent: 0 (aperto) -> 100 (chiuso)
    const clamped = Math.min(100, Math.max(0, percent));
    navMenu.style.transition = 'none';
    navMenu.style.transform = `translateX(${clamped}%)`;
  };

  const snapMenuToState = (open) => {
    // ripristina il controllo al CSS
    navMenu.style.transition = '';
    navMenu.style.transform  = '';

    if (open) {
      openMenu();
    } else {
      closeMenu();
    }
  };


  document.addEventListener('touchstart', (e) => {
    if (!isMobileWidth()) return;

    const touch = e.touches[0];
    touchStartX = touch.clientX;

    const menuIsOpen = navMenu.classList.contains('open');

    // se il menu è chiuso, abilita lo swipe solo partendo dal bordo destro
    if (!menuIsOpen && touchStartX < window.innerWidth - 80) {
      touchStartX = null;
      return;
    }

    // rimuovi transizione per animazione live
    navMenu.style.transition = 'none';
  });

  document.addEventListener('touchmove', (e) => {
    if (!isMobileWidth() || touchStartX === null) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const menuIsOpen = navMenu.classList.contains('open');

    if (!menuIsOpen) {
      // swipe da destra verso sinistra per APRIRE
      if (deltaX < 0) {
        const percent = 100 + (deltaX / MENU_WIDTH) * 100;
        applyMenuTransform(percent);
      }
    } else {
      // swipe da sinistra verso destra per CHIUDERE
      if (deltaX > 0) {
        const percent = (deltaX / MENU_WIDTH) * 100;
        applyMenuTransform(percent);
      }
    }
  });

  document.addEventListener('touchend', (e) => {
    if (!isMobileWidth() || touchStartX === null) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const menuIsOpen = navMenu.classList.contains('open');

    // ripristina transizione per lo "snap"
    navMenu.style.transition = 'transform 0.3s ease';

    if (!menuIsOpen) {
      // apertura
      if (deltaX < -SWIPE_THRESHOLD) {
        snapMenuToState(true);
      } else {
        snapMenuToState(false);
      }
    } else {
      // chiusura
      if (deltaX > SWIPE_THRESHOLD) {
        snapMenuToState(false);
      } else {
        snapMenuToState(true);
      }
    }

    touchStartX = null;
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
