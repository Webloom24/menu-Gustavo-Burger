/**
 * GUSTAVO BURGER — Menú Digital
 * script.js — Funcionalidad de tabs / categorías
 *
 * Lógica:
 *  - Al hacer clic en un tab-btn se muestra el panel correspondiente
 *    (data-tab en el botón == id del panel sin prefijo "panel-")
 *  - Animación fadeInUp definida en CSS
 *  - Scroll automático al inicio del panel en móvil
 *  - Hash URL opcional para compartir categorías (ej: menu.html#perros)
 */

(function () {
  'use strict';

  /* ── Seleccionar elementos ── */
  const tabBtns    = document.querySelectorAll('.tab-btn');
  const tabPanels  = document.querySelectorAll('.tab-panel');
  const tabsScroll = document.querySelector('.tabs-scroll');

  if (!tabBtns.length || !tabPanels.length) return; // Salir si no hay tabs

  /**
   * Activa el tab cuyo data-tab coincide con `tabId`.
   * Todas las mutaciones del DOM se agrupan en requestAnimationFrame
   * para evitar reflows múltiples y mantener 60fps.
   * @param {string}  tabId  — valor de data-tab del botón
   * @param {boolean} scroll — hacer scroll al header de la sección
   */
  function activateTab(tabId, scroll = false) {
    requestAnimationFrame(() => {
      // Desactivar todos los botones y paneles
      tabBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(panel => panel.classList.remove('active'));

      // Activar el botón y panel seleccionados
      const activeBtn   = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      const activePanel = document.getElementById(`panel-${tabId}`);

      if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
        // Centrar el tab activo en la barra de scroll horizontal
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }

      if (activePanel) {
        activePanel.classList.add('active');

        // Scroll suave al inicio de la sección en móvil
        if (scroll) {
          const tabsWrapper = document.querySelector('.tabs-wrapper');
          const offset  = tabsWrapper ? tabsWrapper.offsetHeight + tabsWrapper.offsetTop : 0;
          const panelTop = activePanel.getBoundingClientRect().top + window.scrollY - offset - 8;
          window.scrollTo({ top: panelTop, behavior: 'smooth' });
        }
      }

      // Actualizar URL hash para compartir (sin recargar)
      try {
        history.replaceState(null, '', `#${tabId}`);
      } catch (_) { /* silencioso en file:// */ }
    });
  }

  /* ── Event delegation para clics (1 listener en lugar de N) ── */
  if (tabsScroll) {
    tabsScroll.addEventListener('click', e => {
      const btn = e.target.closest('.tab-btn');
      if (btn?.dataset.tab) activateTab(btn.dataset.tab, true);
    }, { passive: true });
  }

  /* ── Soporte de teclado (accesibilidad) ── */
  tabBtns.forEach((btn, index) => {
    btn.addEventListener('keydown', e => {
      let newIndex = index;
      if      (e.key === 'ArrowRight' || e.key === 'ArrowDown') newIndex = (index + 1) % tabBtns.length;
      else if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   newIndex = (index - 1 + tabBtns.length) % tabBtns.length;
      else if (e.key === 'Home') newIndex = 0;
      else if (e.key === 'End')  newIndex = tabBtns.length - 1;
      else return; // Tecla no relevante
      e.preventDefault();
      tabBtns[newIndex].focus();
      activateTab(tabBtns[newIndex].dataset.tab, false);
    });
  });

  /* ── Leer hash de URL al cargar (para links directos) ── */
  function initFromHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) {
      const matchingBtn = document.querySelector(`.tab-btn[data-tab="${hash}"]`);
      if (matchingBtn) { activateTab(hash, false); return; }
    }
    // Default: activar el primero
    const firstTab = tabBtns[0]?.dataset.tab;
    if (firstTab) activateTab(firstTab, false);
  }

  initFromHash();

  /* ── Listener de hashchange (botón atrás/adelante del navegador) ── */
  window.addEventListener('hashchange', initFromHash, { passive: true });

})();
