<template>
	<div>
		<div class="row">
			<div class="col">
				<h5>Please enter passenger details</h5>
				<hr>
			</div>
		</div>

		<div class="row my-2">
			<Passenger
				v-for="p in passengers"
				:key="p.passengerId"
				:ref="(el) => setPassengerRef(p.passengerId, el)"
				:model-value="p"
				@update:model-value="(val) => updatePassenger(p.passengerId, val)"
			/>
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
</template>

<script setup lang="ts">
type PassengerAge = "ADL" | "CHD" | "INF";

type Passenger = {
	passengerId: number;
	title: string;
	firstName: string;
	lastName: string;
	age: PassengerAge;
	dietaryRequirements?: string;
	editable: boolean;
};

type PassengerChildApi = {
	validate?: () => Promise<boolean> | boolean;
	v$?: any;
} | null;

const wizard = useWizardStore();
const passengersStore = usePassengersStore();
// const countyStore = useCountyStore();

const passengers = computed<Passenger[]>(() => passengersStore.passengers);

const passengerRefMap = ref<Record<number, PassengerChildApi>>({});

function setPassengerRef(id: number, el: any) {
	passengerRefMap.value[id] = (el as PassengerChildApi) ?? null;
}

function updatePassenger(id: number, next: Passenger) {
	const nextList = passengers.value.map(p => (p.passengerId === id ? next : p));
	passengersStore.passengers = nextList as any;
}

async function validateAll() {
	let valid = true;

	for (const p of passengers.value) {
		const child = passengerRefMap.value[p.passengerId];

		const ok = await child?.validate?.();

		if (ok === undefined) {
			if (child?.v$?.$invalid) {
				child.v$.$touch?.();
				valid = false;
			}
		}
		else if (!ok) {
			valid = false;
		}
	}

	return valid;
}

function prevStep() {
	wizard.wizardStep--;
}

async function nextStep() {
	const ok = await validateAll();
	if (!ok) return;

	// await countyStore.fetchProductElementsAndGrades();
	wizard.nextStep();
}

onMounted(() => {
	passengersStore.initPassengers();
});
</script>
