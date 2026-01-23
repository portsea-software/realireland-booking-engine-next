<template>
	<div>
		<div class="row">
			<div class="col">
				<h5>Please select the required rooms for your party</h5>
				<p>
					The types of rooms are required to give the most accurate price. Hotel rooms are subject to
					availability. Rooming arrangements will be confirmed with you before you travel.
				</p>
				<hr>
			</div>
		</div>

		<!-- <pre>{{ roomTypes }}</pre> -->
		<div class="row">
			<RoomingHotel
				v-for="hotel in roomTypes"
				:key="hotel.productId"
				:ref="(el) => setHotelRef(hotel.productId, el)"
				:hotel="hotel"
				:total-passengers="totalPassengers"
			/>
		</div>

		<div
			v-if="showWarningMessage"
			class="row justify-content-around mt-4"
		>
			<div class="alert alert-danger">
				You have not selected enough rooms for all passengers. Please check that all hotels above have a
				<Icon name="i-fa7-solid:check" />
				against them and then continue.
			</div>
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
const wizard = useWizardStore();
const passengersStore = usePassengersStore();
const rooming = useRoomingStore();

const showWarningMessage = ref(false);

const roomTypes = computed(() => rooming.getHotelRoomTypes);
const totalPassengers = computed(() => passengersStore.getPassengersToRoom);
const everyoneHasARoom = computed(() => rooming.getEveryoneHasARoom);
// const passengers = computed(() => passengersStore.passengers);

type HotelChildApi = { validate?: () => Promise<boolean> | boolean; isValid?: boolean } | null;

const hotelRefMap = ref<Record<number, HotelChildApi>>({});

function setHotelRef(productId: number, el: any) {
	hotelRefMap.value[productId] = (el as HotelChildApi) ?? null;
}

async function validate() {
	for (const h of roomTypes.value) {
		const hotelRef = hotelRefMap.value[h.productId];

		if (hotelRef?.validate) {
			const ok = await hotelRef.validate();
			if (!ok) {
				showWarningMessage.value = true;
				return;
			}
		}
		else {
			if (hotelRef?.isValid === false || hotelRef == null) {
				showWarningMessage.value = true;
				return;
			}
		}
	}

	showWarningMessage.value = false;
}

function prevStep() {
	wizard.wizardStep--;
}

async function nextStep() {
	await validate();

	if (!showWarningMessage.value && everyoneHasARoom.value) {
		wizard.nextStep();
		return;
	}

	showWarningMessage.value = true;
}
</script>
