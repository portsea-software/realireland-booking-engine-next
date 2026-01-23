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
	dietaryRequirements: string;
	editable: boolean;
};

// export type RoomGrade = { gradeId: number; grade?: string };

// export type RoomType = {
// 	elementId: number;
// 	element: string;
// 	grades: RoomGrade[];
// 	min: number;
// 	max: number;
// };

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
};

export type Element = {
	elementId: number;
	title: string;
	minOccupancy: number;
	maxOccupancy: number;
	code: number;
	defaultCode: number;
	grades: Grade[];
};

export type Tariff = Element;
export type Room = Element;

export type CompleteHotel = {
	productId: number;
	title: string;
	rooms: Tariff[];
};
