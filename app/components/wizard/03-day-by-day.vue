<template>
	<div>
		<div class="row">
			<h2 class="mx-auto">
				<strong>Build your holiday</strong>
			</h2>
		</div>

		<div class="row">
			<div class="col">
				<daybyday
					v-for="(day, index) in days"
					:key="day.number"
					:day="day"
					:prev-day="index > 0 ? days[index - 1] : null"
					:next-day="index < days.length - 1 ? days[index + 1] : null"
				/>
			</div>
		</div>

		<div
			v-if="showExcrMessage"
			class="row"
		>
			<div class="alert alert-info">
				We notice that you have not chosen any excursions for your trip. You can add an exursion by
				clicking
				<button
					class="btn btn-sm btn-info"
					type="button"
				>
					Add Daytime Activity
				</button>
				on the day in question. If you don't intend to take any excursions then no bother, just click
				<button
					class="btn btn-sm btn-success"
					type="button"
					@click="nextStep"
				>
					Next
				</button>
				to continue.
			</div>
		</div>

		<div
			v-if="showHotelMessage"
			class="row justify-content-around"
		>
			<div class="alert alert-danger">
				Please select one or more Hotels for your stay by clicking
				<button
					type="button"
					class="btn btn-sm btn-success"
					@click="showProductDialog(1, 'Hotel')"
				>
					Add Hotel
				</button>
			</div>
		</div>

		<div class="d-flex my-4 justify-content-end">
			<button
				type="button"
				class="btn btn-info mx-1"
				@click="prevStep"
			>
				Previous
			</button>
			<button
				type="button"
				class="btn btn-success mx-1"
				@click="nextStep"
			>
				Next
			</button>
		</div>

		<day-by-day-product-dialog
			ref="dialogRef"
			:product-type="dialogProductType"
			:products="dialogProducts"
		/>
	</div>
</template>

<script setup lang="ts">
import daybyday from "~/components/day-by-day/index.vue";
import type { Product } from "~~/shared/types";

const dayByDay = useDayByDayStore();
const county = useCountyStore();
const wizard = useWizardStore();
// const transfersStore = useTransfersStore();

const activeDayNo = ref<number>(0);
const dialogProductType = ref<string>("");
const showHotelMessage = ref(false);
const showExcrMessage = ref(false);

type DialogRef = { show: () => void; hide: () => void };
const dialogRef = ref<DialogRef | null>(null);

const days = computed(() => dayByDay.days);

const hotels = computed<Product[]>(() => county.getCountyHotels);
const excursions = computed<Product[]>(() => county.getCountyExcursions);
const entertainments = computed<Product[]>(() => county.getCountyEntertainments);

const selectedHotels = computed<Product[]>(() => dayByDay.getSelectedHotels);
const selectedExcursions = computed<Product[]>(() => dayByDay.getSelectedExcursions);
const selectedEntertainments = computed<Product[]>(() => dayByDay.getSelectedEntertainments);

const hasHotels = computed(() => (selectedHotels.value?.length ?? 0) > 0);

const hasExcursions = computed(() => {
	return (selectedExcursions.value?.length ?? 0) > 0 || (selectedEntertainments.value?.length ?? 0) > 0;
});

function sortHotels(list: Product[]) {
	return [...list]
		.sort((a, b) => {
			const ra = parseInt(String(a.rating ?? "").substring(0, 1) || "0", 10);
			const rb = parseInt(String(b.rating ?? "").substring(0, 1) || "0", 10);
			return ra - rb;
		})
		.reverse();
}

const dialogProducts = computed(() => {
	if (dialogProductType.value === "Hotel") return sortHotels(hotels.value);
	if (dialogProductType.value === "Excursion") return excursions.value;
	return entertainments.value;
});

// const transfersIn = computed(() => transfersStore.transferIn);
// const transferOut = computed(() => transfersStore.transferOut);

function prevStep() {
	wizard.wizardStep--;
}

function showProductDialog(dayNo: number, productType: string) {
	activeDayNo.value = dayNo;
	dialogProductType.value = productType;

	if (productType === "Hotel") showHotelMessage.value = false;
	if (productType === "Excursion" || productType === "Entertainment") showExcrMessage.value = false;

	dialogRef.value?.show();
}

function addProduct(productId: number, productTime?: string) {
	if (dialogProductType.value === "Hotel") {
		showHotelMessage.value = false;
	}
	else if (dialogProductType.value === "Excursion" || dialogProductType.value === "Entertainment") {
		showExcrMessage.value = false;
	}
	dayByDay.addProduct({
		dayNo: activeDayNo.value,
		productId,
		productTime,
	});

	dialogRef.value?.hide();
}

function nextStep() {
	if (hasHotels.value && (hasExcursions.value || showExcrMessage.value)) {
		wizard.nextStep();
		return;
	}

	if (hasHotels.value) {
		showExcrMessage.value = true;
		return;
	}

	showHotelMessage.value = true;
}

onMounted(() => {
	dayByDay.initDbdDays?.();
});

const busBookingStore = useBookingBusStore();

const selectProductEvent = computed(() => busBookingStore.selectProductEvent);
const addProductEvent = computed(() => busBookingStore.addProductEvent);

watch(
	() => selectProductEvent.value,
	(newProductEvent) => {
		if (newProductEvent) {
			showProductDialog(newProductEvent.dayNo, newProductEvent.productType);
		}
	},
);

watch(
	() => addProductEvent.value,
	(newProductEvent) => {
		if (newProductEvent) {
			addProduct(newProductEvent.productId, newProductEvent.productTime);
		}
	},
);
</script>
