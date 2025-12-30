<template>
	<div>
		<div
			v-if="!firstDay && !lastDay"
			class="row"
		>
			<div class="col">
				<h6
					v-if="isEditable || hasExcursion"
					class="card-title mb-1"
				>
					{{ title }}
				</h6>

				<button
					v-if="isEditable && hasExcursion"
					class="btn btn-sm btn-danger float-right mx-1"
					:aria-label="removeButtonCaption"
					@click="removeProduct(dayNumber, productType)"
				>
					{{ removeButtonCaption }}
				</button>

				<button
					v-if="isEditable && hasExcursion"
					class="btn btn-sm btn-warning float-right mx-1"
					:aria-label="changeButtonCaption"
					@click="selectProduct(dayNumber, productType)"
				>
					{{ changeButtonCaption }}
				</button>

				<button
					v-if="isEditable && !hasExcursion"
					class="btn btn-sm btn-info float-right mx-1"
					:aria-label="addButtonCaption"
					@click="selectProduct(dayNumber, productType)"
				>
					{{ addButtonCaption }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
type Product = {
	title?: string;
	productCode?: string;
	[k: string]: any;
};

const props = withDefaults(
	defineProps<{
		excursion?: Product | null;
		time?: string;
		dayNumber: number;
		lastDay: boolean;
		readOnly?: boolean;
	}>(),
	{
		excursion: null,
		time: "00:00",
		readOnly: false,
	},
);

const addButtonCaption = "Add Evening Entertainment";
const changeButtonCaption = "Change";
const removeButtonCaption = "Remove";

const productType = "Entertainment";

const firstDay = computed(() => props.dayNumber === 1);

const title = computed(() => {
	const ex = props.excursion;
	if (ex) {
		if (ex.productCode === "REST") {
			return `Evening meal at ${String(ex.title ?? "")} @ ${props.time}`;
		}
		return String(ex.title ?? "");
	}
	return "Evening at your Hotel";
});

const isEditable = computed(() => !props.readOnly && !firstDay.value && !props.lastDay);
const hasExcursion = computed(() => props.excursion != null);

const dayByDay = useDayByDayStore();

const bookingBus = useBookingBusStore();
function selectProduct(dayNo: number, productType: string) {
	bookingBus.requestSelectProduct(dayNo, productType);
}

function removeProduct(dayNo: number, productType: string) {
	dayByDay.removeProduct({ dayNo, productType });
}
</script>
