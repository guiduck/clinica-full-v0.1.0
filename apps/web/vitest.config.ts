import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/tests/{unit,integration}/**/*.test.ts"]
        }
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["src/tests/component/**/*.test.tsx"],
          setupFiles: ["./src/tests/setup.ts"]
        }
      }
    ]
  }
});
