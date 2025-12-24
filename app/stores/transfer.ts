// default airport to use for transfers pricing if none specified
const defaultAirport = "Dublin Airport";
const defaultAirportCity = "DUB";

// transfer to information to use for all bookings
const traiToCity = "DONE";
const traiPartialToPoint = "<nextacc>";

// transfer from information to use for all bookings
const traoFromCity = "DONE";
const traoPartialFromPoint = "<previousacc>";

type RequireTransfers = "yes" | "no" | "none";

type Airport = {
	cityId: number;
	cityCode?: string;
	name?: string;
	airportName?: string;
	[k: string]: any;
};

type TransferProduct = {
	productId: number;
	fromCity: { cityId: number; cityCode: string };
	toCity: { cityId: number; cityCode: string };
	fromPoint: string;
	toPoint: string;
	[k: string]: any;
};

export const useTransfersStore = defineStore("transfers", {
	state: () => ({
		requireTransfers: "yes" as RequireTransfers,
		inboundAirport: null as Airport | null,
		outboundAirport: null as Airport | null,
		transferIn: null as TransferProduct | null,
		transferOut: null as TransferProduct | null,
	}),

	getters: {
		getCountyTransfersIn(): TransferProduct[] {
			return useProductsStore().getCountyTransfersIn as unknown as TransferProduct[];
		},
		getCountyTransfersOut(): TransferProduct[] {
			return useProductsStore().getCountyTransfersOut as unknown as TransferProduct[];
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
					t.fromCity.cityCode === defaultAirportCity
					&& t.fromPoint === defaultAirport.substring(0, 20)
					&& t.toCity.cityCode === traiToCity
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
					t.fromCity.cityCode === traoFromCity
					&& String(t.fromPoint ?? "").toLowerCase().includes(traoPartialFromPoint)
					&& t.toCity.cityCode === defaultAirportCity
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
								t.fromCity.cityId === this.inboundAirport!.cityId
								&& t.fromPoint === String(this.inboundAirport!.airportName ?? "").substring(0, 20)
								&& t.toCity.cityCode === traiToCity
								&& String(t.toPoint ?? "").toLowerCase().includes(traiPartialToPoint)
							);
						}) ?? null;
				}

				if (this.outboundAirport != null) {
					trao
						= this.getCountyTransfersOut.find((t) => {
							return (
								t.fromCity.cityCode === traoFromCity
								&& String(t.fromPoint ?? "").toLowerCase().includes(traoPartialFromPoint)
								// ⚠️ preserved from your Vuex: it compares to inboundAirport.cityId (likely bug)
								&& t.toCity.cityId === this.inboundAirport?.cityId
								// ⚠️ preserved from your Vuex: it uses inboundAirport.name (likely bug, probably outboundAirport)
								&& t.toPoint === String(this.inboundAirport?.name ?? "").substring(0, 20)
							);
						}) ?? null;
				}
			}

			if (!trai) trai = this.getFallbackTrai ?? null;
			if (!trao) trao = this.getFallbackTrao ?? null;

			this.transferIn = trai;
			this.transferOut = trao;
		},
	},
});
