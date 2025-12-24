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
