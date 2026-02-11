import type { FormattedProduct } from "~~/shared/types";
import type { BookingGroupClientId, Booking } from "~~/shared/types/booking";

// type PaymentIntentPostData = {
// 	bookingRequestId: number;
// 	clientEmail: string;
// 	currency: "EUR";
// 	amount: number;
// 	description: string;
// };

const monthMap: Record<string, string> = {
	January: "01", February: "02", March: "03", April: "04",
	May: "05", June: "06", July: "07", August: "08",
	September: "09", October: "10", November: "11", December: "12",
};

function parseDayDate(dateStr: string): string {
	const parts = dateStr.split(", ")[1]?.split(" ") as string[];
	const day = parts[0]?.padStart(2, "0");
	const month = monthMap[parts[1] as string];
	const year = parts[2];
	return `${year}-${month}-${day}`;
}

function addDays(dateStr: string, numDays: number): string {
	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year as number, month as number - 1, day as number + numDays);
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function daysBetween(from: string, to: string): number {
	const [y1, m1, d1] = from.split("-").map(Number);
	const [y2, m2, d2] = to.split("-").map(Number);
	const date1 = new Date(y1 as number, (m1 as number) - 1, d1 as number);
	const date2 = new Date(y2 as number, (m2 as number) - 1, d2 as number);
	return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateUnits(passengerCount: number, maxOccupancy: number, priceBase: string): number {
	if (priceBase === "PerUnit") {
		const result = Math.floor(passengerCount / maxOccupancy);
		const rem = passengerCount % maxOccupancy;
		return result + (rem > 0 ? 1 : 0);
	}
	return passengerCount;
}

export const useBookingStore = defineStore("booking", {
	state: () => ({
		bookingRequestId: 0,
		bookingFailed: false,
		stripeSecret: "",
		paymentFailed: false,
		bookingGroupClientId: {} as BookingGroupClientId,
		bookingInfo: {} as Booking,
		stripePublicKey: "",
	}),

	getters: {
		bookingComplete: s => s.bookingRequestId > 0,

		bookingRef: (s) => {
			const strRequestId = String(s.bookingRequestId);
			return "RIONLINE" + strRequestId.padStart(5, "0");
		},

		bookingError: s => s.bookingFailed,

		bookingProducts(): FormattedProduct[] {
			const dayByDayStore = useDayByDayStore();
			const roomsStore = useRoomingStore();
			const countyStore = useCountyStore();
			const passengersStore = usePassengersStore();

			const days = dayByDayStore.days;
			const rooms = roomsStore.rooms;
			const allPassengerIds = passengersStore.passengers.map(p => p.passengerId);
			const products: Array<FormattedProduct> = [];

			// Get Only dates from days array
			const dayDates = days.map(d => parseDayDate(d.date));

			// Hotels - from rooms with date ranges calculated from days
			for (const room of rooms) {
				// Find all days where this room's productId matches the hotelId
				const hotelDayIndices = days
					.map((d, i) => ({ hotelId: d.hotelId, index: i }))
					.filter(d => d.hotelId === room.productId)
					.map(d => d.index);

				if (hotelDayIndices.length > 0) {
					const firstDayIndex = hotelDayIndices[0] as number;
					const lastDayIndex = hotelDayIndices[hotelDayIndices.length - 1] as number;

					const checkInDate = dayDates[firstDayIndex] as string;
					const checkOutDate = addDays(dayDates[lastDayIndex] as string, 1);

					products.push({
						productId: room.productId,
						elementId: room.elementId,
						gradeId: room.gradeId,
						sell: room.sell,
						passengerIds: room.passengerIds,
						fromDate: checkInDate,
						toDate: checkOutDate,
					});
				}
			}

			// Excursions - from days where excursionId > 0
			days.forEach((day, i) => {
				if (day.excursionId > 0) {
					const product = countyStore.products.find(p => p.productId === day.excursionId);
					const tariff = product?.tariffs[0];
					const grade = tariff?.grades[0];

					products.push({
						productId: day.excursionId,
						elementId: tariff?.elementId ?? 1,
						gradeId: grade?.gradeId ?? 1,
						sell: grade?.sell ?? 0,
						passengerIds: allPassengerIds,
						fromDate: dayDates[i] as string,
						toDate: dayDates[i] as string,
					});
				}
			});

			// Entertainment - from days where entertainmentId > 0
			days.forEach((day, i) => {
				if (day.entertainmentId > 0) {
					const product = countyStore.products.find(p => p.productId === day.entertainmentId);
					const tariff = product?.tariffs[0];
					const grade = tariff?.grades[0];

					products.push({
						productId: day.entertainmentId,
						elementId: tariff?.elementId ?? 1,
						gradeId: grade?.gradeId ?? 1,
						sell: grade?.sell ?? 0,
						passengerIds: allPassengerIds,
						fromDate: dayDates[i] as string,
						toDate: dayDates[i] as string,
					});
				}
			});

			return products;
		},

		totalSell(): number {
			const countyStore = useCountyStore();
			let total = 0;

			for (const bp of this.bookingProducts) {
				const product = countyStore.products.find(p => p.productId === bp.productId);
				const tariff = product?.tariffs.find(t => t.elementId === bp.elementId);
				const maxOccupancy = tariff?.maxOccupancy ?? 1;
				const priceBase = product?.priceBase ?? "PerPassenger";
				const isHotel = product?.productCode === "HTL";

				const units = calculateUnits(bp.passengerIds.length, maxOccupancy, priceBase);
				const multiplier = isHotel ? daysBetween(bp.fromDate, bp.toDate) : 1;

				total += units * multiplier * bp.sell;
			}

			return total;
		},

		getBookingRequestPostData: () => {
			const passengersStore = usePassengersStore();
			const transfersStore = useTransfersStore();
			const dayByDayStore = useDayByDayStore();

			const client = {
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

		getPaymentIntentRequestPostData(s): any {
			const passengersStore = usePassengersStore();
			// const dayByDayStore = useDayByDayStore();

			return {
				// bookingRequestId: s.bookingRequestId,
				// clientEmail: passengersStore.client.email,
				// currency: "EUR",
				// amount: this.totalSell,
				// description: "Your holiday to the Real Ireland",

				bookingId: s.bookingGroupClientId.bookingId,
				groupId: s.bookingGroupClientId.groupId,
				clientId: s.bookingGroupClientId.clientId,
				clientType: s.bookingInfo.clientType,
				clientEmail: passengersStore.client.email,
				currency: s.bookingInfo.sellCurrency,
				amount: this.totalSell,
				exchangeRate: 1,
				description: "Your holiday to the Real Ireland",
			};
		},
	},

	actions: {
		resetStripeSecret() {
			this.stripeSecret = "";
		},

		async createBooking() {
			const countyStore = useCountyStore();
			const passengersStore = usePassengersStore();
			const startStore = useStartStore();

			try {
				countyStore.isLoading = true;
				const bookingPayload = {
					newClient: {
						name: {
							title: passengersStore.client.title,
							firstName: passengersStore.client.firstName,
							lastName: passengersStore.client.lastName,
						},
						address: {
							addressLine1: "",
							addressLine2: "",
							addressLine3: "",
							city: "",
							county: "",
							postcode: "",
							countryCode: "",
							country: "",
						},
						emailAddress: passengersStore.client.email,
						adSourceIds: [1],
						acquisitionMethodId: 0,
						phoneNumber: "",
						clientFields: [],
						descriptions: [],
						recordTypeId: 1,
					},
					bookingTitle: "New Booking",
					departureDate: startStore.fromDate.toISOString(),
					instructions: "",
					leadTypeId: 0,
					adSourceId: 1,
					acquisitionMethodId: 0,
					brand: "ILT",
					currency: "EUR",
					passengers: passengersStore.passengers.map((p) => {
						return {
							name: {
								tile: p.title,
								firstName: p.firstName,
								lastName: p.lastName,
							},
							passengerId: p.passengerId,
							ageGroup: p.age,
						};
					}),
					products: this.bookingProducts,
				};
				console.log(bookingPayload);

				const response = await useApiAppAuth<BookingGroupClientId>(
					"api/booking-engine/tailor-made/bookings/quick-book",
					{ method: "POST", body: bookingPayload },
				);

				this.bookingGroupClientId = response;
			}
			catch (error) {
				console.error("Error in createBooking:", error);
			}
			finally {
				countyStore.isLoading = false;
			}
		},

		async fetchBookingInfo() {
			const passengerStore = usePassengersStore();
			try {
				const response = await useApiAppAuth<Booking>(
					`/api/booking-engine/portal/bookings/${this.bookingGroupClientId.bookingId}/${this.bookingGroupClientId.groupId}/payment-info/${passengerStore.client.lastName}`,
					{
						method: "GET",
					},
				);

				this.bookingInfo = response;
			}
			catch (error) {
				console.error("Error in createBooking:", error);
			}
		},

		async fetchStripePublicKey() {
			try {
				const { public: { brand } } = useRuntimeConfig();
				const response = await useApiAppAuth<string>(
					`/api/booking-engine/stripe/payment-intents/${this.bookingInfo.sellCurrency}/${brand}`,
					{
						method: "GET",
					},
				);

				this.stripePublicKey = response;
				return response;
			}
			catch (error) {
				console.error("Error in createBooking:", error);
			}
		},

		async createPaymentIntent() {
			try {
				const data = this.getPaymentIntentRequestPostData;
				const response = await useApiAppAuth<any>(
					"api/booking-engine/stripe/payment-intents",
					{ method: "POST", body: data },
				);
				console.log(response);
				this.stripeSecret = response;
			}
			catch (error) {
				this.resetStripeSecret();
				throw error;
			}
		},
	},
});
