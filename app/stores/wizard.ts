// // stores/wizard.ts
// import { defineStore } from 'pinia'
// import * as dateHelper from '~/utils/date'

// // components
import WizardError from '~/components/wizard/00-error.vue'
// import WizardStart from '~/components/wizard/01_Start.vue'
// import WizardTransfers from '~/components/wizard/02_Transfers.vue'
// import WizardDayByDay from '~/components/wizard/03_DayByDay.vue'
// import WizardRooming from '~/components/wizard/04_Rooming.vue'
// import WizardPassengers from '~/components/wizard/05_Passengers.vue'
// import WizardSummary from '~/components/wizard/06_Summary.vue'
// import WizardPayment from '~/components/wizard/07_Payment.vue'
// import WizardThankyou from '~/components/wizard/08_Thankyou.vue'

// import { useStartStore } from '~/stores/start'
// import { useDayByDayStore } from '~/stores/dayByDay'
// import { useCountyProductsStore } from '~/stores/county-products'

export const useWizardStore = defineStore('wizard', {
  state: () => ({
    fatalError: false,
    wizardStep: 1,

    wizardLabels: [
      'Start',
      'Transfers',
      'Build',
      'Rooming',
      'Passengers',
      'Summary',
      'Payment',
      'Thankyou',
    ] as string[],

    wizardComponents: [
    //   WizardStart,
    //   WizardTransfers,
    //   WizardDayByDay,
    //   WizardRooming,
    //   WizardPassengers,
    //   WizardSummary,
    //   WizardPayment,
    //   WizardThankyou,
    ] as string[],

    errorComponent: WizardError,
  }),

  getters: {
    wizardStepIndex: (state) => state.wizardStep - 1,

    wizardLabel: (state) => state.wizardLabels[state.wizardStep - 1],

    wizardComponent: (state) => {
      if (state.fatalError) return state.errorComponent
      return state.wizardComponents[state.wizardStep - 1] ?? state.errorComponent
    },

    wizardProgress: (state) =>
      Math.min(
        Math.round((100 / state.wizardLabels.length) * state.wizardStep) + 5,
        100
      ),

    canNext: (state) => state.wizardStep <= state.wizardLabels.length,

    canPrev: (state) => state.wizardStep > 1 && state.wizardStep < 7,
  },

  actions: {

    async nextStep() {
      // same Vuex behavior
      if (this.wizardStep === 1) {
        // const start = useStartStore()
        // const county = useCountyProductsStore()

        // await county.initialiseCountyData({
        //   countyId: start.selectedCounty?.areaId,
        //   countyName: start.selectedCounty?.name,
        //   fromDate: start.fromDate,
        //   toDate: dateHelper.addDays(start.fromDate, start.noOfNights),
        // })
      }

      this.wizardStep += this.wizardStep
    },

    setFatalError(payload?: any) {
    //   this.setFatalErrorMutation()
    this.fatalError = true 

      // axios error logging (same as Vuex)
      if (payload) {
        if (payload.response) {
          console.log(payload.response.data)
          console.log(payload.response.status)
          console.log(payload.response.headers)
        } else if (payload.request) {
          console.log(payload.request)
        } else {
          console.log('Error', payload.message)
        }
      }

      // log day-by-day data
    //   const dayByDay = useDayByDayStore()
    //   if (dayByDay.days) {
    //     console.log('Day-by-day Data', dayByDay.days)
    //   }
    },
  },
})
