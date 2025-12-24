<template>
	<div class="form-row align-items-top">
		<div class="col-xs-6 col-md-4">
			<div class="input-group mb-3">
				<div class="input-group-prepend">
					<span
						id="no-of-adults"
						class="input-group-text"
					>Adults (18+)</span>
				</div>

				<input
					id="no-of-adults"
					v-model.number="noOfAdults"
					type="number"
					class="form-control"
					:class="{ invalid: v$.noOfAdults.$error }"
					placeholder="No. of Adults"
					:min="minAdults"
					:max="maxAdults"
					@blur="v$.noOfAdults.$touch()"
				>
			</div>

			<div
				v-if="v$.noOfAdults.$error && !v$.noOfAdults.between"
				class="validation-message"
			>
				We currently support booking between
				{{ v$.noOfAdults.$params.between.min }} and {{ v$.noOfAdults.$params.between.max }}
				adults.
			</div>
		</div>

		<div class="col-xs-6 col-md-4">
			<div class="input-group mb-3">
				<div class="input-group-prepend">
					<span
						id="no-of-children"
						class="input-group-text"
					>Children (3-17)</span>
				</div>

				<input
					id="no-of-children"
					v-model.number="noOfChildren"
					type="number"
					class="form-control"
					:class="{ invalid: v$.noOfChildren.$error }"
					placeholder="No. of Children"
					:min="minChildren"
					:max="maxChildren"
					:disabled="noOfAdults === 0"
					@blur="v$.noOfChildren.$touch()"
				>
			</div>

			<div
				v-if="v$.noOfChildren.$error && !v$.noOfChildren.between"
				class="validation-message"
			>
				We currently support booking between
				{{ v$.noOfChildren.$params.between.min }} and {{ v$.noOfChildren.$params.between.max }}
				children.
			</div>
		</div>

		<div class="col-xs-6 col-md-4">
			<div class="input-group mb-3">
				<div class="input-group-prepend">
					<span
						id="no-of-infants"
						class="input-group-text"
					>Infants (0-2)</span>
				</div>

				<input
					id="no-of-infants"
					v-model.number="noOfInfants"
					type="number"
					class="form-control"
					:class="{ invalid: v$.noOfInfants.$error }"
					placeholder="No. of Infants"
					:min="minInfants"
					:max="maxInfants"
					:disabled="noOfAdults === 0"
					@blur="v$.noOfInfants.$touch()"
				>
			</div>

			<div
				v-if="v$.noOfInfants.$error && !v$.noOfInfants.between"
				class="validation-message"
			>
				We currently support booking between
				{{ v$.noOfInfants.$params.between.min }} and {{ v$.noOfInfants.$params.between.max }}
				infants.
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";

const passengers = usePassengersStore();

const minAdults = computed(() => passengers.getMinAdults);
const maxAdults = computed(() => passengers.getMaxAdults);
const minChildren = computed(() => passengers.getMinChildren);
const maxChildren = computed(() => passengers.getMaxChildren);
const minInfants = computed(() => passengers.getMinInfants);
const maxInfants = computed(() => passengers.getMaxInfants);

const noOfAdults = computed<number>({
	get: () => passengers.noOfAdults,
	set: value => passengers.setNoOfAdults(value),
});

const noOfChildren = computed<number>({
	get: () => passengers.noOfChildren,
	set: value => passengers.setNoOfChildren(value),
});

const noOfInfants = computed<number>({
	get: () => passengers.noOfInfants,
	set: value => passengers.setNoOfInfants(value),
});

const betweenWithParams = (min: number, max: number) =>
	helpers.withParams({ type: "between", min, max }, (value: number) => {
		if (!helpers.req(value)) return true;
		return value >= min && value <= max;
	});

const rules = computed(() => ({
	noOfAdults: {
		required,
		between: betweenWithParams(minAdults.value, maxAdults.value),
	},
	noOfChildren: {
		between: betweenWithParams(minChildren.value, maxChildren.value),
	},
	noOfInfants: {
		between: betweenWithParams(minInfants.value, maxInfants.value),
	},
}));

const v$ = useVuelidate(rules, { noOfAdults, noOfChildren, noOfInfants });

async function validate() {
	v$.value.$touch();
	return !v$.value.$invalid;
}
defineExpose({ validate });
</script>
