<template>
	<div class="card px-0 w-100 mb-1">
		<div class="card-header d-flex justify-content-between">
			<div>
				<h5 class="mb-0">
					{{ hotel.title }}
				</h5>
			</div>
			<div>
				<h5
					v-if="passengersToRoom > 0"
					class="card-title mb-0"
				>
					Select rooms for {{ passengersToRoom }} passengers
				</h5>

				<Icon
					v-if="isValid && passengersToRoom === 0"
					name="i-fa7-solid:check"
				/>
			</div>
		</div>

		<div class="card-body">
			<div class="row">
				<rooming-room
					v-for="(room, index) in rooms"
					:key="room.elementId"
					:ref="el => setRoomRef(room.elementId, el)"
					:product-id="hotel.productId"
					:room="room"
					:all-passengers="allPassengers"
					:assigned-passenger-ids="assignedPassengerIds"
					:room-number="index + 1"
					@add-passenger="addPassengerHandler"
					@remove-passenger="removePassengerHandler"
					@grade-set="gradeSetHandler"
					@on-validate="validate"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Passenger } from "~~/shared/types";

const rooming = useRoomingStore();
const passengersStore = usePassengersStore();

const props = defineProps<{
	hotel: CompleteHotel;
	totalPassengers: number;
}>();

const isValid = ref(true);

const allPassengers = computed<Passenger[]>(() => {
	return passengersStore.passengers.filter(p => p.age === "ADL" || p.age === "CHD");
});

const assignedPassengerIds = computed<number[]>(() => {
	return rooming.getAssignedPassengerIds(props.hotel.productId);
});

const passengersToRoom = computed(() => {
	return props.totalPassengers - assignedPassengerIds.value.length;
});

const rooms = computed(() => {
	return (props.hotel.rooms ?? []).filter(r => r.minOccupancy <= props.totalPassengers);
});

const roomedPassengers = computed(() => assignedPassengerIds.value.length);

type RoomChildRef = { validate?: () => Promise<boolean> | boolean } | null;
const roomRefs = ref(new Map<number, RoomChildRef>());

function setRoomRef(elementId: number, el: any) {
	roomRefs.value.set(elementId, el ?? null);
}

function addPassengerHandler(elementId: number, gradeId: number, sell: number, passengerId: number) {
	rooming.addPassengerToRoom({
		productId: props.hotel.productId,
		elementId,
		gradeId,
		sell,
		passengerId,
	});
}

function removePassengerHandler(elementId: number, passengerId: number) {
	rooming.removePassengerFromRoom({
		productId: props.hotel.productId,
		elementId,
		passengerId,
	});
}

function gradeSetHandler(elementId: number, gradeId: number, sell: number) {
	rooming.setHotelGrade({
		productId: props.hotel.productId,
		elementId,
		gradeId,
		sell,
	});
}

async function validate() {
	isValid.value = true;

	for (const room of rooms.value) {
		const child = roomRefs.value.get(room.elementId);
		const ok = await child?.validate?.();

		if (!ok) {
			isValid.value = false;
			break;
		}
	}

	return isValid.value;
}

defineExpose({ validate, roomedPassengers });
</script>
