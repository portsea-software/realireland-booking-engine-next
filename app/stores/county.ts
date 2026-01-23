import type { Tariff } from "~~/shared/types";

type ProductImage = { imageId: number | string; url: string } | { imageId: number | string; url: null };

export type Product = {
	productId: number;
	title: string;
	productType: string;
	productCode: string;

	fromCity: string;
	fromCityCode: string;
	fromPoint: string;
	fromTime: string;
	fromTimeHours: number;

	toCity: string;
	toCityCode: string;
	toPoint: string;
	toTime: string;
	toTimeHours: number;

	rating: string;
	description: string;

	images: ProductImage[];
	tariffs: Tariff[];

	rank?: number;
};

type InitCountyPayload = { countyId: number; countyName: string; fromDate: Date; toDate: Date };

function safeInt(v: unknown, fallback = 0) {
	const n = Number.parseInt(String(v ?? ""), 10);
	return Number.isFinite(n) ? n : fallback;
}

export const useCountyStore = defineStore("CountyStore", {
	state: () => ({
		productsLoaded: false,
		products: [] as Product[],
		isLoading: false,
	}),

	getters: {
		getCountyHotels: (state) => {
			const passengers = usePassengersStore();
			const paxToRoom = passengers.getPassengersToRoom;

			// filter hotels with at least 1 tariff that can accommodate party
			let hotels = state.products.filter((prod) => {
				return (
					prod.productCode === "HTL"
					&& (prod.tariffs ?? []).some(t => (t?.maxOccupancy ?? 0) >= paxToRoom)
				);
			});

			hotels = hotels.map(hotel => ({
				...hotel,
				rank: safeInt(String(hotel.rating ?? "").substring(0, 1), 0),
			}));

			return hotels.sort((a, b) => ((a.rank ?? 0) > (b.rank ?? 0) ? -1 : 1));
		},

		getCountyExcursions: (state) => {
			return state.products.filter((prod) => {
				return (
					(prod.productCode === "EXCR" || prod.productCode === "TRA")
					&& (prod.fromTimeHours ?? 0) < 18
				);
			});
		},

		getCountyEntertainments: (state) => {
			return state.products.filter((prod) => {
				return (
					(((prod.productCode === "EXCR" || prod.productCode === "TRA")
						&& (prod.fromTimeHours ?? 0) >= 18)
					|| prod.productCode === "REST")
				);
			});
		},

		getCountyTransfersIn: state => state.products.filter(prod => prod.productCode === "TRAI"),
		getCountyTransfersOut: state => state.products.filter(prod => prod.productCode === "TRAO"),
	},

	actions: {
		async initialiseCountyData(payload: InitCountyPayload) {
			const wizard = useWizardStore();
			const start = useStartStore();

			if (start.fromDate == null || start.noOfNights <= 0) return;

			this.productsLoaded = false;

			try {
				this.isLoading = true;
				const filters = [
					{
						ColumnName: "from_county_name",
						Comparison: "Equal",
						Values: [payload.countyName],
					},
					{
						ColumnName: "from_county_id",
						Comparison: "Equal",
						Values: [String(payload.countyId)],
					},
				];

				const requestPayload = {
					filters,
					pageNo: 1,
					rowCount: 1000,
					sorts: [],
				};

				const response = await useApiAppAuth<any>(
					"api/booking-engine/products/product-details",
					{ method: "POST", body: requestPayload },
				);

				const rows = response?.rows ?? [];

				const products: Product[] = rows.map((prod: any) => ({
					productId: prod.product_id,
					title: prod.title,
					productType: prod.product_type_name,
					productCode: prod.product_type_code,

					fromCity: prod.from_city_name,
					fromCityCode: prod.from_city_code,
					fromPoint: prod.from_point,
					fromTime: prod.from_time,
					fromTimeHours: safeInt(prod.from_time?.substring(0, 2), 0),

					toCity: prod.to_city_name,
					toCityCode: prod.to_city_code,
					toPoint: prod.to_point,
					toTime: prod.to_time,
					toTimeHours: safeInt(prod.to_time?.substring(0, 2), 0),

					rating: prod.rating,
					description: prod.description,

					images: [],
					tariffs: [],
				}));

				const productsWithImages = await Promise.all(
					products.filter(p => ["HTL", "EXCR", "REST"].includes(p.productCode)).map(async (p) => {
						try {
							const imagesRes = await useApiAppAuth<any>(`api/booking-engine/products/${p.productId}/images`, { method: "GET" });

							const imageList = imagesRes ?? [];

							const images: ProductImage[] = await Promise.all(
								(imageList as any[]).map(async (image) => {
									try {
										if (!import.meta.client) {
											return { imageId: image.imageId, url: null };
										}
										const blob = await useApiAppAuth<Blob>(
											`api/booking-engine/products/${p.productId}/images/${image.imageId}`,
											{ method: "GET", responseType: "blob" as any },
										);

										return {
											imageId: image.imageId,
											url: URL.createObjectURL(blob as any),
										};
									}
									catch (e) {
										console.error(`Failed to fetch image blob for ${image.imageId}`, e);
										return { imageId: image.imageId, url: null };
									}
								}),
							);

							return { ...p, images };
						}
						catch (err) {
							console.warn(`Error fetching data for product ${p.productId}:`, err);
							return p;
						}
					}),
				);

				const productsWithElementsAndGrades = await Promise.all(
					products.filter(p => ["HTL"].includes(p.productCode)).map(async (p) => {
						try {
							const [elementsRes, gradesRes] = await Promise.all([
								useApiAppAuth<any>(`api/booking-engine/products/${p.productId}/elements`, { method: "GET" }),
								useApiAppAuth<any>(`api/booking-engine/products/${p.productId}/grades`, { method: "GET" }),
							]);

							const tariffs = elementsRes.map((element: any) => {
								return {
									elementId: element.elementId,
									element: element.title,
									minOccupancy: element.minOccupancy,
									maxOccupancy: element.maxOccupancy,
									code: element.code,
									defaultCode: element.defaultCode,
									grades: gradesRes.map((grade: any) => {
										return {
											gradeId: grade.gradeId,
											title: grade.title,
											code: grade.code,
											defaultCode: grade.defaultCode,
										};
									}),
								};
							});

							return { ...p, tariffs };
						}
						catch (err) {
							console.warn(`Error fetching data for product ${p.productId}:`, err);
							return p;
						}
					}),
				);

				const mappedProductsWithImages = new Map(productsWithImages.map(p => [p.productId, p]));
				const mappedProductsWithElementsAndGrades = new Map(productsWithElementsAndGrades.map(p => [p.productId, p]));

				this.products = products.map(p => mappedProductsWithImages.get(p.productId) ?? p);
				this.products = products.map(p => mappedProductsWithElementsAndGrades.get(p.productId) ?? p);

				console.log(this.products);

				this.productsLoaded = true;
			}
			catch (error) {
				console.error("Error in initialiseCountyData:", error);
				wizard.setFatalError(error);
			}
			finally {
				this.isLoading = false;
			}
		},

		// async fetchProductElementsAndGrades() {
		// 	const wizard = useWizardStore();

		// 	try {
		// 		this.isLoading = true;

		// 		const enrichedProducts = await Promise.all(
		// 			this.products.slice(0, 20).map(async (p) => {
		// 				try {
		// 					const [productElementsResponse, productGradesResponse] = await Promise.all([
		// 						useApiAppAuth<any>(`api/booking-engine/products/${p.productId}/elements`, { method: "GET" }),
		// 						useApiAppAuth<any>(`api/booking-engine/products/${p.productId}/grades`, { method: "GET" }),
		// 					]);

		// 					console.log(productElementsResponse);
		// 					console.log(productGradesResponse);

		// 					return { ...p, productElementsResponse, productGradesResponse };
		// 				}
		// 				catch (err) {
		// 					console.warn(`Error fetching data for product ${p.productId}:`, err);
		// 					return p;
		// 				}
		// 			}),
		// 		);

		// 		const completeProducts = this.products.slice(0, 20).map((p) => {
		// 			const enriched = enrichedProducts.find(ep => ep.productId === p.productId);
		// 			return enriched || p;
		// 		});

		// 		this.products = completeProducts;
		// 	}
		// 	catch (error) {
		// 		console.error("Error in fetch product elements and grades:", error);
		// 		wizard.setFatalError(error);
		// 	}
		// 	finally {
		// 		this.isLoading = false;
		// 	}
		// },
	},
});
