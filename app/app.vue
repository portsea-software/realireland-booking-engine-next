<template>
  <div>
    <header class="header sticky-top py-2">
      <div class="container">
        <Progress class="mb-2" />
      </div>
    </header>

    <div class="header mt-0 py-2">
      <img
        class="mx-auto d-block my-2"
        height="80"
        style="filter: invert(1)"
        src="~/assets/Real-Ireland-logo[Mono].png"
        alt="Logo"
      >
      <h2 class="text-center">{{ title }}</h2>
    </div>

    <div class="container py-4">
      <div class="row">
        <div class="col">
          <Transition name="slide" mode="out-in">
            <component :is="wizardComponent" />
          </Transition>
        </div>
      </div>

      <div v-if="debugMode" class="row my-4 justify-content-end">
        <button class="btn btn-info mx-1" :disabled="!canPrev" @click="wizardStep--">
          Previous
        </button>
        <button class="btn btn-success mx-1" :disabled="!canNext" @click="wizardStep++">
          Next
        </button>
      </div>
    </div>

    <footer class="pt-2 pb-2 footer">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <p>
              Copyright © {{ year }} Luxury European Tours Ltd.<br >
              All rights reserved<br >
            </p>
          </div>

          <div class="col-md-6">
            <span class="d-flex align-items-center mb-1">
              <Icon name="i-lucide:mail" />
              <a class="ms-1" :href="mailTo">Email Luxury European Tours Ltd</a>
            </span>
            <span class="d-flex align-items-center mb-1" >
              <Icon name="i-lucide:phone" />
              <a class="ms-1" :href="tel">Call Luxury European Tours Ltd</a>
            </span>
            <span class="d-flex align-items-center mb-1">
              <Icon name="i-lucide:earth" /> <a class="ms-1" href="https://www.luxuryeuropeantours.com">Visit luxuryeuropeantours.com</a>
            </span>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col d-flex justify-content-end">
            <span>
              <Icon name="i-lucide:earth" /><a href="mailto:info@portseasoftware.com">Website by Portsea Software Ltd</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWizardStore } from '~/stores/wizard'

const config = useRuntimeConfig()

const debugMode = computed(() => String(config.public.debug) == 'true')
const title = computed(() => String(config.public.title ?? ''))

const mailTo = computed(() => `mailto:${config.public.contactEmail}`)
const tel = computed(() => `tel:${config.public.contactPhone}`)

const year = new Date().getFullYear()

const wizard = useWizardStore()
const { wizardComponent, canNext, canPrev, wizardStep } = storeToRefs(wizard)
</script>
