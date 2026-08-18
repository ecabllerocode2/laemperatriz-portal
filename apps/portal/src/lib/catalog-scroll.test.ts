import { describe, expect, it } from "vitest";
import { CATALOG_SECTION_ID } from "./catalog-scroll";

describe("CATALOG_SECTION_ID", () => {
  it("uses the catalog browse anchor id", () => {
    expect(CATALOG_SECTION_ID).toBe("catalogo");
  });
});