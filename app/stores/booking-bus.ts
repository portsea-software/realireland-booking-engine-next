import { defineStore } from "pinia";

type SelectProductEvent = {
	id: number;
	dayNo: number;
	productType: string;
};

type AddProductEvent = {
	id: number;
	productId: number;
	productTime?: string;
};

export const useBookingBusStore = defineStore("BookingBus", {
	state: () => ({
		selectProductEvent: null as SelectProductEvent | null,
		addProductEvent: null as AddProductEvent | null,
	}),

	actions: {
		requestSelectProduct(dayNo: number, productType: string) {
			this.selectProductEvent = {
				id: Date.now() + Math.floor(Math.random() * 100000),
				dayNo,
				productType,
			};
		},

		requestAddProduct(productId: number, productTime?: string) {
			this.addProductEvent = {
				id: Date.now() + Math.floor(Math.random() * 100000),
				productId,
				productTime,
			};
		},

		clearSelectProductEvent() {
			this.selectProductEvent = null;
		},
		clearAddProductEvent() {
			this.addProductEvent = null;
		},
	},
});
