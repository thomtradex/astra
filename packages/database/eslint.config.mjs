import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "prisma/migrations/**"
    ]
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: [
      "src/**/*.ts",
      "prisma/**/*.ts"
    ],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json"
      }
    }
  }
];