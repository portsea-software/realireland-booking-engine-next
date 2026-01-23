import type { CompleteHotel, ProductHotel, RoomStateItem, AddPassengerToRoomPayload, RemovePassengerFromRoomPayload, SetHotelGradePayload } from "~~/shared/types";

export const useRoomingStore = defineStore("rooming", {
	state: () => ({
		rooms: [] as RoomStateItem[],
	}),

	getters: {
		getPassengersToRoom(): number {
			const passengers = usePassengersStore();
			return passengers.getPassengersToRoom;
		},

		getSelectedHotels(): ProductHotel[] {
			const dayByDay = useDayByDayStore();
			return (dayByDay.getSelectedHotels ?? []) as ProductHotel[];
		},

		getEveryoneHasARoom(state): boolean {
			if (!state.rooms || state.rooms.length === 0) return false;

			const totalPassengers = this.getPassengersToRoom;
			const hotels = this.getSelectedHotels;

			for (let i = 0; i < hotels.length; i++) {
				const hotelRooms = state.rooms.filter(r => r.productId === hotels[i]?.productId);

				// no rooms for a particular hotel
				if (!hotelRooms || hotelRooms.length === 0) return false;

				// total passengers allocated in this hotel's rooms
				const passengersInHotel = hotelRooms
					.flatMap(r => r.passengerIds)
					.length;

				if (passengersInHotel !== totalPassengers) return false;
			}

			return true;
		},

		getAssignedPassengerIds: (state) => {
			return (productId: number) =>
				state.rooms
					.filter(room => room.productId === productId)
					.flatMap(room => room.passengerIds);
		},

		getRoomById: (state) => {
			return (productId: number, elementId: number) =>
				state.rooms.find(room => room.productId === productId && room.elementId === elementId);
		},

		getHotelRoomTypes(): CompleteHotel[] {
			const hotels = this.getSelectedHotels;
			const mappedHotels = hotels.map((hotel) => {
				return {
					productId: hotel.productId,
					title: hotel.title,
					rooms: hotel.tariffs,
				};
			});
			return mappedHotels;
		},
	},

	actions: {
		addPassengerToRoom(payload: AddPassengerToRoomPayload) {
			const roomIndex = this.rooms.findIndex(
				room => room.productId === payload.productId && room.elementId === payload.elementId,
			);

			if (roomIndex !== -1) {
				const room = this.rooms[roomIndex];
				if (room && !room.passengerIds.includes(payload.passengerId)) {
					room.passengerIds.push(payload.passengerId);
					this.rooms.splice(roomIndex, 1, room);
				}
			}
			else {
				this.rooms.push({
					productId: payload.productId,
					elementId: payload.elementId,
					gradeId: payload.gradeId,
					passengerIds: [payload.passengerId],
				});
			}
		},

		removePassengerFromRoom(payload: RemovePassengerFromRoomPayload) {
			const roomIndex = this.rooms.findIndex(
				room => room.productId === payload.productId && room.elementId === payload.elementId,
			);

			if (roomIndex !== -1) {
				const room = this.rooms[roomIndex];

				if (room) {
					room.passengerIds = room.passengerIds.filter(id => id !== payload.passengerId);

					if (room.passengerIds.length === 0) {
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
