<template>
	<div>
		<div
			v-if="!initialised"
			class="d-flex justify-content-center mt-4"
		>
			<strong>Loading...</strong>
			<div
				class="ms-5 spinner-border"
				role="status"
			>
				<span class="sr-only">Loading...</span>
			</div>
		</div>

		<div v-else>
			<div class="card mt-2">
				<div class="card-header">
					We can include Airport Transfers from Dublin, Belfast, Knock and Donegal Airports
				</div>

				<ul class="list-group list-group-flush">
					<li class="list-group-item">
						<Icon name="i-lucide-plane-takeoff" />
						<span class="ms-2">
							If you will be flying in to Ireland, and know the airports that you will be arriving and
							departing Ireland from then please let us know.
						</span>
					</li>

					<li class="list-group-item">
						<Icon name="i-lucide-plane" />
						<span class="ms-2">
							If you will be flying into Ireland but don't know which Airport yet, don't worry, we can get
							this information from you closer to departure.
						</span>
					</li>

					<li class="list-group-item">
						<Icon name="i-fa7-solid:plane-slash" />
						<span class="ms-2">
							If you prefer to make your own way to Donegal, then that is no problem, we will not include
							transfers in your price.
						</span>
					</li>
				</ul>
			</div>

			<div class="card mt-2">
				<div class="card-header">
					Would you like us to include Airport transfers?
				</div>

				<ul class="list-group list-group-flush">
					<li class="list-group-item">
						<div class="custom-control custom-radio custom-control-inline">
							<input
								id="yes"
								v-model="requireTransfers"
								class="custom-control-input"
								type="radio"
								value="yes"
							>
							<label
								class="custom-control-label"
								for="yes"
							>
								Yes, we know our arrival and departure airports
							</label>
						</div>
					</li>

					<li class="list-group-item">
						<div class="custom-control custom-radio custom-control-inline">
							<input
								id="no"
								v-model="requireTransfers"
								class="custom-control-input"
								type="radio"
								value="no"
							>
							<label
								class="custom-control-label"
								for="no"
							>
								Yes, but we don't know our arrival and departure airports
							</label>
						</div>
					</li>

					<li class="list-group-item">
						<div class="custom-control custom-radio custom-control-inline">
							<input
								id="none"
								v-model="requireTransfers"
								class="custom-control-input"
								type="radio"
								value="none"
							>
							<label
								class="custom-control-label"
								for="none"
							>
								No thanks, we'll arrange our own transport to and from Donegal
							</label>
						</div>
					</li>

					<li
						v-if="v$.requireTransfers.$error"
						class="list-group-item"
					>
						<div class="validation-message">
							Please select an option above.
						</div>
					</li>

					<li
						v-if="requireTransfers === 'yes'"
						class="list-group-item"
					>
						<div class="row">
							<div class="col">
								<div class="form-group">
									<label for="arrAirport">Arrival Airport</label>

									<select
										id="arrAirport"
										v-model="inboundAirport"
										class="form-select"
										:class="{ invalid: v$.inboundAirport.$error }"
										@blur="v$.inboundAirport.$touch()"
									>
										<option
											v-for="airport in airports"
											:key="airport.airportCode"
											:value="airport"
											class="form-control-item"
										>
											{{ airport.airportName }}
										</option>
									</select>
								</div>
							</div>

							<div class="col">
								<div class="form-group">
									<label for="depAirport">Departure Airport</label>

									<select
										id="depAirport"
										v-model="outboundAirport"
										class="form-select"
										:class="{ invalid: v$.outboundAirport.$error }"
										@blur="v$.outboundAirport.$touch()"
									>
										<option
											v-for="airport in airports"
											:key="airport.airportCode"
											:value="airport"
											class="form-control-item"
										>
											{{ airport.airportName }}
										</option>
									</select>
								</div>
							</div>
						</div>

						<div class="row">
							<div
								v-if="v$.inboundAirport.$error"
								class="col validation-message"
							>
								Please select your arrival airport
							</div>

							<div
								v-if="v$.outboundAirport.$error"
								class="col validation-message"
								:class="{ 'offset-6': !v$.inboundAirport.$error }"
							>
								Please select your departure airport
							</div>
						</div>
					</li>
				</ul>
			</div>

			<div class="d-flex my-4 justify-content-end">
				<button
					class="btn btn-info mx-1"
					@click="prevStep"
				>
					Previous
				</button>
				<button
					class="btn btn-success mx-1"
					@click="nextStep"
				>
					Next
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";

type RequireTransfers = "yes" | "no" | "none";

type Airport = {
	airportCode: string;
	airportName: string;
	cityId: number;
	[k: string]: any;
};

const staticStore = useStaticStore();
const transfersStore = useTransfersStore();
const wizardStore = useWizardStore();

const airports = computed<Airport[]>(() => staticStore.airports as Airport[]);
const initialised = computed(() => (staticStore.airports?.length ?? 0) > 0);

const requireTransfers = computed<RequireTransfers>({
	get: () => transfersStore.requireTransfers as RequireTransfers,
	set: value => transfersStore.setRequireTransfers(value),
});

const inboundAirport = computed<Airport | null>({
	get: () => (transfersStore.inboundAirport as Airport | null),
	set: value => transfersStore.setInboundAirport(value),
});

const outboundAirport = computed<Airport | null>({
	get: () => (transfersStore.outboundAirport as Airport | null),
	set: value => transfersStore.setOutboundAirport(value),
});

const isRequireYes = computed(() => requireTransfers.value === "yes");

const requiredIfYes = helpers.withMessage(
	"This field is required",
	(value: any) => {
		if (!isRequireYes.value) return true;
		return helpers.req(value);
	},
);

const rules = computed(() => ({
	requireTransfers: { required },
	inboundAirport: { requiredIfYes },
	outboundAirport: { requiredIfYes },
}));

const v$ = useVuelidate(rules, { requireTransfers, inboundAirport, outboundAirport });

function prevStep() {
	wizardStore.wizardStep--;
}

function nextStep() {
	if (v$.value.$invalid) {
		v$.value.$touch();
		return;
	}

	wizardStore.nextStep();
}

async function validate() {
	v$.value.$touch();
	return !v$.value.$invalid;
}
defineExpose({ validate });

onMounted(async () => {
	await staticStore.initAirports();
});
</script>
