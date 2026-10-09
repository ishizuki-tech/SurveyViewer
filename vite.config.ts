import { defineConfig } from "vite";
import { buildTargetForMode } from "./src/config/build-target";

export default defineConfig(({ mode }) => {
  const target = buildTargetForMode(mode);
  return {
    base: target.base,
    define: {
      __SURVEY_VIEWER_SOURCE__: JSON.stringify(target.source),
    },
    build: {
      outDir: target.outDir,
    },
  };
});
