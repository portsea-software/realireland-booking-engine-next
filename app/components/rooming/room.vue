<template>
	<div class="col-xs-12 col-md-6 col-xl-4">
		<div class="card my-2">
			<div class="card-header">
				<label
					id="no-of-rooms"
					class="form-label mb-0"
					for="no-of-rooms"
				>
					Room {{ roomNumber }}
				</label>
			</div>

			<div class="card-body">
				<p class="mb-1">
					<strong>Room Min Occupency</strong> : {{ room.minOccupancy }}
				</p>
				<p class="mb-1">
					<strong>Room Max Occupency</strong> : {{ room.maxOccupancy }}
				</p>
				<input
					id="no-of-rooms"
					type="number"
					class="form-control mr-auto"
					placeholder="No. of rooms"
					min="0"
					:max="maxRooms"
					:value="numberOfRooms"
					:class="{ invalid: v$.numberOfRooms.$error }"
					:disabled="disabled"
					@blur="v$.numberOfRooms.$touch()"
					@input="onNumberOfRoomsChanged(($event.target as HTMLInputElement).value)"
				>

				<div
					v-if="v$.numberOfRooms.$error && !v$.numberOfRooms.between"
					class="validation-message"
				>
					Please select between {{ v$.numberOfRooms.$params.between.min }} and
					{{ v$.numberOfRooms.$params.between.max }} rooms.
				</div>
			</div>

			<div class="card-footer">
				<div class="input-group">
					<span
						id="grade"
						class="input-group-text"
					>
						Rating
					</span>

					<select
						id="grade"
						v-model.number="gradeId"
						class="form-control form-select"
						:disabled="numberOfRooms === 0"
					>
						<option
							v-for="grade in room.grades"
							:key="grade.gradeId"
							class="form-control-item"
							:value="grade.gradeId"
						>
							{{ grade.title }}
						</option>
					</select>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import type { Room } from "~~/shared/types";

const props = defineProps<{
	productId: number;
	room: Room;
	passengersToRoom: number;
	roomNumber: number;
}>();

const emit = defineEmits<{
	(e: "addRoom", elementId: number, gradeId: number, passengers: number): void;
	(e: "removeRoom" | "gradeSet", elementId: number, passengers: number): void;
	(e: "onValidate"): void;
}>();

const rooming = useRoomingStore();

const gradeId = ref<number>(props.room.grades?.[0]?.gradeId ?? 0);
const numberOfRooms = ref<number>(0);
const passengersInRoom = ref<number[]>([]);

const passengerCount = computed(() => {
	if (!passengersInRoom.value.length) return 0;
	return passengersInRoom.value.reduce((sum, cur) => sum + cur, 0);
});

const actualRooms = computed(() => passengersInRoom.value.length);

const maxRooms = computed(() => {
	if (props.passengersToRoom === 0) {
		return actualRooms.value;
	}

	let rooms = actualRooms.value;

	if (props.passengersToRoom >= props.room.minOccupancy) {
		let remainingPassengers = props.passengersToRoom;

		// add one room for all rooms we can fill to the maximum
		while (remainingPassengers >= props.room.maxOccupancy) {
			rooms += 1;
			remainingPassengers -= props.room.maxOccupancy;
		}

		// add one room if remaining passengers meet the minimum
		if (remainingPassengers >= props.room.minOccupancy) {
			rooms += 1;
		}
	}

	return rooms;
});

const disabled = computed(() => props.room.minOccupancy > props.passengersToRoom && passengerCount.value === 0);

const rules = computed(() => ({
	numberOfRooms: {
		between: helpers.withParams(
			{ type: "between", min: 0, max: maxRooms.value },
			(val: number) => {
				if (val === null || val === undefined) return true;
				return val >= 0 && val <= maxRooms.value;
			},
		),
	},
}));

const stateForValidation = computed(() => ({
	numberOfRooms: numberOfRooms.value,
}));

const v$ = useVuelidate(rules, stateForValidation);

watch(gradeId, (val) => {
	emit("gradeSet", props.room.elementId, val);
});

function onNumberOfRoomsChanged(raw: string) {
	const parsed = Number.parseFloat(raw);

	// invalid number OR not integer => remove all
	if (Number.isNaN(parsed) || !Number.isInteger(parsed)) {
		while (passengerCount.value > 0) {
			const passengers = passengersInRoom.value.pop();
			if (typeof passengers === "number") {
				emit("removeRoom", props.room.elementId, passengers);
			}
		}
		numberOfRooms.value = 0;
		emit("onValidate");
		return;
	}

	const value = parsed;

	if (value < actualRooms.value) {
		// remove diff rooms
		let diff = actualRooms.value - value;

		while (diff > 0 && passengersInRoom.value.length > 0) {
			const passengers = passengersInRoom.value.pop();
			if (typeof passengers === "number") {
				emit("removeRoom", props.room.elementId, passengers);
			}
			diff--;
		}
	}
	else if (value > actualRooms.value) {
		// add diff rooms, but not beyond maxRooms
		let diff = value - actualRooms.value;

		const max = maxRooms.value;

		while (diff > 0 && max > actualRooms.value) {
			const passengers = Math.min(props.room.maxOccupancy, props.passengersToRoom);
			passengersInRoom.value.push(passengers);
			emit("addRoom", props.room.elementId, gradeId.value, passengers);
			diff--;
		}
	}

	numberOfRooms.value = value;
	emit("onValidate");
}

onMounted(() => {
	const roomState = rooming.getRoomById(props.productId, props.room.elementId);
	if (roomState) {
		gradeId.value = roomState.gradeId;
		passengersInRoom.value = [...(roomState.passengersInRoom ?? [])];
		numberOfRooms.value = passengersInRoom.value.length;
	}
});

async function validate() {
	v$.value.$touch();
	return !v$.value.$invalid;
}
defineExpose({ validate, v$ });
</script>
