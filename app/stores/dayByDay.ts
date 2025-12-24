type Day = {
	number: number;
	date: string;
	excursionId: number;
	entertainmentId: number;
	entertainmentTime: string;
	hotelId: number;
};

type Pricing = {
	totalPriceFormatted: string;
	amountToPayFormatted: string;
	amountToPay: number;
	totalPrice: number;
};

type AddProductPayload = {
	dayNo: number;
	productId: number;
	productType?: string;
	productTime?: string;
};

export const useDayByDayStore = defineStore("dayByDay", {
	state: () => ({
		days: [] as Day[],
		restaurantTimes: ["18:30", "19:00", "19:30", "20:00", "20:30"],
		calculatedPricing: true,
		pricing: {
			totalPriceFormatted: "€1000",
			amountToPayFormatted: "€1000",
			amountToPay: 1000,
			totalPrice: 1000,
		} as Pricing,
		dialogProductType: "" as string,
	}),

	getters: {
		getCountyHotels() {
			return useProductsStore().getCountyHotels;
		},
		getCountyExcursions() {
			return useProductsStore().getCountyExcursions;
		},
		getCountyEntertainments() {
			return useProductsStore().getCountyEntertainments;
		},

		getFirstHotel(): any | null {
			if (!this.days?.length) return null;
			if (this.days[0]?.hotelId === 0) return null;

			return this.getCountyHotels.find((htl: any) => htl.productId === this.days[0]?.hotelId) ?? null;
		},

		getLastHotel(): any | null {
			if (!this.days?.length) return null;

			const index = this.days.length - 2;
			if (index < 0) return null;

			if (this.days[index]?.hotelId === 0) return null;

			return this.getCountyHotels.find((htl: any) => htl.productId === this.days[index]?.hotelId) ?? null;
		},

		getSelectedHotels(): any[] {
			const hotelIds = [...new Set(this.days.map(d => d.hotelId))].filter(id => id > 0);

			return this.getCountyHotels.filter((htl: any) => hotelIds.includes(htl.productId));
		},

		getSelectedExcursions(): any[] {
			const ids = [...new Set(this.days.map(d => d.excursionId))].filter(id => id > 0);

			return this.getCountyExcursions.filter((excr: any) => ids.includes(excr.productId));
		},

		getSelectedEntertainments(): any[] {
			const ids = [...new Set(this.days.map(d => d.entertainmentId))].filter(id => id > 0);

			return this.getCountyEntertainments.filter((ent: any) => ids.includes(ent.productId));
		},

		getPricingRequestPostData(): any {
			const start = useStartStore();
			const staticStore = useStaticStore();
			const transfers = useTransfersStore();
			const passengers = usePassengersStore();
			const rooming = useRoomingStore();

			return {
				fromDate: start.fromDate,
				currencyId: staticStore.getEuroCurrency?.currencyId,
				transferInProductId: transfers.getTransferInProductId,
				transferOutProductId: transfers.getTransferOutProductId,
				numberOfAdults: passengers.noOfAdults,
				numberOfChildren: passengers.noOfChildren,
				numberOfInfants: passengers.noOfInfants,
				days: this.days.map(day => ({
					dayNumber: day.number,
					excursionId: day.excursionId,
					entertainmentId: day.entertainmentId,
					entertainmentTime: day.entertainmentTime,
					hotelId: day.hotelId,
				})),
				roomingInfos: rooming.rooms,
			};
		},
	},

	actions: {
		initDbdDays() {
			const start = useStartStore();
			const rooming = useRoomingStore();

			const noOfDays = start.noOfDays;
			if (this.days != null && this.days.length === noOfDays) return;

			const dateOptions: Intl.DateTimeFormatOptions = {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			};

			const days: Day[] = [];
			if (noOfDays) {
				for (let i = 1; i <= noOfDays; i++) {
					days.push({
						number: i,
						date: addDays(start.fromDate, i - 1).toLocaleString(undefined, dateOptions),
						excursionId: 0,
						entertainmentId: 0,
						entertainmentTime: "00:00",
						hotelId: 0,
					});
				}
			}

			rooming.resetRooms();

			this.days = days;
		},

		setDialogProductType(payload: { productType: string }) {
			this.dialogProductType = payload.productType;
		},

		setHotel(payload: { dayNo: number; productId: number }) {
			const day = this.days.find(d => d.number === payload.dayNo);
			if (day) day.hotelId = payload.productId;
		},

		setExcursion(payload: { dayNo: number; productId: number }) {
			const day = this.days.find(d => d.number === payload.dayNo);
			if (day) day.excursionId = payload.productId;
		},

		setEntertainment(payload: { dayNo: number; productId: number; productTime: string }) {
			const day = this.days.find(d => d.number === payload.dayNo);
			if (day) {
				day.entertainmentId = payload.productId;
				day.entertainmentTime = payload.productTime;
			}
		},

		removeExcursion(dayNo: number) {
			const day = this.days.find(d => d.number === dayNo);
			if (day) day.excursionId = 0;
		},

		removeEntertainment(dayNo: number) {
			const day = this.days.find(d => d.number === dayNo);
			if (day) day.entertainmentId = 0;
		},

		setCalculatedPricing(payload: boolean) {
			this.calculatedPricing = payload;
		},

		setPricing(payload: Pricing) {
			this.pricing = payload;
		},

		addProduct(payload: AddProductPayload) {
			const productsStore = useProductsStore();
			const transfers = useTransfersStore();
			const rooming = useRoomingStore();

			const allProducts = productsStore.products;
			const product = allProducts.find((p: any) => p.productId === payload.productId);
			if (!product) return;

			if (product.productCode === "HTL") {
				// set hotel for this day and following days that have the same hotel id
				const currentHotelId = this.days.find(d => d.number === payload.dayNo)?.hotelId ?? 0;
				let lastDaySet = payload.dayNo;

				if (currentHotelId !== payload.productId) {
					this.days
						.filter(d => d.number >= payload.dayNo)
						.forEach((d) => {
							if (d.hotelId === currentHotelId && d.number < this.days.length) {
								this.setHotel({ dayNo: d.number, productId: payload.productId });
								lastDaySet = d.number;
							}
						});
				}

				// if we have set the first or last hotel, then check transfers
				if (payload.dayNo === 1 || lastDaySet === this.days.length) {
					transfers.checkTransfers();
				}

				// if old hotel is no longer selected then remove its rooms
				const stillUsed
					= this.getSelectedHotels.filter((htl: any) => htl.productId === currentHotelId).length > 0;

				if (!stillUsed && currentHotelId > 0) {
					rooming.trimRooms(currentHotelId);
				}
			}
			else {
				if (product.productCode !== "REST" && (product.fromTimeHours ?? 0) < 18) {
					this.setExcursion({ dayNo: payload.dayNo, productId: payload.productId });
				}
				else {
					this.setEntertainment({
						dayNo: payload.dayNo,
						productId: payload.productId,
						productTime: payload.productTime ?? "00:00",
					});
				}
			}
		},

		removeProduct(payload: { productType: string; dayNo: number }) {
			if (payload.productType === "Excursion") {
				this.removeExcursion(payload.dayNo);
			}
			else if (payload.productType === "Entertainment") {
				this.removeEntertainment(payload.dayNo);
			}
		},
	},
});
