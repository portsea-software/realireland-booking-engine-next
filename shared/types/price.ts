export type Price = {
	productId: number;
	elementId: number;
	gradeId: number;
	priceId: number;
	contractId: number;
	ageRuleId: number;
	priceRuleId: number;
	elementCode: string;
	elementTitle: string;
	days: number;
	nights: number;
	minOccupancy: number;
	maxOccupancy: number;
	gradeCode: string;
	gradeTitle: string;
	fromDate: string | Date;
	toDate: string | Date;
	markupRule: string;
	buyExchangeRate: number;
	sellExchangeRate: number;
	grossBuy: number;
	netBuy: number;
	sellNative: number;
	sell: number;
	sell2Native: number;
	sell2: number;
	sell3Native: number;
	sell3: number;
};

export type Age = {
	minAge: number;
	maxAge: number;
	minPassengers: number;
	maxPassengers: number;
	ageGroup: string;
	buyCurrencyCode: string;
	buyExchangeRate: number;
	roundingMode: string;
	priceBase: string;
	prices?: Price[];
};
export type PriceDate = {
	fromDate: string;
	toDate: string;
	ages: Age[];
};
export type ProductPrice = {
	productId: number;
	contractId: number;
	supplierId: number;
	providerId: number;
	dates: PriceDate[];
};
