export enum ClientType {
	None = "None",
	Individual = "Individual",
	Company = "Company",
	Agent = "Agent",
	Supplier = "Supplier",
}

export type BookingGroupClientId = {
	bookingId: number;
	groupId: number;
	clientId: number;
};

export type Booking = {
	bookingId: number;
	groupId: number;
	clientId: number;
	clientType: ClientType;
	clientEmail: string;
	bookingTitle: string;
	sellCurrency: string;
	exchangeRate: number;
	clientSell: number;
	agentSell: number;
	price: number;
	deposit: number;
	received: number;
	departureDate: string;
	returnDate: string;
	depositDueDate: string;
	balanceDueDate: string;
	depositPaid: boolean;
	depositDue: boolean;
	depositRemaining: number;
	balancePaid: boolean;
	balanceDue: boolean;
	balanceRemaining: number;
};
