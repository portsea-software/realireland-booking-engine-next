// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
	{
		files: ["**/*.vue"],
		rules: {
			"vue/no-multiple-template-root": "off",
			"vue/multi-word-component-names": "off",
		},
	},
	{
		files: ["**/*.{js,ts,vue}"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
);
