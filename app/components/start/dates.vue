<template>
	<div>
		<div class="row">
			<div class="col-md-6">
				<div class="input-group mb-3">
					<span
						id="arrival-label"
						class="input-group-text"
					>Arrival Date</span>

					<input
						id="frDate"
						v-model="fromDate"
						type="date"
						class="form-control"
						:class="{ invalid: v$.fromDate.$error }"
						aria-describedby="arrival-label"
						:min="minFromDateISOString"
						:max="maxFromDateISOString"
						@blur="v$.fromDate.$touch()"
					>
				</div>
			</div>

			<div class="col-md-6">
				<div class="input-group mb-3">
					<span
						id="no-of-nights"
						class="input-group-text"
					>Number of Nights {{ minNights }} - {{ maxNights }}</span>

					<input
						id="noOfNights"
						v-model.number="noOfNights"
						type="number"
						class="form-control"
						:class="{ invalid: v$.noOfNights.$error }"
						aria-describedby="no-of-nights"
						:min="minNights"
						:max="maxNights"
						@blur="v$.noOfNights.$touch()"
					>
				</div>
			</div>
		</div>

		<div
			v-if="v$.$anyError"
			class="row"
		>
			<div class="col-md-6">
				<div
					v-if="v$.fromDate.$error && !v$.fromDate.between"
					class="validation-message mb-3"
				>
					We are currently only taking bookings for arrivals between
					{{ minFromDate.toLocaleDateString() }} and {{ maxFromDate.toLocaleDateString() }}.
				</div>
			</div>

			<div class="col-md-6">
				<div
					v-if="v$.noOfNights.$error && !v$.noOfNights.between"
					class="validation-message mb-3"
				>
					You can currently build trips between {{ minNights }} and {{ maxNights }} nights.
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";

const start = useStartStore();

const minFromDate = computed(() => start.minFromDate);
const maxFromDate = computed(() => start.maxFromDate);
const minFromDateISOString = computed(() => start.minFromDateISOString);
const maxFromDateISOString = computed(() => start.maxFromDateISOString);

const { public: { minNights, maxNights } } = useRuntimeConfig();

const fromDate = computed<string>({
	get() {
		return toISODateString(start.fromDate);
	},
	set(value) {
		start.setFromDate(new Date(value));
	},
});

const noOfNights = computed<number>({
	get() {
		return start.noOfNights;
	},
	set(value) {
		start.setNoOfNights(value);
	},
});

const rules = computed(() => ({
	fromDate: {
		required,
		between: helpers.withParams(
			{ type: "between", min: minFromDate.value, max: maxFromDate.value },
			(value: string) => {
				if (!helpers.req(value)) return true;
				const dateValue = new Date(value);
				const min = addDays(minFromDate.value, -1);
				const max = maxFromDate.value;
				return dateValue >= min && dateValue <= max;
			},
		),
	},

	noOfNights: {
		required,
		between: helpers.withParams(
			{ type: "between", min: minNights, max: maxNights },
			(value: number) => {
				if (!helpers.req(value)) return true;
				return value >= Number(minNights) && value <= Number(maxNights);
			},
		),
	},
}));

const v$ = useVuelidate(rules, { fromDate, noOfNights });

async function validate() {
	v$.value.$touch();
	return !v$.value.$invalid;
}
defineExpose({ validate });
</script>
