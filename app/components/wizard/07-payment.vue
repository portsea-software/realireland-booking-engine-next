<template>
	<div>
		<div class="row">
			<h2 class="mx-auto">
				<strong>Confirmation and Payment</strong>
			</h2>
		</div>

		<div class="row">
			<div v-if="!ready && !error && bookingId === 0">
				<strong>Creating booking, this may take a moment...</strong>
				<div
					class="ms-3 spinner-border"
					role="status"
					aria-label="Creating booking"
				>
					<span class="visually-hidden">Creating booking, this may take a moment...</span>
				</div>
			</div>

			<div v-else-if="!ready && !error && bookingId > 0">
				<strong>Loading secure payment form...</strong>
				<div
					class="ms-3 spinner-border"
					role="status"
					aria-label="Loading payment form"
				>
					<span class="visually-hidden">Loading secure payment form...</span>
				</div>
			</div>

			<div
				v-else-if="error"
				class="alert alert-danger mt-2"
			>
				Sorry, something has gone wrong! Please get in touch and one of our sales advisors will be happy
				to complete your booking.
			</div>
		</div>

		<form
			v-show="ready"
			@submit.prevent="submitPayment"
		>
			<div class="card mt-2">
				<div class="card-header">
					IMPORTANT INFORMATION
				</div>
				<div class="card-body">
					<p class="card-text">
						Prior to payment please take note of your booking reference which is: <strong>{{ bookingRef }}</strong>.
					</p>
					<p class="card-text">
						Please use your booking reference in any communication.
					</p>
				</div>
			</div>

			<div class="card mt-2">
				<div class="card-header">
					SECURE PAYMENT - {{ amountToPay }}
				</div>

				<fieldset :disabled="stripeSubmitted">
					<div class="card-body">
						<div class="row my-2">
							<div class="col">
								<label
									for="nameoncard"
									class="form-label"
								>Name on card</label>
								<input
									id="nameoncard"
									v-model="nameOnCard"
									class="form-control"
									:class="{ invalid: nameOnCardError }"
									type="text"
									placeholder="Mr J Smith"
								>
								<div
									v-if="nameOnCardError"
									class="validation-message mt-2"
								>
									Please enter the name on card
								</div>
							</div>
						</div>

						<div class="row my-2">
							<div class="col">
								<label
									for="cardelement"
									class="form-label"
								>Credit or debit card details</label>
								<div
									id="cardelement"
									ref="cardElement"
								/>
							</div>
						</div>

						<div
							v-if="stripeMessage"
							class="row mt-4"
						>
							<div class="col">
								<div
									id="card-errors"
									class="alert alert-warning"
								>
									<p class="mb-0">
										{{ stripeMessage }}
									</p>
									<p class="mb-0">
										{{ attemptsMessage }}
									</p>
								</div>
							</div>
						</div>

						<div class="row mt-3 justify-content-end">
							<button
								class="btn btn-success"
								type="submit"
								:disabled="!stripeComplete || nameOnCardError || stripeSubmitted"
							>
								Submit Payment
							</button>
						</div>
					</div>
				</fieldset>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { StripeCardElement } from "@stripe/stripe-js";
import { useStripeClient } from "@/composables/useStripeClient";

const wizard = useWizardStore();
const bookingStore = useBookingStore();
const dayByDayStore = useDayByDayStore();
const passengersStore = usePassengersStore();
const { getStripeAndElements } = useStripeClient();

let card: StripeCardElement | null = null;
let cardChangeHandler: ((ev: any) => void) | null = null;

const nameOnCard = ref("");
const stripeSubmitted = ref(false);
const stripeComplete = ref(false);
const stripeMessage = ref("");
const attempts = ref(0);
const maxAttempts = 3;

const cardElement = ref<HTMLDivElement | null>(null);

const bookingId = computed(() => bookingStore.bookingRequestId);
const stripeSecret = computed(() => bookingStore.stripeSecret);
const error = computed(() => bookingStore.bookingError);

const receiptEmail = computed(() => passengersStore.client.email);
const amountToPay = computed(() => dayByDayStore.pricing.amountToPayFormatted);

const bookingRef = computed(() => bookingStore.bookingRef);

const attemptsRemaining = computed(() => maxAttempts - attempts.value);
const attemptsMessage = computed(() =>
	attemptsRemaining.value === 1
		? "You have 1 attempt remaining."
		: `You have ${attemptsRemaining.value} attempts remaining.`,
);

const ready = computed(() => (stripeSecret.value ?? "") !== "");
const nameOnCardError = computed(() => nameOnCard.value.trim() === "");

async function submitPayment() {
	if (!ready.value || !card || nameOnCardError.value) return;

	stripeSubmitted.value = true;

	try {
		const { stripe } = await getStripeAndElements();

		const result = await stripe.confirmCardPayment(stripeSecret.value, {
			payment_method: {
				card,
				billing_details: { name: nameOnCard.value },
			},
			receipt_email: receiptEmail.value,
		});

		if (result.error) {
			stripeMessage.value = result.error.message ?? "";
			attempts.value++;

			if (attempts.value >= maxAttempts) {
				bookingStore.paymentFailed = true;

				wizard.nextStep();
				return;
			}

			stripeSubmitted.value = false;
			return;
		}

		if (result.paymentIntent?.status === "succeeded") {
			wizard.nextStep?.();
		}
	}
	catch (e) {
		stripeMessage.value = "Payment failed. Please try again.";
		stripeSubmitted.value = false;
		console.log(e);
	}
}

onMounted(async () => {
	try {
		await bookingStore.createAxumBooking();

		await bookingStore.createPaymentIntent();

		const { elements } = await getStripeAndElements();
		card = elements.create("card");

		if (cardElement.value) card.mount(cardElement.value);

		cardChangeHandler = ({ complete, error }: any) => {
			stripeMessage.value = error ? error.message : "";
			stripeComplete.value = !!complete;
		};

		card.on("change", cardChangeHandler);
	}
	catch (err) {
		// bookingStore.bookingFailed = true;
		// wizard.setFatalError(err);
		console.log(err);
	}
});

onBeforeUnmount(() => {
	bookingStore.resetStripeSecret?.();

	try {
		if (card && cardChangeHandler) {
			card.off?.("change", cardChangeHandler);
		}
		card?.destroy();
	}
	finally {
		card = null;
		cardChangeHandler = null;
	}
});
</script>

<style scoped>
.StripeElement {
	box-sizing: border-box;
	height: 40px;
	padding: 10px 12px;
	border: 1px solid transparent;
	border-radius: 4px;
	background-color: white;
	box-shadow: 0 1px 3px 0 #e6ebf1;
	transition: box-shadow 150ms ease;
}

.StripeElement--focus {
	box-shadow: 0 1px 3px 0 #cfd7df;
}

.StripeElement--invalid {
	border-color: #fa755a;
}

.StripeElement--webkit-autofill {
	background-color: #fefde5 !important;
}

.invalid {
	border-color: #dc3545 !important;
}

.validation-message {
	color: #dc3545;
	font-size: 0.9rem;
}
</style>
