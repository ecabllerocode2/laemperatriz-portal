import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/** Escribe version.json en dist para detectar deploys sin refrescar manualmente. */
export function buildVersionPlugin(): Plugin {
  return {
    name: "build-version",
    closeBundle() {
      const outDir = path.resolve(process.cwd(), "dist");
      const buildId =
        process.env.VERCEL_GIT_COMMIT_SHA ??
        process.env.GITHUB_SHA ??
        String(Date.now());

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(
        path.join(outDir, "version.json"),
        JSON.stringify({ buildId, builtAt: new Date().toISOString() }),
      );
    },
  };
}
