<template>
	<div class="col-12">
		<div class="d-flex justify-content-between">
			<h6 class="mr-2">
				Passenger {{ modelValue.passengerId }} ({{ ageRange }})
			</h6>

			<div
				v-if="modelValue.passengerId === 1"
				class="form-check form-switch"
			>
				<input
					id="isClientTravelling"
					v-model="clientIsTravelling"
					class="form-check-input"
					type="checkbox"
				>
				<label
					class="form-check-label"
					for="isClientTravelling"
				>Are you travelling on the trip?</label>
			</div>
		</div>

		<div class="row align-items-top">
			<div class="col-xs-12 col-md-2">
				<div class="input-group mb-3">
					<select
						:value="modelValue.title"
						class="form-control form-select"
						:class="{ invalid: v$.title.$error }"
						:disabled="!modelValue.editable"
						@change="updateField('title', ($event.target as HTMLSelectElement).value)"
						@blur="v$.title.$touch()"
					>
						<option
							disabled
							value=""
						>
							Choose Title
						</option>

						<option
							v-for="(t, index) in titles"
							:key="index"
							:value="t.name"
							class="form-control-item"
						>
							{{ t.name }}
						</option>
					</select>
				</div>

				<div
					v-if="v$.title.$error"
					class="validation-message mb-3"
				>
					Please select your title
				</div>
			</div>

			<div class="col-xs-12 col-md">
				<div class="input-group mb-3">
					<input
						id="firstName"
						:value="modelValue.firstName"
						:disabled="!modelValue.editable"
						type="text"
						class="form-control"
						:class="{ invalid: v$.firstName.$error }"
						aria-label="First name"
						placeholder="First name"
						@input="updateField('firstName', ($event.target as HTMLInputElement).value)"
						@blur="v$.firstName.$touch()"
					>
				</div>

				<div
					v-if="v$.firstName.$error"
					class="validation-message mb-3"
				>
					Please enter your first name
				</div>
			</div>

			<div class="col-xs-12 col-md">
				<div class="input-group mb-3">
					<input
						id="lastName"
						:value="modelValue.lastName"
						:disabled="!modelValue.editable"
						type="text"
						class="form-control"
						:class="{ invalid: v$.lastName.$error }"
						aria-label="Last name"
						placeholder="Last name"
						@input="updateField('lastName', ($event.target as HTMLInputElement).value)"
						@blur="v$.lastName.$touch()"
					>
				</div>

				<div
					v-if="v$.lastName.$error"
					class="validation-message mb-3"
				>
					Please enter your last name
				</div>
			</div>

			<div class="col-12">
				<div class="input-group mb-3">
					<input
						id="dietaryRequirements"
						:value="modelValue.dietaryRequirements"
						type="text"
						class="form-control"
						aria-label="Dietary Requirements"
						placeholder="Dietary Requirements"
						@input="updateField('dietaryRequirements', ($event.target as HTMLInputElement).value)"
					>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";

type TitleOption = { name: string };

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

const props = defineProps<{
	modelValue: Passenger;
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: Passenger): void;
}>();

const staticStore = useStaticStore();
const passengersStore = usePassengersStore();

const titles = computed<TitleOption[]>(() => staticStore.titles);

const ageRange = computed(() => {
	if (props.modelValue.age === "INF") return "Infant";
	if (props.modelValue.age === "CHD") return "Child";
	return "Adult";
});

function updateField<K extends keyof Passenger>(key: K, value: Passenger[K]) {
	emit("update:modelValue", { ...props.modelValue, [key]: value });
}

const clientIsTravelling = computed<boolean>({
	get() {
		return !props.modelValue.editable;
	},
	set(isTravelling: boolean) {
		if (isTravelling) {
			const client = passengersStore.client;

			emit("update:modelValue", {
				...props.modelValue,
				title: client.title,
				firstName: client.firstName,
				lastName: client.lastName,
				editable: false,
			});
		}
		else {
			emit("update:modelValue", {
				...props.modelValue,
				title: "",
				firstName: "",
				lastName: "",
				editable: true,
			});
		}

		v$.value.$touch();
	},
});

const rules = computed(() => ({
	title: { required },
	firstName: { required },
	lastName: { required },
}));

const v$ = useVuelidate(rules, computed(() => props.modelValue));

async function validate() {
	v$.value.$touch();
	return !v$.value.$invalid;
}
defineExpose({ validate, v$ });
</script>
