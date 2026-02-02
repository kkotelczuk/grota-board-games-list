import astro from "eslint-plugin-astro";

export default [
  ...astro.configs.recommended,
  {
    rules: {
      "astro/no-set-html-directive": "off"
    }
  }
];
