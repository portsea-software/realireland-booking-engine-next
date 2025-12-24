<template>
	<div>
		<div class="row">
			<div class="col-xs-12 col-lg-3">
				<div class="input-group mb-3">
					<span
						id="title"
						class="input-group-text"
						aria-label="Title"
					>Title</span>

					<select
						:value="modelValue.title"
						class="form-control form-select"
						:class="{ invalid: v$.title.$error }"
						@change="onTitleChange(($event.target as HTMLSelectElement).value)"
					>
						<option
							disabled
							value=""
						>
							Select
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

			<div class="col-xs-12 col-lg">
				<div class="input-group mb-3">
					<span class="input-group-text">First name</span>

					<input
						class="form-control"
						:class="{ invalid: v$.firstName.$error }"
						type="text"
						placeholder="John"
						:value="modelValue.firstName"
						@blur="v$.firstName.$touch()"
						@input="updateField('firstName', ($event.target as HTMLInputElement).value)"
					>
				</div>

				<div
					v-if="v$.firstName.$error"
					class="validation-message mb-3"
				>
					Please enter your first name
				</div>
			</div>

			<div class="col-xs-12 col-lg">
				<div class="input-group mb-3">
					<span class="input-group-text">Last name</span>

					<input
						class="form-control"
						:class="{ invalid: v$.lastName.$error }"
						type="text"
						placeholder="Smith"
						:value="modelValue.lastName"
						@blur="v$.lastName.$touch()"
						@input="updateField('lastName', ($event.target as HTMLInputElement).value)"
					>
				</div>

				<div
					v-if="v$.lastName.$error"
					class="validation-message mb-3"
				>
					Please enter your last name
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-xs-12 col-md">
				<div class="input-group mb-3">
					<span class="input-group-text">Email Address</span>

					<input
						class="form-control"
						:class="{ invalid: v$.email.$error }"
						type="email"
						placeholder="example@example.com"
						:value="modelValue.email"
						@blur="v$.email.$touch()"
						@input="updateField('email', ($event.target as HTMLInputElement).value)"
					>
				</div>

				<div
					v-if="v$.email.$error && !v$.email.required"
					class="validation-message mb-3"
				>
					Please enter an email address
				</div>
				<div
					v-if="v$.email.$error && !v$.email.email"
					class="validation-message mb-3"
				>
					Please enter a valid email address
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { required, email as emailValidator } from "@vuelidate/validators";

type TitleOption = { name: string };

type PassengerValue = {
	title: string;
	firstName: string;
	lastName: string;
	email: string;
};

const props = defineProps<{
	modelValue: PassengerValue;
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: PassengerValue): void;
}>();

const staticStore = useStaticStore();
const titles = computed<TitleOption[]>(() => staticStore.titles);

const rules = computed(() => ({
	title: { required },
	firstName: { required },
	lastName: { required },
	email: { required, email: emailValidator },
}));

const v$ = useVuelidate(rules, computed(() => props.modelValue));

function updateField<K extends keyof PassengerValue>(key: K, value: PassengerValue[K]) {
	emit("update:modelValue", { ...props.modelValue, [key]: value });
}

function onTitleChange(val: string) {
	updateField("title", val);
	v$.value.title.$touch();
}

async function validate() {
	v$.value.$touch();
	return !v$.value.$invalid;
}
defineExpose({ validate });
</script>
