<template>
	<div>
		<div
			v-if="firstDay"
			class="d-none d-md-flex row my-1"
		>
			<div class="col-md offset-md-3 text-left font-weight-bold">
				Activities
			</div>
			<div class="col-md-4 text-right font-weight-bold">
				Accommodation
			</div>
		</div>

		<div class="d-none d-md-flex row my-1 py-2 border-top">
			<div class="col-md-3">
				<p class="mb-0">
					<strong>Day {{ day.number }}</strong>
				</p>
				<p>{{ day.date }}</p>
			</div>

			<div class="col-md">
				<day-by-day-excursion
					:excursion="excursion"
					:day-number="day.number"
					:last-day="lastDay"
					:read-only="readOnly"
				/>
				<day-by-day-entertainment
					:excursion="entertainment"
					:time="day.entertainmentTime"
					:day-number="day.number"
					:last-day="lastDay"
					:read-only="readOnly"
				/>
			</div>

			<div class="col-md-4 d-flex justify-content-end">
				<day-by-day-hotel
					:hotel="hotel"
					:day-number="day.number"
					:read-only="readOnly"
				/>
			</div>
		</div>

		<div class="row d-md-none">
			<div class="col-12 mx-2 my-2">
				<div class="card">
					<div class="card-header">
						<div class="row">
							<div class="col-4">
								Day {{ day.number }}
							</div>
							<div class="col d-flex flex-row-reverse">
								{{ day.date }}
							</div>
						</div>
					</div>

					<div class="card-body">
						<day-by-day-excursion
							:excursion="excursion"
							:day-number="day.number"
							:last-day="lastDay"
							:read-only="readOnly"
						/>
						<day-by-day-entertainment
							:excursion="entertainment"
							:time="day.entertainmentTime"
							:day-number="day.number"
							:last-day="lastDay"
							:read-only="readOnly"
						/>
					</div>

					<div
						v-if="!lastDay"
						class="card-footer"
					>
						<day-by-day-hotel
							:hotel="hotel"
							:day-number="day.number"
							:read-only="readOnly"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Day } from "~~/shared/types";

const props = withDefaults(
	defineProps<{
		day: Day;
		prevDay?: Day | null;
		nextDay?: Day | null;
		readOnly?: boolean;
	}>(),
	{
		prevDay: null,
		nextDay: null,
		readOnly: false,
	},
);

const county = useCountyStore();

const countyHotels = computed(() => county.getCountyHotels);
const countyExcursions = computed(() => county.getCountyExcursions);
const countyEntertainments = computed(() => county.getCountyEntertainments);

const excursion = computed(() => {
	if (props.day.excursionId === 0) return null;
	return countyExcursions.value.find(excr => excr.productId === props.day.excursionId) ?? null;
});

const entertainment = computed(() => {
	if (props.day.entertainmentId === 0) return null;
	return (
		countyEntertainments.value.find(ent => ent.productId === props.day.entertainmentId) ?? null
	);
});

const hotel = computed(() => {
	if (props.day.hotelId === 0) return null;
	return countyHotels.value.find(htl => htl.productId === props.day.hotelId) ?? null;
});

const firstDay = computed(() => props.day.number === 1);
const lastDay = computed(() => props.nextDay == null);
</script>
