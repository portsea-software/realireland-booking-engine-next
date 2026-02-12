import type { Airport, County, Currency, Title } from "~~/shared/types";

export const useStaticStore = defineStore("StaticStore", {
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
			try {
				const airportsData = await useApiAppAuth<Airport[]>(
					"api/booking-engine/lookup/airports/country/IE",
					{ method: "GET" },
				);

				this.airports = (airportsData ?? []).sort((a, b) =>
					String(a.airportName ?? "").localeCompare(String(b.airportName ?? "")),
				);
			}
			catch (error) {
				console.log(error);
				wizard.setFatalError(error);
			}
		},

		async initCounties() {
			if (this.counties?.length) return;

			const wizard = useWizardStore();
			try {
				const countiesData = await useApiAppAuth<County[]>(
					"api/booking-engine/region/countries/IE/areas",
					{ method: "GET" },
				);

				this.counties = countiesData ?? [];
			}
			catch (error) {
				console.log(error);
				wizard.setFatalError(error);
			}
		},

		async initCurrencies() {
			if (this.currencies?.length) return;

			const wizard = useWizardStore();
			try {
				const currenciesData = await useApiAppAuth<Currency[]>(
					"api/booking-engine/lookup/currencies",
					{ method: "GET" },
				);

				this.currencies = currenciesData ?? [];
			}
			catch (error) {
				console.log(error);
				wizard.setFatalError(error);
			}
		},

		async initTitles() {
			if (this.titles?.length) return;

			const wizard = useWizardStore();
			try {
				const titlesData = await useApiAppAuth<Title[]>(
					"api/booking-engine/lookup/titles",
					{ method: "GET" },
				);

				this.titles = titlesData ?? [];
			}
			catch (error) {
				console.log(error);
				wizard.setFatalError(error);
			}
		},
	},
});
