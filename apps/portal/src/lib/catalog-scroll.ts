export const CATALOG_SECTION_ID = "catalogo";

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
