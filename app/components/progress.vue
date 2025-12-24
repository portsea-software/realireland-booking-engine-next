<template>
	<div
		class="progress"
		style="height: 30px"
	>
		<div
			class="progress-bar flex-row align-items-center"
			role="progressbar"
			:style="{ width: `${wizardProgress}%` }"
			:aria-valuenow="wizardProgress"
			aria-valuemin="0"
			:aria-valuemax="100"
		>
			{{ wizardLabel }}
		</div>
	</div>
</template>

<script setup lang="ts">
const wizard = useWizardStore();
const { wizardLabel, wizardProgress } = storeToRefs(wizard);
</script>
