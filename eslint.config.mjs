import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { react: reactPlugin },
    rules: {
      // Literal ' and " in JSX text are valid and render correctly; requiring
      // &apos;/&quot; here actually causes a real bug in this Next.js/Turbopack
      // version: an HTML entity anywhere in a JSX text node that starts right
      // after a tag or {expression} silently eats that node's leading space
      // (e.g. `{s.name} Deck Code` rendered as `New YorkDeck Code`). Only keep
      // this rule for '>' and '}', which are genuinely ambiguous in JSX text.
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
