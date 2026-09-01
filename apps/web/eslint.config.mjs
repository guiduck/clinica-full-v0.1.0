import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      "references/**",
      ".agents/**",
      ".cursor/**",
      ".specify/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-nested-ternary": "error"
    }
  },
  {
    files: [
      "src/components/appShell/**/*.tsx",
      "src/components/onboardingTour/**/*.tsx",
      "src/components/tooltip/**/*.tsx"
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ConditionalExpression[alternate.type='Literal'][alternate.value=null]",
          message: "Use uma constante nomeada e renderização com &&, ou extraia um subcomponente com early return."
        }
      ]
    }
  }
];

export default eslintConfig;
