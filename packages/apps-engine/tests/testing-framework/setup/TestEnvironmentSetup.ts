import type { IHttp, IModify, IPersistence, IRead } from '../../../src/definition/accessors';
import type { IMessage } from '../../../src/definition/messages';
import type { IRoom } from '../../../src/definition/rooms';
import type { ISlashCommand } from '../../../src/definition/slashcommands';
import {
	Persistence,
	PersistenceRead,
	Reader,
	Modify,
	Http,
	HttpExtend,
	Notifier,
	MessageRead,
	RoomRead,
	UserRead,
	LivechatRead,
	UploadRead,
	VideoConferenceRead,
	OAuthAppsReader,
	RoleRead,
	EnvironmentRead,
	EnvironmentalVariableRead,
	ServerSettingRead,
} from '../../../src/server/accessors';
import { CloudWorkspaceRead } from '../../../src/server/accessors/CloudWorkspaceRead';
import { ContactRead } from '../../../src/server/accessors/ContactRead';
import { ExperimentalRead } from '../../../src/server/accessors/ExperimentalRead';
import { ThreadRead } from '../../../src/server/accessors/ThreadRead';
import { MockAppBridges } from '../bridges/MockAppBridges';
import type { MockCommandBridge } from '../bridges/MockCommandBridge';
import type { MockMessageBridge } from '../bridges/MockMessageBridge';
import type { MockRoomBridge } from '../bridges/MockRoomBridge';
import { InMemoryPersistenceStore } from '../storage/InMemoryPersistenceStore';

export class TestEnvironmentSetup {
	private readonly store: InMemoryPersistenceStore;

	private readonly bridges: MockAppBridges;

	constructor() {
		this.store = new InMemoryPersistenceStore();
		this.bridges = new MockAppBridges(this.store);
	}

	public getRegisteredSlashCommands(): ISlashCommand[] {
		const cmdBridge = this.bridges.getCommandBridge() as MockCommandBridge;
		return Array.from(cmdBridge.getRegisteredCommands().values());
	}

	public getSlashCommand(command: string): ISlashCommand | undefined {
		const cmdBridge = this.bridges.getCommandBridge() as MockCommandBridge;
		return cmdBridge.getRegisteredCommands().get(command);
	}

	public getAccessors(appId: string): {
		reader: IRead;
		modifier: IModify;
		persistence: IPersistence;
		http: IHttp;
	} {
		const msgRead = new MessageRead(this.bridges.getMessageBridge(), appId);
		const persistRead = new PersistenceRead(this.bridges.getPersistenceBridge(), appId);
		const roomRead = new RoomRead(this.bridges.getRoomBridge(), appId);
		const userRead = new UserRead(this.bridges.getUserBridge(), appId);
		const notifier = new Notifier(this.bridges.getUserBridge(), this.bridges.getMessageBridge(), appId);
		const livechatRead = new LivechatRead(this.bridges.getLivechatBridge(), appId);
		const uploadRead = new UploadRead(this.bridges.getUploadBridge(), appId);
		const cloudRead = new CloudWorkspaceRead(this.bridges.getCloudWorkspaceBridge(), appId);
		const videoConfRead = new VideoConferenceRead(this.bridges.getVideoConferenceBridge(), appId);
		const oauthRead = new OAuthAppsReader(this.bridges.getOAuthAppsBridge(), appId);
		const contactRead = new ContactRead(this.bridges, appId);
		const threadRead = new ThreadRead(this.bridges.getThreadBridge(), appId);
		const roleRead = new RoleRead(this.bridges.getRoleBridge(), appId);
		const experimentalRead = new ExperimentalRead(this.bridges.getExperimentalBridge(), appId);

		const settingRead = new ServerSettingRead(this.bridges.getServerSettingBridge(), appId);
		const envVarRead = new EnvironmentalVariableRead(this.bridges.getEnvironmentalVariableBridge(), appId);
		const envRead = new EnvironmentRead(undefined as any, settingRead, envVarRead);

		const reader = new Reader(
			envRead,
			msgRead,
			persistRead,
			roomRead,
			userRead,
			notifier,
			livechatRead,
			uploadRead,
			cloudRead,
			videoConfRead,
			contactRead,
			oauthRead,
			threadRead,
			roleRead,
			experimentalRead,
		);

		const modifier = new Modify(this.bridges, appId);
		const persistence = new Persistence(this.bridges.getPersistenceBridge(), appId);
		const httpExtend = new HttpExtend();
		const http = new Http(undefined as any, this.bridges, httpExtend, appId);

		return { reader, modifier, persistence, http };
	}

	public getCreatedMessages(): IMessage[] {
		const msgBridge = this.bridges.getMessageBridge() as MockMessageBridge;
		return msgBridge.getMessages();
	}

	public seedRoom(room: IRoom): void {
		const roomBridge = this.bridges.getRoomBridge() as MockRoomBridge;
		roomBridge.seedRoom(room);
	}

	public getBridges(): MockAppBridges {
		return this.bridges;
	}

	public getStore(): InMemoryPersistenceStore {
		return this.store;
	}

	public reset(): void {
		this.store.clear();
		(this.bridges.getCommandBridge() as MockCommandBridge).clear();
		(this.bridges.getMessageBridge() as MockMessageBridge).clear();
		(this.bridges.getRoomBridge() as MockRoomBridge).clear();
	}
}
