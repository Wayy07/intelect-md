import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // This ignores all warnings (severity level 1) during build
      "@typescript-eslint/no-unused-vars": "error", // Keep errors (2) as errors
      "@typescript-eslint/no-explicit-any": "error", // Keep errors (2) as errors
      "react-hooks/exhaustive-deps": "error", // Keep errors (2) as errors
      "@next/next/no-img-element": "error", // Keep errors (2) as errors
      // Default all warnings to 'off'
      "prefer-const": "off",
      "no-console": "off",
      "import/no-anonymous-default-export": "off",
    },
    ignorePatterns: [".next/*", "node_modules/*"],
  }
];

export default eslintConfig;
