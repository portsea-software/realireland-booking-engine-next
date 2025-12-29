<template>
	<div>
		<div class="row mb-3">
			<div class="col">
				<h6 class="card-title mb-1">
					{{ title }}
				</h6>

				<p
					v-if="firstDay"
					class="card-text"
				>
					<em>{{ trai }}</em>
				</p>
				<p
					v-if="lastDay"
					class="card-text"
				>
					<em>{{ trao }}</em>
				</p>

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
type Excursion = { title?: string; [k: string]: any };

const props = withDefaults(
	defineProps<{
		excursion?: Excursion | null;
		dayNumber: number;
		lastDay: boolean;
		readOnly?: boolean;
	}>(),
	{
		excursion: null,
		readOnly: false,
	},
);

const addButtonCaption = "Add Daytime Activity";
const changeButtonCaption = "Change";
const removeButtonCaption = "Remove";

const productType = "Excursion";

const firstDay = computed(() => props.dayNumber === 1);

const transfers = useTransfersStore();
const trai = computed(() => transfers.getTransferIn);
const trao = computed(() => transfers.getTransferOut);

const title = computed(() => {
	if (firstDay.value) return "Arrive in Ireland";
	if (props.lastDay) return "Departure Day";
	return props.excursion?.title ?? "Day at Leisure";
});

const isEditable = computed(() => !props.readOnly && !firstDay.value && !props.lastDay);
const hasExcursion = computed(() => props.excursion != null);

// event bus replacement
// const { selectProduct: emitSelectProduct } = useWizardEvents();

// day-by-day store action replacement for removeProduct
const dayByDay = useDayByDayStore();

const bookingBus = useBookingBusStore();
function selectProduct(dayNo: number, productType: string) {
	// console.log(dayNo, productType);
	bookingBus.requestSelectProduct(dayNo, productType);
}

function removeProduct(dayNo: number, productType: string) {
	dayByDay.removeProduct({ dayNo, productType });
}
</script>
