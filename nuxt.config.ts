// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ["@nuxt/eslint", "@nuxt/fonts", "@nuxt/icon", "@pinia/nuxt"],
	ssr: false,
	devtools: { enabled: true },
	app: {
		// head: {
		// 	script: [
		// 		{
		// 			src: "bootstrap/dist/js/bootstrap.bundle.min.js",
		// 			tagPosition: "bodyClose",
		// 		},
		// 	],
		// },
	},
	css: [
		"bootstrap/dist/css/bootstrap.min.css",
		"./app/assets/styles/site.scss",
	],
	runtimeConfig: {
		public: {
			debug: process.env.NUXT_PUBLIC_DEBUG ?? "",
			title: process.env.NUXT_PUBLIC_TITLE ?? "",

			airportCodes: process.env.NUXT_PUBLIC_AIRPORT_CODES ?? "",

			minNights: "",
			maxNights: "",
			defaultNights: process.env.NUXT_PUBLIC_DEFAULT_NIGHTS ?? "",

			minAdl: process.env.NUXT_PUBLIC_MIN_ADL ?? "",
			minChd: process.env.NUXT_PUBLIC_MIN_CHD ?? "",
			minInf: process.env.NUXT_PUBLIC_MIN_INF ?? "",

			maxAdl: process.env.NUXT_PUBLIC_MAX_ADL ?? "",
			maxChd: process.env.NUXT_PUBLIC_MAX_CHD ?? "",
			maxInf: process.env.NUXT_PUBLIC_MAX_INF ?? "",

			absMinFromDate: process.env.NUXT_PUBLIC_ABS_MIN_FROM_DATE ?? "",
			absMinFromDatePivotDays: process.env.NUXT_PUBLIC_ABS_MIN_FROM_DATE_PIVOT_DAYS ?? "",

			authClientId: process.env.NUXT_PUBLIC_AUTH_CLIENT_ID ?? "",
			authClientSecret: process.env.NUXT_PUBLIC_AUTH_CLIENT_SECRET ?? "",
			authTokenUrl: process.env.NUXT_PUBLIC_AUTH_TOKEN_URL ?? "",

			engineApiBaseUrl: process.env.NUXT_PUBLIC_ENGINE_API_BASE_URL ?? "",

			stripeApiBaseUrl: process.env.NUXT_PUBLIC_STRIPE_API_BASE_URL ?? "",
			stripeJsUrl: process.env.NUXT_PUBLIC_STRIPE_JS_URL ?? "",
			stripePublicKey: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY ?? "",

			contactEmail: process.env.NUXT_PUBLIC_CONTACT_EMAIL ?? "",
			contactPhone: process.env.NUXT_PUBLIC_CONTACT_PHONE ?? "",

			brand: process.env.NUXT_PUBLIC_BRAND ?? "",

		},
		grantType: "",
		clientId: "",
		clientSecret: "",
	},
	compatibilityDate: "2025-07-15",
	nitro: {
		storage: {
			real_ireland_booking_engine_cache_data: {
				driver: "fs",
				base: "./.data/cache",
			},
		},
	},
	vite: {
		define: {
			"process.env.DEBUG": false,
		},
	},
	eslint: {
		config: {
			stylistic: {
				semi: true,
				quotes: "double",
				commaDangle: "always-multiline",
				indent: "tab",
			},
		},
	},
});
