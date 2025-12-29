// // stores/wizard.ts
// import { defineStore } from 'pinia'
// import * as dateHelper from '~/utils/date'

import { markRaw, type Component } from "vue";

// // components
import WizardError from "~/components/wizard/00-error.vue";
import WizardStart from "~/components/wizard/01-start.vue";
import WizardTransfers from "@@/app/components/wizard/02-transfers.vue";
import WizardDayByDay from "~/components/wizard/03-day-by-day.vue";
// import WizardRooming from '~/components/wizard/04_Rooming.vue'
// import WizardPassengers from '~/components/wizard/05_Passengers.vue'
// import WizardSummary from '~/components/wizard/06_Summary.vue'
// import WizardPayment from '~/components/wizard/07_Payment.vue'
// import WizardThankyou from '~/components/wizard/08_Thankyou.vue'

// import { useStartStore } from '~/stores/start'
// import { useDayByDayStore } from '~/stores/dayByDay'
// import { useCountyProductsStore } from '~/stores/county-products'

const WIZARD_COMPONENTS = [
	markRaw(WizardStart),
	markRaw(WizardTransfers),
	markRaw(WizardDayByDay),
] as const satisfies readonly [Component, ...Component[]];

const ERROR_COMPONENT: Component = markRaw(WizardError);

type WizardState = {
	fatalError: boolean;
	wizardStep: number; // 1-based
	wizardLabels: string[];
};

export const useWizardStore = defineStore("wizard", {
	state: (): WizardState => ({
		fatalError: false,
		wizardStep: 1,

		wizardLabels: [
			"Start",
			"Transfers",
			"Build",
			"Rooming",
			"Passengers",
			"Summary",
			"Payment",
			"Thankyou",
		] as string[],

	}),

	getters: {
		wizardStepIndex: state => state.wizardStep - 1,

		wizardLabel: state => state.wizardLabels[state.wizardStep - 1],

		wizardComponent(): Component {
			if (this.fatalError) return ERROR_COMPONENT;
			return WIZARD_COMPONENTS[this.wizardStepIndex] ?? WIZARD_COMPONENTS[0];
		},

		wizardProgress: state =>
			Math.min(
				Math.round((100 / state.wizardLabels.length) * state.wizardStep) + 5,
				100,
			),

		canNext: state => state.wizardStep <= state.wizardLabels.length,

		canPrev: state => state.wizardStep > 1 && state.wizardStep < 7,
	},

	actions: {

		async nextStep() {
			if (this.wizardStep === 1) {
				const start = useStartStore();
				const county = useCountyStore();

				await county.initialiseCountyData({
					countyId: start.selectedCounty?.areaId,
					countyName: start.selectedCounty?.name,
					fromDate: start.fromDate,
					toDate: addDays(start.fromDate, start.noOfNights),
				});
			}

			this.wizardStep += this.wizardStep;
			console.log(`this.wizardStep ${this.wizardStep}`, `this.wizardStepIndex ${this.wizardStepIndex}`);
		},

		setFatalError(payload?: any) {
			//   this.setFatalErrorMutation()
			this.fatalError = true;

			// axios error logging (same as Vuex)
			if (payload) {
				if (payload.response) {
					console.log(payload.response.data);
					console.log(payload.response.status);
					console.log(payload.response.headers);
				}
				else if (payload.request) {
					console.log(payload.request);
				}
				else {
					console.log("Error", payload.message);
				}
			}

			// log day-by-day data
			//   const dayByDay = useDayByDayStore()
			//   if (dayByDay.days) {
			//     console.log('Day-by-day Data', dayByDay.days)
			//   }
		},
	},
});
