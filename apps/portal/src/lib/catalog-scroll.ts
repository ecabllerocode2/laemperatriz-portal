export const CATALOG_SECTION_ID = "catalogo";

export function scrollToTop(behavior: ScrollBehavior = "smooth") {
  window.scrollTo({ top: 0, behavior });
}

export function clearCatalogHash() {
  if (window.location.pathname === "/" && window.location.hash) {
    window.history.pushState(null, "", "/");
  }
}

export function goToStoreHome(behavior: ScrollBehavior = "smooth") {
  if (window.location.pathname === "/" && window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  scrollToTop(behavior);
}

export function scrollToCatalogSection(behavior: ScrollBehavior = "smooth") {
  document.getElementById(CATALOG_SECTION_ID)?.scrollIntoView({
    behavior,
    block: "start",
  });
}

export function setCatalogHash() {
  const hash = `#${CATALOG_SECTION_ID}`;
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
}

export function openCatalogSection() {
  scrollToCatalogSection();
  setCatalogHash();
}
