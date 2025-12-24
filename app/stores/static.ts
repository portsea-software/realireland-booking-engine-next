// stores/static.ts
import { defineStore } from "pinia";
import { useWizardStore } from "~/stores/wizard";

type Currency = { currencyCode: string; [k: string]: any };
type Airport = { airportName: string; [k: string]: any };
type County = any;
type Title = any;

export const useStaticStore = defineStore("static", {
	state: () => ({
		titles: [] as Title[],
		counties: [] as County[],
		currencies: [] as Currency[],
		airports: [] as Airport[],
	}),

	getters: {
		getEuroCurrency: (state) => {
			if (state.currencies.length > 0) {
				return state.currencies.find(cur => cur.currencyCode === "EUR");
			}
			return undefined;
		},
	},

	actions: {
		async initAirports() {
			if (this.airports?.length) return;

			const wizard = useWizardStore();
			// const config = useRuntimeConfig();
			// const baseURL = String(config.public.engineApiBaseUrl || "");

			try {
				// original code: lookup/airports/country/IE
				// const data = await $fetch<Airport[]>('lookup/airports/country/IE', { baseURL })

				// this.airports = (data ?? []).sort((a, b) =>
				//   String(a.airportName ?? '').localeCompare(String(b.airportName ?? ''))
				// )
				const res = await useApiAppAuth<any>("api/topaz/lookup/airports/country/IE", {
					method: "GET",
				});
				console.log(res);
			}
			catch (error) {
				console.log(error);
				wizard.setFatalError(error);
			}
		},

		async initCounties() {
			if (this.counties?.length) return;

			const wizard = useWizardStore();
			const config = useRuntimeConfig();
			const baseURL = String(config.public.engineApiBaseUrl || "");

			try {
				// Only counties from Ireland
				const data = await $fetch<County[]>("region/countries/IE/areas", { baseURL });
				this.counties = data ?? [];
			}
			catch (error) {
				wizard.setFatalError(error);
			}
		},

		async initCurrencies() {
			if (this.currencies?.length) return;

			const wizard = useWizardStore();
			const config = useRuntimeConfig();
			const baseURL = String(config.public.engineApiBaseUrl || "");

			try {
				const data = await $fetch<Currency[]>("lookup/currencies", { baseURL });
				this.currencies = data ?? [];
			}
			catch (error) {
				wizard.setFatalError(error);
			}
		},

		async initTitles() {
			if (this.titles?.length) return;

			const wizard = useWizardStore();
			const config = useRuntimeConfig();
			const baseURL = String(config.public.engineApiBaseUrl || "");

			try {
				// In your axios version you set Content-Type: null.
				// With $fetch you generally don't need headers for GET.
				const data = await $fetch<Title[]>("lookup/titles", { baseURL });
				this.titles = data ?? [];
			}
			catch (error) {
				wizard.setFatalError(error);
			}
		},
	},
});
