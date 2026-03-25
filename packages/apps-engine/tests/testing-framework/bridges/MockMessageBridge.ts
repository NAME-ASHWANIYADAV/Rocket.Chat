import type { IMessage, Reaction } from '../../../src/definition/messages';
import type { IRoom } from '../../../src/definition/rooms';
import type { IUser } from '../../../src/definition/users';
import { type ITypingDescriptor, MessageBridge } from '../../../src/server/bridges/MessageBridge';

export class MockMessageBridge extends MessageBridge {
	private messages: Array<IMessage> = [];

	private updatedMessages: Array<IMessage> = [];

	private deletedMessages: Array<IMessage> = [];

	private userNotifications: Array<{ user: IUser; message: IMessage }> = [];

	private roomNotifications: Array<{ room: IRoom; message: IMessage }> = [];

	private idCounter = 0;

	public async doCreate(message: IMessage, appId: string): Promise<string> {
		return this.create(message, appId);
	}

	public async doUpdate(message: IMessage, appId: string): Promise<void> {
		return this.update(message, appId);
	}

	public async doNotifyUser(user: IUser, message: IMessage, appId: string): Promise<void> {
		return this.notifyUser(user, message, appId);
	}

	public async doNotifyRoom(room: IRoom, message: IMessage, appId: string): Promise<void> {
		return this.notifyRoom(room, message, appId);
	}

	public async doGetById(messageId: string, appId: string): Promise<IMessage> {
		return this.getById(messageId, appId);
	}

	public async doDelete(message: IMessage, user: IUser, appId: string): Promise<void> {
		return this.delete(message, user, appId);
	}

	protected async create(message: IMessage, _appId: string): Promise<string> {
		const id = `mock-msg-${++this.idCounter}`;
		this.messages.push({ ...message, id });
		return id;
	}

	protected async update(message: IMessage, _appId: string): Promise<void> {
		this.updatedMessages.push(message);
		const idx = this.messages.findIndex((m) => m.id === message.id);
		if (idx !== -1) {
			this.messages[idx] = message;
		}
	}

	protected async notifyUser(user: IUser, message: IMessage, _appId: string): Promise<void> {
		this.userNotifications.push({ user, message });
	}

	protected async notifyRoom(room: IRoom, message: IMessage, _appId: string): Promise<void> {
		this.roomNotifications.push({ room, message });
	}

	protected async typing(_options: ITypingDescriptor, _appId: string): Promise<void> {}

	protected async getById(messageId: string, _appId: string): Promise<IMessage> {
		return this.messages.find((m) => m.id === messageId);
	}

	protected async delete(message: IMessage, _user: IUser, _appId: string): Promise<void> {
		this.deletedMessages.push(message);
		const idx = this.messages.findIndex((m) => m.id === message.id);
		if (idx !== -1) {
			this.messages.splice(idx, 1);
		}
	}

	protected async addReaction(_messageId: string, _userId: string, _reaction: Reaction): Promise<void> {}

	protected async removeReaction(_messageId: string, _userId: string, _reaction: Reaction): Promise<void> {}

	public getMessages(): Array<IMessage> {
		return [...this.messages];
	}

	public getUpdatedMessages(): Array<IMessage> {
		return [...this.updatedMessages];
	}

	public getDeletedMessages(): Array<IMessage> {
		return [...this.deletedMessages];
	}

	public getUserNotifications(): Array<{ user: IUser; message: IMessage }> {
		return [...this.userNotifications];
	}

	public getRoomNotifications(): Array<{ room: IRoom; message: IMessage }> {
		return [...this.roomNotifications];
	}

	public clear(): void {
		this.messages = [];
		this.updatedMessages = [];
		this.deletedMessages = [];
		this.userNotifications = [];
		this.roomNotifications = [];
		this.idCounter = 0;
	}
}
