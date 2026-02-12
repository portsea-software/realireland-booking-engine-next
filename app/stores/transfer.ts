import type { Airport, RequireTransfers, TransferProduct } from "~~/shared/types";

const defaultAirport = "Dublin Airport";
const defaultAirportCity = "DUB";

const traiToCity = "DNG";
const traiPartialToPoint = "<nextacc>";

const traoFromCity = "DNG";
const traoPartialFromPoint = "<previousacc>";

export const useTransfersStore = defineStore("transfers", {
	state: () => ({
		requireTransfers: "yes" as RequireTransfers,
		inboundAirport: { airportCode: "CFN", cityCode: "DON", airportName: "Donegal Airport", foreignName: "" } as Airport | null,
		outboundAirport: { airportCode: "DUB", cityCode: "DUB", airportName: "Dublin Airport", foreignName: "" } as Airport | null,
		transferIn: null as TransferProduct | null,
		transferOut: null as TransferProduct | null,
	}),

	getters: {
		getCountyTransfersIn(): TransferProduct[] {
			return useCountyStore().getCountyTransfersIn as unknown as TransferProduct[];
		},
		getCountyTransfersOut(): TransferProduct[] {
			return useCountyStore().getCountyTransfersOut as unknown as TransferProduct[];
		},
		getFirstHotel(): any | null {
			return useDayByDayStore().getFirstHotel;
		},
		getLastHotel(): any | null {
			return useDayByDayStore().getLastHotel;
		},

		getTransferIn(): string {
			if (this.getFirstHotel != null) {
				if (this.requireTransfers === "yes" && this.transferIn != null) {
					return `Transfer from ${this.inboundAirport?.name ?? ""} to ${this.getFirstHotel.title}`;
				}
				else if (this.requireTransfers === "no" && this.transferIn != null) {
					return `Transfer from Airport to ${this.getLastHotel?.title ?? ""}`;
				}
				else if (this.requireTransfers === "none") {
					return `Own transport to ${this.getLastHotel?.title ?? ""}`;
				}
				else {
					return `Transfer arrangements to be confirmed (quoted price won't include transfers)`;
				}
			}
			return "";
		},

		getTransferInProductId(): number {
			if (
				this.requireTransfers !== "none"
				&& this.transferIn != null
				&& this.getFirstHotel != null
			) {
				return this.transferIn.productId;
			}
			return 0;
		},

		getFallbackTrai(): TransferProduct | undefined {
			return this.getCountyTransfersIn.find((t) => {
				return (
					t.fromCityCode === defaultAirportCity
					&& t.fromPoint === defaultAirport.substring(0, 20)
					&& t.toCityCode === traiToCity
					&& String(t.toPoint ?? "").toLowerCase().includes(traiPartialToPoint)
				);
			});
		},

		getTransferOut(): string {
			if (this.getLastHotel != null) {
				if (this.requireTransfers === "yes" && this.transferOut != null) {
					return `Transfer from ${this.getLastHotel.title} to ${this.outboundAirport?.name ?? ""}`;
				}
				else if (this.requireTransfers === "no" && this.transferOut != null) {
					return `Transfer from ${this.getLastHotel.title} to Airport`;
				}
				else if (this.requireTransfers === "none") {
					return `Own transport departing Donegal`;
				}
				else {
					return `Transfer arrangements to be confirmed (quoted price won't include transfers)`;
				}
			}
			return "";
		},

		getTransferOutProductId(): number {
			if (
				this.requireTransfers !== "none"
				&& this.transferOut != null
				&& this.getLastHotel != null
			) {
				return this.transferOut.productId;
			}
			return 0;
		},

		getFallbackTrao(): TransferProduct | undefined {
			return this.getCountyTransfersOut.find((t) => {
				return (
					t.fromCityCode === traoFromCity
					&& String(t.fromPoint ?? "").toLowerCase().includes(traoPartialFromPoint)
					&& t.toCityCode === defaultAirportCity
					&& t.toPoint === defaultAirport.substring(0, 20)
				);
			});
		},
	},

	actions: {
		setRequireTransfers(payload: RequireTransfers) {
			if (this.requireTransfers !== payload) {
				// clear any previous selections
				this.inboundAirport = null;
				this.outboundAirport = null;
				this.transferIn = null;
				this.transferOut = null;

				// finally set the state
				this.requireTransfers = payload;
			}
		},

		setInboundAirport(payload: Airport | null) {
			if (this.inboundAirport !== payload) {
				this.inboundAirport = payload;
			}
		},

		setOutboundAirport(payload: Airport | null) {
			if (this.outboundAirport !== payload) {
				this.outboundAirport = payload;
			}
		},

		checkTransfers() {
			// check for transfers regardless of whether airports have been specified
			const firstHotel = this.getFirstHotel;
			const lastHotel = this.getLastHotel;

			let trai: TransferProduct | null = null;
			let trao: TransferProduct | null = null;

			if (firstHotel != null && lastHotel != null) {
				if (this.inboundAirport != null) {
					trai
						= this.getCountyTransfersIn.find((t) => {
							return (
								t.fromCityCode === this.inboundAirport?.cityCode
								&& t.fromPoint === String(this.inboundAirport!.airportName ?? "").substring(0, 20)
								&& t.toCityCode === traiToCity
								&& String(t.toPoint ?? "").toLowerCase().includes(traiPartialToPoint)
							);
						}) ?? null;
				}

				if (this.outboundAirport != null) {
					trao
						= this.getCountyTransfersOut.find((t) => {
							return (
								t.fromCityCode === traoFromCity
								&& String(t.fromPoint ?? "").toLowerCase().includes(traoPartialFromPoint)
								&& t.toCityCode === this.inboundAirport?.cityCode
								&& t.toPoint === String(this.inboundAirport?.airportName ?? "").substring(0, 20)
							);
						}) ?? null;
				}
			}

			if (!trai) trai = this.getFallbackTrai ?? null;
			if (!trao) trao = this.getFallbackTrao ?? null;

			this.transferIn = trai;
			this.transferOut = trao;
		},

		handleTransfers() {
			let trai: TransferProduct | null = null;
			let trao: TransferProduct | null = null;

			if (this.inboundAirport != null) {
				trai
					= this.getCountyTransfersIn.find((t) => {
						return (
							t.fromCityCode === this.inboundAirport?.cityCode
							&& t.fromPoint === String(this.inboundAirport!.airportName ?? "").substring(0, 20)
							&& t.toCityCode === traiToCity
							&& String(t.toPoint ?? "").toLowerCase().includes(traiPartialToPoint)
						);
					}) ?? null;
			}

			if (this.outboundAirport != null) {
				trao
					= this.getCountyTransfersOut.find((t) => {
						return (
							t.fromCityCode === traoFromCity
							&& String(t.fromPoint ?? "").toLowerCase().includes(traoPartialFromPoint)
							&& t.toCityCode === this.inboundAirport?.cityCode
							&& t.toPoint === String(this.inboundAirport?.airportName ?? "").substring(0, 20)
						);
					}) ?? null;
			}

			this.transferIn = trai;
			this.transferOut = trao;
		},
	},
});
