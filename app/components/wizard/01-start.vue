<template>
	<div>
		<div
			v-if="!initialised"
			class="d-flex justify-content-center mt-4"
		>
			<strong>Loading...</strong>
		</div>

		<div v-else>
			<h5>
				First can you tell us a little bit about yourself, where and when you would like to visit
				Donegal and the size of your party
			</h5>

			<start-client
				ref="clientRef"
				v-model="client"
			/>
			<hr>

			<h5>When will you be visiting Donegal?</h5>
			<start-dates ref="datesRef" />
			<hr>

			<h5>Please indicate the number of guests</h5>
			<start-passengers ref="passengersRef" />

			<div class="d-flex justify-content-end my-4">
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
const staticStore = useStaticStore();
const passengersStore = usePassengersStore();
const wizardStore = useWizardStore();

const initialised = computed(() => staticStore.titles.length > 0 && staticStore.counties.length > 0);

const client = computed({
	get: () => passengersStore.client,
	set: value => passengersStore.setClient(value),
});

type ChildRef = { validate?: () => Promise<boolean> | boolean };

const clientRef = ref<ChildRef | null>(null);
const datesRef = ref<ChildRef | null>(null);
const passengersRef = ref<ChildRef | null>(null);

async function nextStep() {
	const isClientValid = await clientRef.value?.validate?.();
	const isDateValid = await datesRef.value?.validate?.();
	const isPassengerValid = await passengersRef.value?.validate?.();

	if (!isClientValid || !isDateValid || !isPassengerValid) {
		return;
	}

	wizardStore.nextStep();
}

onMounted(async () => {
	await Promise.all([staticStore.initTitles(), staticStore.initCounties()]);
});
</script>
