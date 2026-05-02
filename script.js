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

    if (hamburger && navMenu) {
      let lastFocused = null;

      const focusableSelector =
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

      const openMenu = () => {
        lastFocused = document.activeElement;
        navMenu.classList.add("open");
        hamburger.classList.add("open");
        if (overlay) overlay.classList.add("active");
        body.classList.add("menu-open");
        hamburger.setAttribute("aria-expanded", "true");

        // Focus sul primo link per accessibilità tastiera
        const firstLink = navMenu.querySelector(focusableSelector);
        if (firstLink) {
          // microtask per attendere la transizione
          requestAnimationFrame(() => firstLink.focus());
        }
      };

      const closeMenu = (returnFocus = true) => {
        navMenu.classList.remove("open");
        hamburger.classList.remove("open");
        if (overlay) overlay.classList.remove("active");
        body.classList.remove("menu-open");
        hamburger.setAttribute("aria-expanded", "false");

        if (returnFocus && lastFocused && typeof lastFocused.focus === "function") {
          lastFocused.focus();
        }
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
          closeMenu(false);
        }
      });

      // Chiudi se la viewport torna desktop (evita stato incongruente)
      const mqDesktop = window.matchMedia("(min-width: 901px)");
      const handleViewport = (e) => {
        if (e.matches && navMenu.classList.contains("open")) {
          closeMenu(false);
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
