<template>
	<div class="col-xs-12 col-md-6 col-xl-4">
		<div class="card my-2">
			<div class="card-header">
				<label
					class="form-label mb-0"
				>
					{{ room.title }} (Room {{ roomNumber }})
				</label>
			</div>

			<div class="card-body">
				<p class="mb-1">
					<strong>Min Occupancy</strong>: {{ room.minOccupancy }}
				</p>
				<p class="mb-2">
					<strong>Max Occupancy</strong>: {{ room.maxOccupancy }}
				</p>

				<div class="passenger-list">
					<div
						v-for="passenger in allPassengers"
						:key="passenger.passengerId"
						class="form-check"
					>
						<input
							:id="`passenger-${room.elementId}-${passenger.passengerId}`"
							type="checkbox"
							class="form-check-input"
							:checked="isPassengerSelected(passenger.passengerId)"
							:disabled="isPassengerDisabled(passenger.passengerId)"
							@change="onPassengerToggle(passenger.passengerId, ($event.target as HTMLInputElement).checked)"
						>
						<label
							class="form-check-label"
							:for="`passenger-${room.elementId}-${passenger.passengerId}`"
							:class="{ 'text-muted': isPassengerAssignedElsewhere(passenger.passengerId) }"
						>
							{{ getPassengerDisplayName(passenger) }}
							<span
								v-if="isPassengerAssignedElsewhere(passenger.passengerId)"
								class="badge bg-secondary ms-1"
							>
								Assigned
							</span>
						</label>
					</div>
				</div>

				<div
					v-if="v$.$error"
					class="validation-message text-danger mt-2"
				>
					<span v-if="selectedPassengerIds.length > 0 && selectedPassengerIds.length < room.minOccupancy">
						Minimum {{ room.minOccupancy }} passengers required for this room.
					</span>
					<span v-else-if="selectedPassengerIds.length > room.maxOccupancy">
						Maximum {{ room.maxOccupancy }} passengers allowed for this room.
					</span>
				</div>
			</div>

			<div class="card-footer">
				<div class="input-group">
					<span
						class="input-group-text"
					>
						Rating
					</span>

					<select
						v-model.number="gradeId"
						class="form-control form-select"
						:disabled="selectedPassengerIds.length === 0"
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
import type { Passenger, Room } from "~~/shared/types";

const props = defineProps<{
	productId: number;
	room: Room;
	allPassengers: Passenger[];
	assignedPassengerIds: number[];
	roomNumber: number;
}>();

const emit = defineEmits<{
	(e: "addPassenger", elementId: number, gradeId: number, passengerId: number): void;
	(e: "removePassenger" | "gradeSet", elementId: number, passengerId: number): void;
	(e: "onValidate"): void;
}>();

const rooming = useRoomingStore();

const gradeId = ref<number>(props.room.grades?.[0]?.gradeId ?? 0);
const selectedPassengerIds = ref<number[]>([]);

function isPassengerSelected(passengerId: number): boolean {
	return selectedPassengerIds.value.includes(passengerId);
}

function isPassengerAssignedElsewhere(passengerId: number): boolean {
	return props.assignedPassengerIds.includes(passengerId) && !selectedPassengerIds.value.includes(passengerId);
}

function isPassengerDisabled(passengerId: number): boolean {
	if (isPassengerSelected(passengerId)) return false;
	if (isPassengerAssignedElsewhere(passengerId)) return true;
	if (selectedPassengerIds.value.length >= props.room.maxOccupancy) return true;
	return false;
}

function getPassengerDisplayName(passenger: Passenger): string {
	if (passenger.firstName && passenger.lastName) {
		return `${passenger.title} ${passenger.firstName} ${passenger.lastName}`.trim();
	}
	return `Passenger ${passenger.passengerId} (${passenger.age})`;
}

function onPassengerToggle(passengerId: number, checked: boolean) {
	if (checked) {
		if (!selectedPassengerIds.value.includes(passengerId)) {
			selectedPassengerIds.value.push(passengerId);
			emit("addPassenger", props.room.elementId, gradeId.value, passengerId);
		}
	}
	else {
		selectedPassengerIds.value = selectedPassengerIds.value.filter(id => id !== passengerId);
		emit("removePassenger", props.room.elementId, passengerId);
	}
	emit("onValidate");
}

const rules = computed(() => ({
	selectedCount: {
		validOccupancy: helpers.withParams(
			{ type: "occupancy", min: props.room.minOccupancy, max: props.room.maxOccupancy },
			(val: number) => {
				// Empty is valid (no room selected)
				if (val === 0) return true;
				// If any passengers selected, must meet min/max
				return val >= props.room.minOccupancy && val <= props.room.maxOccupancy;
			},
		),
	},
}));

const stateForValidation = computed(() => ({
	selectedCount: selectedPassengerIds.value.length,
}));

const v$ = useVuelidate(rules, stateForValidation);

watch(gradeId, (val) => {
	emit("gradeSet", props.room.elementId, val);
});

onMounted(() => {
	const roomState = rooming.getRoomById(props.productId, props.room.elementId);
	if (roomState) {
		gradeId.value = roomState.gradeId;
		selectedPassengerIds.value = [...(roomState.passengerIds ?? [])];
	}
});

async function validate() {
	v$.value.$touch();
	return !v$.value.$invalid;
}

defineExpose({ validate, v$ });
</script>

<style scoped>
.passenger-list {
	max-height: 200px;
	overflow-y: auto;
}

.form-check {
	padding: 0.25rem 0;
	padding-left: 1.5rem;
}
</style>
