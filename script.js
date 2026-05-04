/* ===================================================================
   DISSENSI – Script principale
   - Theme toggle (con localStorage + prefers-color-scheme)
   - Menu mobile off-canvas (hamburger + overlay + Escape + focus trap)
   - Smooth scroll per ancore con offset header
   - Animazioni di entrata homepage
   =================================================================== */

(function () {
  "use strict";

  /* -----------------------------------------------------------------
     Helper: safe localStorage (Safari private mode lancia eccezioni)
     ----------------------------------------------------------------- */
  const safeStorage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        /* noop */
      }
    },
  };

  /* -----------------------------------------------------------------
     THEME — applicazione iniziale (prima del DOMContentLoaded
     per evitare flash of unstyled content)
     ----------------------------------------------------------------- */
  function applyInitialTheme() {
    const saved = safeStorage.get("theme");
    const root = document.documentElement;

    if (saved === "dark") {
      root.classList.add("dark");
    } else if (saved === "light") {
      root.classList.remove("dark");
    } else {
      // Nessuna preferenza salvata → segue il sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
  }

  applyInitialTheme();

  /* -----------------------------------------------------------------
     Tutto il resto al DOMContentLoaded
     ----------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    /* ---------------- THEME TOGGLE ---------------- */
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      const updateAria = () => {
        const isDark = document.documentElement.classList.contains("dark");
        themeToggle.setAttribute(
          "aria-label",
          isDark ? "Attiva tema chiaro" : "Attiva tema scuro"
        );
        themeToggle.setAttribute("aria-pressed", String(isDark));
      };
      updateAria();

      themeToggle.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        safeStorage.set("theme", isDark ? "dark" : "light");
        updateAria();
      });

      // Sincronizza se l'utente cambia il tema OS in tempo reale
      // (solo se non ha già scelto manualmente)
      try {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
          if (!safeStorage.get("theme")) {
            document.documentElement.classList.toggle("dark", e.matches);
            updateAria();
          }
        });
      } catch (err) {
        /* alcuni browser legacy non supportano addEventListener su MQ */
      }
    }

    /* ---------------- MOBILE MENU ---------------- */
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.getElementById("nav-menu");
    const overlay = document.getElementById("menu-overlay");
    const body = document.body;
    const html = document.documentElement;

    if (hamburger && navMenu) {
      let lastFocused = null;
      let isAnimating = false;       // debounce tap rapidi
      let savedScrollY = 0;          // posizione di scroll preservata

      const focusableSelector =
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

      // Lock scroll preservando la posizione (tecnica iOS-safe).
      // Salva scrollY → fixed body con top negativo → al rilascio ripristina.
      const lockScroll = () => {
        savedScrollY = window.scrollY || window.pageYOffset || 0;
        body.style.top = `-${savedScrollY}px`;
        body.classList.add("menu-open");
      };

      const unlockScroll = () => {
        body.classList.remove("menu-open");
        body.style.top = "";
        // Ripristino con scrollTo classico (x, y): universalmente supportato,
        // sempre istantaneo. La forma con behavior:"instant" non è supportata
        // dappertutto e rischia fallback a smooth (= flicker visibile).
        window.scrollTo(0, savedScrollY);
      };

      const openMenu = () => {
        if (isAnimating || navMenu.classList.contains("open")) return;
        isAnimating = true;
        lastFocused = document.activeElement;

        lockScroll();
        if (overlay) overlay.classList.add("active");
        // Doppio rAF: forza un layout flush prima della transition,
        // così il transform parte da translateX(100%) verso 0 in modo animato
        // (senza questo, browser come Safari saltano la transition).
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            navMenu.classList.add("open");
            hamburger.classList.add("open");
            hamburger.setAttribute("aria-expanded", "true");
          });
        });

        // Rilascio del lock dopo la durata della transition.
        // Sblocca anche il focus management.
        setTimeout(() => {
          isAnimating = false;
          const firstLink = navMenu.querySelector(focusableSelector);
          if (firstLink) firstLink.focus({ preventScroll: true });
        }, 350);
      };

      const closeMenu = (returnFocus = true) => {
        if (isAnimating || !navMenu.classList.contains("open")) return;
        isAnimating = true;

        navMenu.classList.remove("open");
        hamburger.classList.remove("open");
        if (overlay) overlay.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");

        // Aspetta la fine della transition prima di sbloccare lo scroll
        // (altrimenti l'utente vede il salto verticale a metà animazione).
        setTimeout(() => {
          unlockScroll();
          if (returnFocus && lastFocused && typeof lastFocused.focus === "function") {
            lastFocused.focus({ preventScroll: true });
          }
          isAnimating = false;
        }, 320);
      };

      hamburger.addEventListener("click", () => {
        if (navMenu.classList.contains("open")) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      if (overlay) {
        overlay.addEventListener("click", () => closeMenu());
      }

      // Chiusura con Escape + focus trap
      document.addEventListener("keydown", (e) => {
        if (!navMenu.classList.contains("open")) return;

        if (e.key === "Escape") {
          e.preventDefault();
          closeMenu();
          return;
        }

        if (e.key === "Tab") {
          const focusables = Array.from(navMenu.querySelectorAll(focusableSelector));
          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      // Chiudi al click su un link interno (UX mobile)
      navMenu.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          // Non aspettiamo la transition perché stiamo navigando via.
          // Pulizia immediata dello stato per evitare flash post-navigazione.
          body.classList.remove("menu-open");
          body.style.top = "";
        }
      });

      // Chiudi se la viewport torna desktop (evita stato incongruente)
      const mqDesktop = window.matchMedia("(min-width: 901px)");
      const handleViewport = (e) => {
        if (e.matches && navMenu.classList.contains("open")) {
          // Pulizia istantanea, senza animazione
          navMenu.classList.remove("open");
          hamburger.classList.remove("open");
          if (overlay) overlay.classList.remove("active");
          hamburger.setAttribute("aria-expanded", "false");
          body.classList.remove("menu-open");
          body.style.top = "";
          isAnimating = false;
        }
      };
      try {
        mqDesktop.addEventListener("change", handleViewport);
      } catch (err) {
        mqDesktop.addListener(handleViewport); // fallback Safari < 14
      }
    }

    /* ---------------- SMOOTH SCROLL CON OFFSET HEADER ---------------- */
    const scrollLinks = document.querySelectorAll('.scroll-link[href^="#"]');
    scrollLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href").slice(1);
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (!target) return;

        event.preventDefault();

        const header = document.querySelector(".site-header");
        const offset = header ? header.getBoundingClientRect().height + 16 : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });

        // Sposta il focus per accessibilità
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });

    /* ---------------- ANIMAZIONI ENTRATA HOMEPAGE ---------------- */
    // (Non serve più JS specifico: l'animazione CSS si applica da sola
    // tramite la regola @keyframes heroIn)
  });
})();
