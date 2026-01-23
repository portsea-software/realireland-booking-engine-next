import type { Client, Passenger } from "~~/shared/types";

export const usePassengersStore = defineStore("PassengersStore", {
	state: () => {
		const config = useRuntimeConfig();

		const minAdults = parseIntSafe(config.public.minAdl, 1);
		const maxAdults = parseIntSafe(config.public.maxAdl, minAdults);

		const minChildren = parseIntSafe(config.public.minChd, 0);
		const maxChildren = parseIntSafe(config.public.maxChd, minChildren);

		const minInfants = parseIntSafe(config.public.minInf, 0);
		const maxInfants = parseIntSafe(config.public.maxInf, minInfants);

		return {
			minAdults,
			maxAdults,
			minChildren,
			maxChildren,
			minInfants,
			maxInfants,

			client: { title: "Mr", firstName: "Hafiz", lastName: "Hafiz", age: "ADL", email: "hafizjaidi786@gmail.com" } as Client,
			passengers: [] as Passenger[],
			noOfAdults: minAdults,
			noOfChildren: minChildren,
			noOfInfants: minInfants,
		};
	},

	getters: {
		getMinAdults: s => s.minAdults,
		getMaxAdults: s => s.maxAdults,

		getMinChildren: s => s.minChildren,
		getMaxChildren: s => s.maxChildren,

		getMinInfants: s => s.minInfants,
		getMaxInfants: s => s.maxInfants,

		getPassengersToRoom: s => s.noOfAdults + s.noOfChildren,

		getNoOfADLPassengers: s => s.passengers.filter(p => p.age === "ADL").length,
		getNoOfCHDPassengers: s => s.passengers.filter(p => p.age === "CHD").length,
		getNoOfINFPassengers: s => s.passengers.filter(p => p.age === "INF").length,
	},

	actions: {
		setClient(payload: Client) {
			this.client = payload;
		},

		setNoOfAdults(payload: number) {
			this.noOfAdults = payload;
		},

		setNoOfChildren(payload: number) {
			this.noOfChildren = payload;
		},

		setNoOfInfants(payload: number) {
			this.noOfInfants = payload;
		},

		resetPassengers() {
			this.passengers = [];
		},

		addPassenger(payload: Passenger) {
			this.passengers.push(payload);
		},

		setClientIsTravelling(isTravelling: boolean) {
			const passenger = this.passengers.find((p: Passenger) => p.passengerId === 1);
			if (passenger) passenger.editable = isTravelling;
		},

		initPassengers() {
			if (
				this.noOfAdults === this.getNoOfADLPassengers
				&& this.noOfChildren === this.getNoOfCHDPassengers
				&& this.noOfInfants === this.getNoOfINFPassengers
			) {
				return;
			}

			this.resetPassengers();

			for (let p = 1; p <= this.noOfAdults; p++) {
				this.addPassenger({
					passengerId: p,
					title: "",
					firstName: "",
					lastName: "",
					age: "ADL",
					dietaryRequirements: "",
					editable: true,
				});
			}

			let offset = this.noOfAdults;
			for (let p = offset + 1; p <= this.noOfChildren + offset; p++) {
				this.addPassenger({
					passengerId: p,
					title: "",
					firstName: "",
					lastName: "",
					age: "CHD",
					dietaryRequirements: "",
					editable: true,
				});
			}

			offset += this.noOfChildren;
			for (let p = offset + 1; p <= this.noOfInfants + offset; p++) {
				this.addPassenger({
					passengerId: p,
					title: "",
					firstName: "",
					lastName: "",
					age: "INF",
					dietaryRequirements: "",
					editable: true,
				});
			}
		},
	},
});
