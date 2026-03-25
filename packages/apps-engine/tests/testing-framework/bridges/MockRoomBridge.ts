import type { IMessage, IMessageRaw } from '../../../src/definition/messages';
import type { IRoom, IRoomRaw } from '../../../src/definition/rooms';
import type { IUser } from '../../../src/definition/users';
import { type GetMessagesOptions, type GetRoomsFilters, type GetRoomsOptions, RoomBridge } from '../../../src/server/bridges/RoomBridge';

export class MockRoomBridge extends RoomBridge {
	private rooms: Map<string, IRoom> = new Map();

	private roomMembers: Map<string, Array<IUser>> = new Map();

	public seedRoom(room: IRoom): void {
		this.rooms.set(room.id, room);
	}

	public seedRoomMembers(roomId: string, members: Array<IUser>): void {
		this.roomMembers.set(roomId, members);
	}

	public async doGetById(roomId: string, _appId: string): Promise<IRoom> {
		return this.rooms.get(roomId);
	}

	public async doGetByName(roomName: string, _appId: string): Promise<IRoom> {
		for (const room of this.rooms.values()) {
			if (room.slugifiedName === roomName || room.displayName === roomName) {
				return room;
			}
		}
		return undefined;
	}

	public async doCreate(room: IRoom, _members: Array<string>, _appId: string): Promise<string> {
		const id = room.id || `mock-room-${this.rooms.size + 1}`;
		this.rooms.set(id, { ...room, id });
		return id;
	}

	public async doGetMembers(roomId: string, _appId: string): Promise<Array<IUser>> {
		return this.roomMembers.get(roomId) || [];
	}

	protected async create(room: IRoom, _members: Array<string>, _appId: string): Promise<string> {
		const id = room.id || `mock-room-${this.rooms.size + 1}`;
		this.rooms.set(id, { ...room, id });
		return id;
	}

	protected async getById(roomId: string, _appId: string): Promise<IRoom> {
		return this.rooms.get(roomId);
	}

	protected async getByName(roomName: string, _appId: string): Promise<IRoom> {
		for (const room of this.rooms.values()) {
			if (room.slugifiedName === roomName || room.displayName === roomName) {
				return room;
			}
		}
		return undefined;
	}

	protected async getCreatorById(roomId: string, _appId: string): Promise<IUser | undefined> {
		return this.rooms.get(roomId)?.creator;
	}

	protected async getCreatorByName(roomName: string, _appId: string): Promise<IUser | undefined> {
		for (const room of this.rooms.values()) {
			if (room.slugifiedName === roomName || room.displayName === roomName) {
				return room.creator;
			}
		}
		return undefined;
	}

	protected async getDirectByUsernames(_usernames: Array<string>, _appId: string): Promise<IRoom | undefined> {
		return undefined;
	}

	protected async getMembers(roomId: string, _appId: string): Promise<Array<IUser>> {
		return this.roomMembers.get(roomId) || [];
	}

	protected async getAllRooms(_filters: GetRoomsFilters, _options: GetRoomsOptions, _appId: string): Promise<Array<IRoomRaw>> {
		return Array.from(this.rooms.values()) as unknown as Array<IRoomRaw>;
	}

	protected async update(room: IRoom, _members: Array<string>, _appId: string): Promise<void> {
		this.rooms.set(room.id, room);
	}

	protected async createDiscussion(
		room: IRoom,
		_parentMessage: IMessage | undefined,
		_reply: string | undefined,
		_members: Array<string>,
		_appId: string,
	): Promise<string> {
		const id = room.id || `mock-discussion-${this.rooms.size + 1}`;
		this.rooms.set(id, { ...room, id });
		return id;
	}

	protected async delete(roomId: string, _appId: string): Promise<void> {
		this.rooms.delete(roomId);
	}

	protected async getModerators(_roomId: string, _appId: string): Promise<Array<IUser>> {
		return [];
	}

	protected async getOwners(_roomId: string, _appId: string): Promise<Array<IUser>> {
		return [];
	}

	protected async getLeaders(_roomId: string, _appId: string): Promise<Array<IUser>> {
		return [];
	}

	protected async getMessages(_roomId: string, _options: GetMessagesOptions, _appId: string): Promise<IMessageRaw[]> {
		return [];
	}

	protected async removeUsers(_roomId: string, _usernames: Array<string>, _appId: string): Promise<void> {}

	protected async getUnreadByUser(_roomId: string, _uid: string, _options: GetMessagesOptions, _appId: string): Promise<IMessageRaw[]> {
		return [];
	}

	protected async getUserUnreadMessageCount(_roomId: string, _uid: string, _appId: string): Promise<number> {
		return 0;
	}

	public getRooms(): Map<string, IRoom> {
		return new Map(this.rooms);
	}

	public clear(): void {
		this.rooms.clear();
		this.roomMembers.clear();
	}
}
