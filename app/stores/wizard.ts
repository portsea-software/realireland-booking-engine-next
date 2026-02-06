import WizardError from "~/components/wizard/00-error.vue";
import WizardStart from "~/components/wizard/01-start.vue";
import WizardTransfers from "@@/app/components/wizard/02-transfers.vue";
import WizardDayByDay from "~/components/wizard/03-day-by-day.vue";
import WizardPassengers from "~/components/wizard/04-passengers.vue";
import WizardRooming from "~/components/wizard/05-rooming.vue";
import WizardSummary from "~/components/wizard/06-summary.vue";
import WizardPayment from "~/components/wizard/07-payment.vue";

const WIZARD_COMPONENTS = [
	markRaw(WizardStart),
	markRaw(WizardTransfers),
	markRaw(WizardDayByDay),
	markRaw(WizardPassengers),
	markRaw(WizardRooming),
	markRaw(WizardSummary),
	markRaw(WizardPayment),
] as const satisfies readonly [Component, ...Component[]];

const ERROR_COMPONENT: Component = markRaw(WizardError);

type WizardState = {
	fatalError: boolean;
	wizardStep: number;
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
			"Passengers",
			"Rooming",
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

				// Fetch only first time
				if (!county.productsLoaded) {
					await county.initialiseCountyData({
						countyId: start.selectedCounty?.areaId,
						countyName: start.selectedCounty?.name,
						fromDate: start.fromDate,
						toDate: addDays(start.fromDate, start.noOfNights),
					});
				}
			}

			this.wizardStep += 1;
			console.log(`this.wizardStep ${this.wizardStep}`, `this.wizardStepIndex ${this.wizardStepIndex}`);
		},

		setFatalError(payload?: any) {
			console.log(payload);

			// this.fatalError = true;
			// if (payload) {
			// 	if (payload.response) {
			// 		console.log(payload.response.data);
			// 		console.log(payload.response.status);
			// 		console.log(payload.response.headers);
			// 	}
			// 	else if (payload.request) {
			// 		console.log(payload.request);
			// 	}
			// 	else {
			// 		console.log("Error", payload.message);
			// 	}
			// }
		},
	},
});
