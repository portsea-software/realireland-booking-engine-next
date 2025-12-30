import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export function useStripeClient() {
	const config = useRuntimeConfig();

	if (!stripePromise) {
		stripePromise = loadStripe(config.public.stripePublicKey);
	}

	async function getStripeAndElements(opts?: Parameters<Stripe["elements"]>[0]) {
		const stripe = await stripePromise;
		if (!stripe) throw new Error("Stripe failed to load");
		const elements = stripe.elements(opts);
		return { stripe, elements };
	}

	return { getStripeAndElements };
}
