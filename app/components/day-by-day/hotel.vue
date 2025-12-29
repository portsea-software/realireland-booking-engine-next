<template>
	<div>
		<h6
			v-if="hotel != null"
			class="card-title mb-1"
		>
			<span class="d-inline d-md-none">Accommodation: </span>
			{{ hotel.title }}
		</h6>

		<button
			v-if="showButton"
			class="btn btn-sm float-right"
			:class="buttonClass"
			@click="selectProduct(dayNumber, 'Hotel')"
		>
			{{ buttonCaption }}
		</button>
	</div>
</template>

<script setup lang="ts">
type Hotel = {
	title?: string;
	[k: string]: any;
};

const props = withDefaults(
	defineProps<{
		hotel?: Hotel | null;
		dayNumber: number;
		readOnly?: boolean;
	}>(),
	{
		hotel: null,
		readOnly: false,
	},
);

const showButton = computed(() => {
	if (props.readOnly) return false;

	// Vue2 logic preserved:
	// show if (day 1 and no hotel) OR (hotel exists)
	if ((props.dayNumber === 1 && props.hotel == null) || props.hotel != null) {
		return true;
	}

	return false;
});

const buttonClass = computed(() => (props.hotel != null ? "btn-warning" : "btn-success"));

const buttonCaption = computed(() => {
	return props.dayNumber === 1 && props.hotel == null ? "Add Hotel" : "Change";
});

// replace Vue2 eventBus
// const { selectProduct: emitSelectProduct } = useWizardEvents();

const bookingBus = useBookingBusStore();
function selectProduct(dayNo: number, productType: string) {
	// console.log(dayNo, productType);
	bookingBus.requestSelectProduct(dayNo, productType);
}
</script>
