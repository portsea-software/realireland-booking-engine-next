<template>
	<div>
		<div class="card">
			<pre>
				{{ rooms }}
			</pre>
			<!-- <pre>
				{{ hotelProducts }}
			</pre> -->
			<pre>{{ days }}</pre>
		</div>
		<div class="card mt-2">
			<div class="card-header">
				Your Details
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-xs-auto col-lg-6">
						<strong>Name:</strong> {{ clientName }}
					</div>
					<div class="col-xs-auto col-lg-6">
						<strong>Email:</strong> {{ clientEmail }}
					</div>
				</div>
			</div>
		</div>

		<div class="card mt-2">
			<div class="card-header">
				Passenger Details
			</div>
			<div class="card-body">
				<div class="row justify-content-between">
					<div
						v-for="(p, index) in passengers"
						:key="index"
						class="col-xs-12 col-md-6"
					>
						{{ p.title }} {{ p.firstName }} {{ p.lastName }}
					</div>
				</div>
			</div>
		</div>

		<div class="card mt-2">
			<div class="card-header">
				Your Trip
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-xs-auto col-lg-6">
						<strong>Arriving:</strong> {{ fromDateString }}
					</div>
					<div
						v-if="inboundAirport != null"
						class="col-xs-auto col-lg-6"
					>
						<strong>Airport:</strong> {{ inboundAirport.airportName }}
					</div>

					<div class="col-xs-auto col-lg-6">
						<strong>Departing:</strong> {{ toDateString }}
					</div>
					<div
						v-if="outboundAirport != null"
						class="col-xs-auto col-lg-6"
					>
						<strong>Airport:</strong> {{ outboundAirport.airportName }}
					</div>
				</div>
			</div>
		</div>

		<div class="card mt-2">
			<div class="card-header">
				Your Itinerary
			</div>
			<div class="card-body">
				<DayByDay
					v-for="(day, index) in days"
					:key="day.number"
					:day="day"
					:prev-day="index > 0 ? days[index - 1] : null"
					:next-day="index < days.length - 1 ? days[index + 1] : null"
					:read-only="true"
				/>
			</div>
		</div>

		<div class="card mt-2">
			<div class="card-header">
				<template v-if="calculatedPrice">
					<div class="row justify-content-between">
						<div class="col-auto">
							TOTAL PRICE
						</div>
						<div class="col-auto">
							{{ pricing.totalPriceFormatted }}
						</div>
					</div>
					<div class="row justify-content-between">
						<div class="col-auto">
							{{ paymentLabel }}
						</div>
						<div class="col-auto">
							{{ pricing.amountToPayFormatted }}
						</div>
					</div>
				</template>

				<template v-else>
					<div class="row justify-content-between">
						<div class="col-auto d-flex align-items-center gap-3">
							<strong>Calculating price...</strong>
							<div
								class="spinner-border"
								role="status"
								aria-label="Calculating price"
							/>
						</div>
					</div>
				</template>
			</div>
		</div>

		<div class="row mt-2">
			<div class="col">
				<div class="form-group form-inline justify-content-between mr-2">
					<input
						id="termsAgreed"
						v-model="termsAgreed"
						type="checkbox"
						class="form-check-input"
						:disabled="false"
					>
					<label
						class="form-control-label ms-2"
						for="termsAgreed"
					>
						<span>
							I have read and agree to the
							<a
								href="#"
								@click.prevent="openTerms"
							>terms and conditions</a>
						</span>
					</label>
				</div>
			</div>
		</div>

		<div class="d-flex justify-content-end my-4">
			<button
				class="btn btn-info mx-1"
				@click="prevStep"
			>
				Previous
			</button>
			<button
				class="btn btn-success"
				:disabled="!termsAgreed"
				@click="nextStep"
			>
				Continue and Pay
			</button>
		</div>

		<div
			ref="termsModalEl"
			class="modal fade"
			tabindex="-1"
			aria-labelledby="ts-and-cs-title"
			aria-hidden="true"
		>
			<div class="modal-dialog modal-xl modal-dialog-scrollable">
				<div class="modal-content">
					<div class="modal-header">
						<h5
							id="ts-and-cs-title"
							class="modal-title fw-bold"
						>
							Terms and Conditions
						</h5>
						<button
							type="button"
							class="btn-close"
							aria-label="Close"
							@click="closeTerms"
						/>
					</div>

					<div class="modal-body">
						<ts-and-cs />
					</div>

					<div class="modal-footer">
						<button
							type="button"
							class="btn btn-primary"
							@click="closeTerms"
						>
							OK
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
type Pricing = {
	totalPriceFormatted: string;
	amountToPayFormatted: string;
	amountToPay: number;
	totalPrice: number;
};

const wizard = useWizardStore();
const passengersStore = usePassengersStore();
const startStore = useStartStore();
const transfersStore = useTransfersStore();
const dayByDayStore = useDayByDayStore();
const staticStore = useStaticStore();
const countyStore = useCountyStore();
const roomsStore = useRoomingStore();

const termsAgreed = ref(false);

const days = computed(() => dayByDayStore.days);
const hotels = computed<Product[]>(() => countyStore.getCountyHotels);

const hotelProducts = computed(() => {
	// const hotelIds = hotels.value.map(h => h.productId);
	const dayhotelIds = new Set(days.value.map(d => d.hotelId));
	const selectedHotels = hotels.value.filter(h => dayhotelIds.has(h.productId));

	return selectedHotels.map((h) => {
		return {
			...h,
			passengerIds: passengers.value.map(p => p.passengerId),
		};
	});
});

const clientName = computed(() => {
	const c = passengersStore.client;
	return `${c.title} ${c.firstName} ${c.lastName}`.trim();
});
const clientEmail = computed(() => passengersStore.client.email);
const passengers = computed(() => passengersStore.passengers);

const fromDate = computed(() => startStore.fromDate);
const toDate = computed(() => startStore.toDate);

const inboundAirport = computed(() => transfersStore.inboundAirport);
const outboundAirport = computed(() => transfersStore.outboundAirport);
// const transfersIn = computed(() => transfersStore.transferIn);
// const transferOut = computed(() => transfersStore.transferOut);

const calculatedPrice = computed(() => dayByDayStore.calculatedPricing);
const pricing = computed<Pricing>(() => dayByDayStore.pricing);

const dateOptions = computed(
	() =>
		({
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		}) as const,
);

const fromDateString = computed(() => fromDate.value?.toLocaleString(undefined, dateOptions.value) ?? "");
const toDateString = computed(() => toDate.value?.toLocaleString(undefined, dateOptions.value) ?? "");

const paymentLabel = computed(() => {
	const p = pricing.value;
	return p.amountToPay < p.totalPrice ? "DEPOSIT" : "TO PAY TODAY";
});
const rooms = computed(() => roomsStore.rooms);

function prevStep() {
	wizard.wizardStep--;
}

async function nextStep() {
	await createBooking();
	wizard.nextStep();
}

const termsModalEl = ref<HTMLElement | null>(null);
let termsModal: any = null;

async function openTerms() {
	const { Modal } = await import("bootstrap");
	if (!termsModalEl.value) return;

	termsModal ??= new Modal(termsModalEl.value, { backdrop: "static", keyboard: true });
	termsModal.show();
}

function closeTerms() {
	termsModal?.hide?.();
}

onMounted(async () => {
	await staticStore.initCurrencies();
});

const client = computed(() => passengersStore.client);
const isLoading = computed(() => countyStore.isLoading);

async function createBooking() {
	try {
		countyStore.isLoading = true;
		const bookingPayload = {
			newClient: {
				name: {
					title: client.value.title,
					firstName: client.value.firstName,
					lastName: client.value.lastName,
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
				emailAddress: client.value.email,
				adSourceIds: [1],
				acquisitionMethodId: 0,
				phoneNumber: "",
				clientFields: [],
				descriptions: [],
				recordTypeId: 1,
			},
			bookingTitle: "New Booking",
			departureDate: fromDate.value.toISOString(),
			instructions: "",
			leadTypeId: 0,
			adSourceId: 1,
			acquisitionMethodId: 0,
			brand: "ILT",
			currency: "EUR",
			passengers: passengers.value.map((p) => {
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
			// products: hotelProducts.value, // for: transfers + excursion => first one in list for elem+grade
			// for
			// products: hotelProducts.value.map(p => {
			// 	return {
			// 		productId: p.productId,
			// 		contractId: p.
			// 	}
			// })

			products: rooms.value.map((room) => {
				return {
					...room,
					fromDate: fromDate.value.toISOString(),
					toDate: fromDate.value.toISOString(),
				};
			}),

		};
		console.log(bookingPayload);

		const response = await useApiAppAuth<any>(
			"api/booking-engine/tailor-made/bookings/quick-book",
			{ method: "POST", body: bookingPayload },
		);
		console.log(response);
		console.log(isLoading.value);
	}
	catch (error) {
		console.error("Error in initialiseCountyData:", error);
		wizard.setFatalError(error);
	}
	finally {
		countyStore.isLoading = false;
	}
}
</script>
