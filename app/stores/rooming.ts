type RoomStateItem = {
	productId: number;
	elementId: number;
	gradeId: number;
	passengersInRoom: number[];
};

type AddHotelRoomPayload = {
	productId: number;
	elementId: number;
	gradeId: number;
	numberOfPassengers: number;
};

type RemoveHotelRoomPayload = {
	productId: number;
	elementId: number;
};

type SetHotelGradePayload = {
	productId: number;
	elementId: number;
	gradeId: number;
};

type Tariff = {
	elementId: number;
	element: string;
	gradeId: number;
	grade: string;
	minOccupancy: number;
	maxOccupancy: number;
};

type Hotel = {
	productId: number;
	title: string;
	tariffs: Tariff[];
};

export const useRoomingStore = defineStore("rooming", {
	state: () => ({
		rooms: [] as RoomStateItem[],
	}),

	getters: {
		getPassengersToRoom(): number {
			const passengers = usePassengersStore();
			return passengers.getPassengersToRoom;
		},

		getSelectedHotels(): Hotel[] {
			const dayByDay = useDayByDayStore();
			return (dayByDay.getSelectedHotels ?? []) as Hotel[];
		},

		getEveryoneHasARoom(state): boolean {
			if (!state.rooms || state.rooms.length === 0) return false;

			const totalPassengers = this.getPassengersToRoom;
			const hotels = this.getSelectedHotels;
			const sumReducer = (acc: number, cur: number) => acc + cur;

			for (let i = 0; i < hotels.length; i++) {
				const hotelRooms = state.rooms.filter(r => r.productId === hotels[i]?.productId);

				// no rooms for a particular hotel
				if (!hotelRooms || hotelRooms.length === 0) return false;

				// total passengers allocated in this hotel's rooms
				const passengersInHotel = hotelRooms
					.flatMap(r => r.passengersInRoom)
					.reduce(sumReducer, 0);

				if (passengersInHotel !== totalPassengers) return false;
			}

			return true;
		},

		getRoomById: (state) => {
			return (productId: number, elementId: number) =>
				state.rooms.find(room => room.productId === productId && room.elementId === elementId);
		},

		getHotelRoomTypes(): Array<{
			productId: number;
			title: string;
			rooms: Array<{
				elementId: number;
				element: string;
				grades: Array<{ gradeId: number; grade: string }>;
				min: number;
				max: number;
			}>;
		}> {
			const hotels = this.getSelectedHotels;
			const hotelRoomTypes: any[] = [];

			hotels.forEach((hotel) => {
				const hotelRooms = {
					productId: hotel.productId,
					title: hotel.title,
					rooms: [] as any[],
				};

				hotel.tariffs.forEach((tariff) => {
					const room = hotelRooms.rooms.find((r: any) => r.elementId === tariff.elementId);

					if (!room) {
						hotelRooms.rooms.push({
							elementId: tariff.elementId,
							element: tariff.element,
							grades: [{ gradeId: tariff.gradeId, grade: tariff.grade }],
							min: tariff.minOccupancy,
							max: tariff.maxOccupancy,
						});
					}
					else {
						room.grades.push({ gradeId: tariff.gradeId, grade: tariff.grade });
					}
				});

				hotelRoomTypes.push(hotelRooms);
			});

			return hotelRoomTypes;
		},
	},

	actions: {
		addHotelRoom(payload: AddHotelRoomPayload) {
			const roomIndex = this.rooms.findIndex(
				room => room.productId === payload.productId && room.elementId === payload.elementId,
			);

			if (roomIndex !== -1) {
				const room = this.rooms[roomIndex];
				if (room) {
					room.passengersInRoom.push(payload.numberOfPassengers);
					this.rooms.splice(roomIndex, 1, room);
				}
			}
			else {
				this.rooms.push({
					productId: payload.productId,
					elementId: payload.elementId,
					gradeId: payload.gradeId,
					passengersInRoom: [payload.numberOfPassengers],
				});
			}
		},

		removeHotelRoom(payload: RemoveHotelRoomPayload) {
			const roomIndex = this.rooms.findIndex(
				room => room.productId === payload.productId && room.elementId === payload.elementId,
			);

			if (roomIndex !== -1) {
				const room = this.rooms[roomIndex];

				if (room) {
					room.passengersInRoom.pop();

					if (room.passengersInRoom.length === 0) {
						this.rooms.splice(roomIndex, 1);
					}
					else {
						this.rooms.splice(roomIndex, 1, room);
					}
				}
			}
		},

		setHotelGrade(payload: SetHotelGradePayload) {
			const room = this.rooms.find(
				r => r.productId === payload.productId && r.elementId === payload.elementId,
			);

			if (!room) return;

			room.gradeId = payload.gradeId;
			const index = this.rooms.findIndex(
				r => r.productId === payload.productId && r.elementId === payload.elementId,
			);
			if (index !== -1) this.rooms.splice(index, 1, room);
		},

		trimRooms(productId: number) {
			const unusedRooms = this.rooms.filter(room => room.productId === productId);
			unusedRooms.forEach((room) => {
				this.clearHotelRoom({ productId: room.productId, elementId: room.elementId });
			});
		},

		clearHotelRoom(payload: { productId: number; elementId: number }) {
			const roomIndex = this.rooms.findIndex(
				room => room.productId === payload.productId && room.elementId === payload.elementId,
			);
			if (roomIndex !== -1) this.rooms.splice(roomIndex, 1);
		},

		resetRooms() {
			this.rooms = [];
		},
	},
});
