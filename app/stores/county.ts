import type { Element, Grade, Tariff } from "~~/shared/types";
import type { ProductPrice } from "~~/shared/types/price";

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
				return (prod.tariffs.length > 0) && (prod.productCode === "EXCR" || prod.productCode === "TRA") && (prod.fromTimeHours ?? 0) < 18;
			});
		},

		getCountyEntertainments: (state) => {
			return state.products.filter((prod) => {
				return (
					(prod.tariffs.length > 0) && (((prod.productCode === "EXCR" || prod.productCode === "TRA")
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
					{
						ColumnName: "product_type_code",
						Comparison: "IN",
						Values: ["REST", "HTL", "EXCR", "TRA", "TRAI"],
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

				// Current Year + Next 5 Years
				const fromDate = new Date(new Date().setFullYear(new Date().getFullYear()))
					.toISOString()
					.split("T")[0];

				const toDate = new Date(new Date().setFullYear(new Date().getFullYear() + 5))
					.toISOString()
					.split("T")[0];

				// Fetch elements, grades, prices first to determine which products have tariffs
				const productsWithTariffs = await Promise.all(
					products.filter(p => ["HTL", "EXCR", "REST"].includes(p.productCode)).map(async (p) => {
						try {
							const [elementsRes, gradesRes, pricesRes] = await Promise.all([
								useApiAppAuth<Element[]>(`api/booking-engine/products/${p.productId}/elements`, { method: "GET" }),
								useApiAppAuth<Grade[]>(`api/booking-engine/products/${p.productId}/grades`, { method: "GET" }),
								useApiAppAuth<ProductPrice>(`api/booking-engine/products/${p.productId}/prices?fromDate=${fromDate}&toDate=${toDate}`, { method: "GET" }),
							]);

							const adlPrices = pricesRes.dates.filter(p => p.ages.filter(a => a.ageGroup === "ADL"));

							// More narrow down based on the arrival date choose by user
							const filteredPrices = adlPrices.filter((date) => {
								const fromDate = new Date(date.fromDate);
								const userSelectedFromDate = new Date(start.fromDate);
								if (new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) <= new Date(userSelectedFromDate.getFullYear(), userSelectedFromDate.getMonth(), userSelectedFromDate.getDate())) {
									return date;
								}
							});

							const prices = filteredPrices[0]?.ages[0]?.prices ?? [];

							// Only create tariffs if the product has prices
							const hasPrices = Object.keys(prices).length > 0 && prices.length > 0;

							const tariffs = hasPrices
								? elementsRes.map(element => ({
										...element,
										grades: gradesRes.map(grade => ({
											gradeId: grade.gradeId,
											title: grade.title,
											code: grade.code,
											defaultCode: grade.defaultCode,
											sell: prices.find(p => p.elementId === element.elementId && p.gradeId === grade.gradeId)?.sell ?? 0,
										})),
									}))
								: [];

							return { ...p, tariffs };
						}
						catch (err) {
							console.warn(`Error fetching tariffs for product ${p.productId}:`, err);
							return p;
						}
					}),
				);

				// Fetch images ONLY for products that have tariffs
				const productsWithImages = await Promise.all(
					productsWithTariffs.filter(p => p.tariffs.length > 0).map(async (p) => {
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
							console.warn(`Error fetching images for product ${p.productId}:`, err);
							return p;
						}
					}),
				);

				// Merge all data
				const productsWithTariffsMap = new Map(productsWithTariffs.map(p => [p.productId, p]));
				const productsWithImagesMap = new Map(productsWithImages.map(p => [p.productId, p]));

				this.products = products.map((p) => {
					const withTariffs = productsWithTariffsMap.get(p.productId);
					const withImages = productsWithImagesMap.get(p.productId);
					return withImages ?? withTariffs ?? p;
				});

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
