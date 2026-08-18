import { useEffect, useMemo, useState } from "react";
import type { Category } from "@emperatriz/types";
import type { CatalogHeroSlide } from "@/lib/catalog-hero-slides";
import { fetchCatalogHeroSlides } from "@/lib/portal-store";

export function usePortalHeroSlides(categories: Category[]) {
  const [slides, setSlides] = useState<CatalogHeroSlide[]>([]);
  const categoryKey = useMemo(
    () => categories.map((category) => category.id).sort().join("|"),
    [categories],
  );

  useEffect(() => {
    if (!categoryKey) {
      setSlides([]);
      return;
    }

    let cancelled = false;

    void fetchCatalogHeroSlides(categories).then((nextSlides) => {
      if (!cancelled) setSlides(nextSlides);
    });

    return () => {
      cancelled = true;
    };
  }, [categories, categoryKey]);

  return slides;
}
