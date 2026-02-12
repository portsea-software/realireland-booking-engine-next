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
import type { Product } from "~~/shared/types";

const props = withDefaults(
	defineProps<{
		hotel?: Product | null;
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
	if ((props.dayNumber === 1 && props.hotel == null) || props.hotel != null) {
		return true;
	}

	return false;
});

const buttonClass = computed(() => (props.hotel != null ? "btn-warning" : "btn-success"));

const buttonCaption = computed(() => {
	return props.dayNumber === 1 && props.hotel == null ? "Add Hotel" : "Change";
});

const bookingBus = useBookingBusStore();
function selectProduct(dayNo: number, productType: string) {
	bookingBus.requestSelectProduct(dayNo, productType);
}
</script>
