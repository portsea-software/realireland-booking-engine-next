<template>
	<div class="card px-0 w-100">
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
					v-for="room in rooms"
					:key="room.elementId"
					:ref="el => setRoomRef(room.elementId, el)"
					:product-id="hotel.productId"
					:room="room"
					:passengers-to-room="passengersToRoom"
					@add-room="addRoomHandler"
					@remove-room="removeRoomHandler"
					@grade-set="gradeSetHandler"
					@on-validate="validate"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
type RoomGrade = { gradeId: number; grade?: string };
type HotelRoomType = {
	elementId: number;
	element: string;
	grades: RoomGrade[];
	min: number;
	max: number;
};

type Hotel = {
	productId: number;
	title: string;
	rooms: HotelRoomType[];
};

type RoomingRoomState = {
	productId: number;
	elementId: number;
	gradeId: number;
	passengersInRoom: number[];
};

const rooming = useRoomingStore();

const props = defineProps<{
	hotel: Hotel;
	totalPassengers: number;
}>();

const passengersToRoom = ref<number>(props.totalPassengers);
const isValid = ref(true);

const rooms = computed(() => {
	return (props.hotel.rooms ?? []).filter(r => r.min <= props.totalPassengers);
});

const roomedPassengers = computed(() => props.totalPassengers - passengersToRoom.value);

type RoomChildRef = { validate?: () => Promise<boolean> | boolean } | null;
const roomRefs = ref(new Map<number, RoomChildRef>());

function setRoomRef(elementId: number, el: any) {
	roomRefs.value.set(elementId, el ?? null);
}

function addRoomHandler(elementId: number, gradeId: number, numberOfPassengers: number) {
	passengersToRoom.value -= numberOfPassengers;

	rooming.addHotelRoom({
		productId: props.hotel.productId,
		elementId,
		gradeId,
		numberOfPassengers,
	});
}

function removeRoomHandler(elementId: number, numberOfPassengers: number) {
	passengersToRoom.value += numberOfPassengers;

	rooming.removeHotelRoom({
		productId: props.hotel.productId,
		elementId,
	});
}

function gradeSetHandler(elementId: number, gradeId: number) {
	rooming.setHotelGrade({
		productId: props.hotel.productId,
		elementId,
		gradeId,
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

onMounted(() => {
	const existing = (rooming.rooms as RoomingRoomState[]).filter(
		r => r.productId === props.hotel.productId,
	);

	for (const r of existing) {
		const sum = (r.passengersInRoom ?? []).reduce((a, b) => a + b, 0);
		passengersToRoom.value -= sum;
	}
});
</script>
