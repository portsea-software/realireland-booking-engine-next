type BookingClient = {
	title: string;
	firstName: string;
	lastName: string;
	email: string;
};

type PaymentIntentPostData = {
	bookingRequestId: number;
	clientEmail: string;
	currency: "EUR";
	amount: number;
	description: string;
};

export const useBookingStore = defineStore("booking", {
	state: () => ({
		bookingRequestId: 0,
		bookingFailed: false,
		stripeSecret: "",
		paymentFailed: false,
	}),

	getters: {
		bookingComplete: s => s.bookingRequestId > 0,

		bookingRef: (s) => {
			const strRequestId = String(s.bookingRequestId);
			return "RIONLINE" + strRequestId.padStart(5, "0");
		},

		bookingError: s => s.bookingFailed,

		getBookingRequestPostData: () => {
			const passengersStore = usePassengersStore();
			const transfersStore = useTransfersStore();
			const dayByDayStore = useDayByDayStore();

			const client: BookingClient = {
				title: passengersStore.client.title,
				firstName: passengersStore.client.firstName,
				lastName: passengersStore.client.lastName,
				email: passengersStore.client.email,
			};

			return {
				client,
				airportsSpecified: transfersStore.requireTransfers === "yes",
				passengers: passengersStore.passengers,
				pricingRequest: dayByDayStore.getPricingRequestPostData,
			};
		},

		getPaymentIntentRequestPostData: (s): PaymentIntentPostData => {
			const passengersStore = usePassengersStore();
			const dayByDayStore = useDayByDayStore();

			return {
				bookingRequestId: s.bookingRequestId,
				clientEmail: passengersStore.client.email,
				currency: "EUR",
				amount: dayByDayStore.pricing.amountToPay,
				description: "Your holiday to the Real Ireland",
			};
		},
	},

	actions: {
		resetStripeSecret() {
			this.stripeSecret = "";
		},

		async createAxumBooking() {
			try {
				const data = this.getBookingRequestPostData;
				const response = await useApiAppAuth<any>(
					"api/booking-engine/booking/create",
					{ method: "POST", body: data },
				);

				console.log(response);

				// this.bookingRequestId = response.data;
				// this.bookingFailed = false;
			}
			catch (error) {
				const wizard = useWizardStore();
				this.bookingFailed = true;
				wizard.fatalError = true;
				wizard.setFatalError(error);

				throw error;
			}
		},

		async createPaymentIntent() {
			try {
				const data = this.getPaymentIntentRequestPostData;
				const response = await useApiAppAuth<any>(
					"api/booking-engine/stripe/PaymentIntents",
					{ method: "POST", body: data },
				);

				this.stripeSecret = response;
			}
			catch (error) {
				this.resetStripeSecret();
				throw error;
			}
		},
	},
});
