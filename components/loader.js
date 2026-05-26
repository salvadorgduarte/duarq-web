/**
 * Carga un fragmento HTML vía fetch e inyecta en el placeholder.
 * Reemplaza el placeholder por el markup del componente (sin wrapper extra).
 */
async function loadComponent(placeholderId, componentPath) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  const response = await fetch(componentPath);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${componentPath}: ${response.status}`);
  }

  const html = await response.text();
  placeholder.outerHTML = html.trim();
}

/** Clave de página a partir del pathname (sin .html). */
function getCurrentPageKey() {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  if (!file || file === 'index.html') return null;
  return file.replace(/\.html$/, '');
}

const NAV_ACTIVE_PAGES = new Set(['como-funciona', 'casos', 'nosotros']);

/** Aplica text-blue-400 al link de nav que corresponde a la página actual. */
function applyNavActiveState() {
  const page = getCurrentPageKey();
  if (!page || !NAV_ACTIVE_PAGES.has(page)) return;

  document.querySelectorAll(`[data-nav-item="${page}"]`).forEach((link) => {
    if (link.classList.contains('nav-link')) {
      link.classList.remove('text-gray-400', 'hover:text-white');
    } else {
      link.classList.remove('text-gray-300', 'hover:text-white');
    }
    link.classList.add('text-blue-400');
  });
}

/** Estilos de footer específicos por página (p. ej. mt-10 en diagnóstico). */
function applyFooterPageStyles() {
  if (getCurrentPageKey() !== 'diagnostico') return;
  const footer = document.querySelector('footer');
  if (footer) footer.classList.add('mt-10');
}

/** Toggle del menú móvil (debe ejecutarse después de inyectar nav.html). */
function initMobileNav() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const bar3 = document.getElementById('bar3');
  if (!menuBtn || !mobileMenu || !bar3) return;

  let isOpen = false;

  menuBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      mobileMenu.classList.remove('menu-hidden');
      mobileMenu.classList.add('menu-open');
      bar3.style.width = '20px';
    } else {
      mobileMenu.classList.remove('menu-open');
      mobileMenu.classList.add('menu-hidden');
      bar3.style.width = '12px';
    }
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      isOpen = false;
      mobileMenu.classList.remove('menu-open');
      mobileMenu.classList.add('menu-hidden');
      bar3.style.width = '12px';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const tasks = [];

  if (document.getElementById('nav-placeholder')) {
    tasks.push(
      loadComponent('nav-placeholder', 'components/nav.html').then(() => {
        applyNavActiveState();
        initMobileNav();
      })
    );
  }

  if (document.getElementById('footer-placeholder')) {
    tasks.push(
      loadComponent('footer-placeholder', 'components/footer.html').then(applyFooterPageStyles)
    );
  }

  Promise.all(tasks).catch((err) => console.error('[duarq components]', err));
});
