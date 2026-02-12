export type AgeType = "ADL" | "CHD" | "INF";

export type Client = {
	title: string;
	firstName: string;
	lastName: string;
	age: "ADL";
	email: string;
};

export type Passenger = {
	passengerId: number;
	title: string;
	firstName: string;
	lastName: string;
	age: AgeType;
	dietaryRequirements?: string;
	editable: boolean;
};

export type Airport = {
	cityCode: string;
	name?: string;
	airportName: string;
	[k: string]: any;
};

export type Grade = {
	gradeId: number;
	title: string;
	code: number;
	defaultCode: number;
	sell: number;
};

export type Element = {
	elementId: number;
	title: string;
	minOccupancy: number;
	maxOccupancy: number;
	code: number;
	defaultCode: number;
	sell: number;
	grades: Grade[];
};

export type Tariff = Element;
export type Room = Element;

export type CompleteHotel = {
	productId: number;
	title: string;
	rooms: Tariff[];
};

export type RoomStateItem = {
	productId: number;
	elementId: number;
	gradeId: number;
	sell: number;
	passengerIds: number[];
};

export type AddPassengerToRoomPayload = {
	productId: number;
	elementId: number;
	gradeId: number;
	sell: number;
	passengerId: number;
};

export type RemovePassengerFromRoomPayload = {
	productId: number;
	elementId: number;
	passengerId: number;
};

export type SetHotelGradePayload = {
	productId: number;
	elementId: number;
	gradeId: number;
	sell: number;
};

export type ProductHotel = {
	productId: number;
	title: string;
	tariffs: Tariff[];
};

export type FormattedProduct = {
	productId: number;
	elementId: number;
	gradeId: number;
	sell: number;
	passengerIds: number[];
	fromDate: string;
	toDate: string;
};

export type Title = { name: string; [k: string]: any };

export type County = { areaId: number; name: string; [k: string]: any };

export type Currency = { currencyCode: string; [k: string]: any };

export type ProductImage = { imageId: number | string; url: string | null; caption?: string };

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
	priceBase: string;

	rank?: number;
};

export type Day = {
	number: number;
	date: string;
	excursionId: number;
	entertainmentId: number;
	entertainmentTime: string;
	hotelId: number;
};

export type Pricing = {
	totalPriceFormatted: string;
	amountToPayFormatted: string;
	amountToPay: number;
	totalPrice: number;
};

export type AddProductPayload = {
	dayNo: number;
	productId: number;
	productType?: string;
	productTime?: string;
};

export type RequireTransfers = "yes" | "no" | "none";

export type TransferProduct = {
	productId: number;
	fromCity: string;
	toCity: string;
	fromCityCode: string;
	toCityCode: string;
	fromPoint: string;
	toPoint: string;
	[k: string]: any;
};
