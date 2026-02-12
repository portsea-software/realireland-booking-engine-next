import { parseDateSafe } from "~~/shared/utils/date";
import type { County } from "~~/shared/types";

export const useStartStore = defineStore("start", {
	state: () => {
		const config = useRuntimeConfig();

		const minFrDatePivotDays = parseIntSafe(config.public.absMinFromDatePivotDays, 0);

		const absMinFrDate = parseDateSafe(config.public.absMinFromDate, new Date(0));

		const minFrDatePivot = addDays(new Date(Date.now()), minFrDatePivotDays);

		const minNights = parseIntSafe(config.public.minNights, 1);
		const maxNights = parseIntSafe(config.public.maxNights, minNights);

		const minFrDate = absMinFrDate > minFrDatePivot ? absMinFrDate : minFrDatePivot;

		const nextYear = minFrDate.getFullYear() + 1;
		const maxFrDate = new Date(`${nextYear}-12-31`);

		return {
			minFrDate,
			maxFrDate,
			minNights,
			maxNights,

			selectedCounty: { areaId: 6, name: "Co. Donegal" } as County,
			fromDate: minFrDate as Date,
			noOfNights: minNights as number,
		};
	},

	getters: {
		minFromDate: state => state.minFrDate,
		maxFromDate: state => state.maxFrDate,

		minFromDateISOString: state => toISODateString(state.minFrDate),
		maxFromDateISOString: state => toISODateString(state.maxFrDate),

		noOfDays: (state) => {
			if (state.fromDate == null) return null;
			return state.noOfNights + 1;
		},

		toDate: state => addDays(state.fromDate, state.noOfNights),
	},

	actions: {
		setSelectedCounty(payload: County) {
			if (this.selectedCounty !== payload) {
				this.selectedCounty = payload;
			}
		},

		setFromDate(payload: Date) {
			if (this.fromDate !== payload) {
				this.fromDate = payload;
				// Refetch Products
				const county = useCountyStore();
				county.productsLoaded = false;
			}
		},

		setNoOfNights(payload: number) {
			if (this.noOfNights !== payload) {
				this.noOfNights = payload;
				// Refetch Products
				const county = useCountyStore();
				county.productsLoaded = false;
			}
		},
	},
});
