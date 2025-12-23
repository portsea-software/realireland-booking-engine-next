<template>
  <div v-if="fatalError">
    <div class="card-header">
      Ooops! We seem to be having some technical difficulties.
    </div>

    <div class="card-body">
      <p class="card-text">
        Unfortunately our booking system is having a lie down at the moment!
      </p>

      <p class="card-text">
        Feel free to give us another try later, or contact us via
        <a :href="mailTo">email</a> or <a :href="tel">phone</a> instead.
      </p>

      <p class="card-text">We'd be delighted to hear from you.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWizardStore } from '~/stores/wizard'

const config = useRuntimeConfig()
const wizard = useWizardStore()
const { fatalError } = storeToRefs(wizard)

const mailTo = computed(() => `mailto:${config.public.contactEmail}`)
const tel = computed(() => `tel:${config.public.contactPhone}`)
</script>
