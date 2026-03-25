import { MockAppActivationBridge } from './MockAppActivationBridge';
import { MockCommandBridge } from './MockCommandBridge';
import { MockListenerBridge } from './MockListenerBridge';
import { MockMessageBridge } from './MockMessageBridge';
import { MockPersistenceBridge } from './MockPersistenceBridge';
import { MockRoomBridge } from './MockRoomBridge';
import { AppBridges } from '../../../src/server/bridges';
import type { ApiBridge } from '../../../src/server/bridges/ApiBridge';
import type { AppDetailChangesBridge } from '../../../src/server/bridges/AppDetailChangesBridge';
import type { CloudWorkspaceBridge } from '../../../src/server/bridges/CloudWorkspaceBridge';
import type { ContactBridge } from '../../../src/server/bridges/ContactBridge';
import type { EnvironmentalVariableBridge } from '../../../src/server/bridges/EnvironmentalVariableBridge';
import type { ExperimentalBridge } from '../../../src/server/bridges/ExperimentalBridge';
import type { HttpBridge } from '../../../src/server/bridges/HttpBridge';
import type { IInternalBridge } from '../../../src/server/bridges/IInternalBridge';
import type { IInternalFederationBridge } from '../../../src/server/bridges/IInternalFederationBridge';
import type { LivechatBridge } from '../../../src/server/bridges/LivechatBridge';
import type { ModerationBridge } from '../../../src/server/bridges/ModerationBridge';
import type { OAuthAppsBridge } from '../../../src/server/bridges/OAuthAppsBridge';
import type { OutboundMessageBridge } from '../../../src/server/bridges/OutboundMessagesBridge';
import type { RoleBridge } from '../../../src/server/bridges/RoleBridge';
import type { SchedulerBridge } from '../../../src/server/bridges/SchedulerBridge';
import type { ServerSettingBridge } from '../../../src/server/bridges/ServerSettingBridge';
import type { ThreadBridge } from '../../../src/server/bridges/ThreadBridge';
import type { UiInteractionBridge } from '../../../src/server/bridges/UiInteractionBridge';
import type { UploadBridge } from '../../../src/server/bridges/UploadBridge';
import type { UserBridge } from '../../../src/server/bridges/UserBridge';
import type { VideoConferenceBridge } from '../../../src/server/bridges/VideoConferenceBridge';
import { TestOAuthAppsBridge } from '../../test-data/bridges/OAuthAppsBridge';
import { TestsApiBridge } from '../../test-data/bridges/apiBridge';
import { TestsAppDetailChangesBridge } from '../../test-data/bridges/appDetailChanges';
import { TestAppCloudWorkspaceBridge } from '../../test-data/bridges/cloudBridge';
import { TestContactBridge } from '../../test-data/bridges/contactBridge';
import { TestsEmailBridge } from '../../test-data/bridges/emailBridge';
import { TestsEnvironmentalVariableBridge } from '../../test-data/bridges/environmentalVariableBridge';
import { TestExperimentalBridge } from '../../test-data/bridges/experimentalBridge';
import { TestsHttpBridge } from '../../test-data/bridges/httpBridge';
import { TestsInternalBridge } from '../../test-data/bridges/internalBridge';
import { TestsInternalFederationBridge } from '../../test-data/bridges/internalFederationBridge';
import { TestLivechatBridge } from '../../test-data/bridges/livechatBridge';
import { TestsModerationBridge } from '../../test-data/bridges/moderationBridge';
import { TestOutboundCommunicationBridge } from '../../test-data/bridges/outboundComms';
import { TestsRoleBridge } from '../../test-data/bridges/roleBridge';
import { TestSchedulerBridge } from '../../test-data/bridges/schedulerBridge';
import { TestsServerSettingBridge } from '../../test-data/bridges/serverSettingBridge';
import { TestsThreadBridge } from '../../test-data/bridges/threadBridge';
import { TestsUiIntegrationBridge } from '../../test-data/bridges/uiIntegrationBridge';
import { TestUploadBridge } from '../../test-data/bridges/uploadBridge';
import { TestsUserBridge } from '../../test-data/bridges/userBridge';
import { TestsVideoConferenceBridge } from '../../test-data/bridges/videoConferenceBridge';
import type { InMemoryPersistenceStore } from '../storage/InMemoryPersistenceStore';

export class MockAppBridges extends AppBridges {
	private readonly mockCommandBridge: MockCommandBridge;

	private readonly mockMessageBridge: MockMessageBridge;

	private readonly mockPersistenceBridge: MockPersistenceBridge;

	private readonly mockRoomBridge: MockRoomBridge;

	private readonly mockActivationBridge: MockAppActivationBridge;

	private readonly mockListenerBridge: MockListenerBridge;

	private readonly apiBridge: TestsApiBridge;

	private readonly appDetailsBridge: TestsAppDetailChangesBridge;

	private readonly envBridge: TestsEnvironmentalVariableBridge;

	private readonly httpBridge: TestsHttpBridge;

	private readonly setsBridge: TestsServerSettingBridge;

	private readonly internalBridge: TestsInternalBridge;

	private readonly internalFederationBridge: TestsInternalFederationBridge;

	private readonly userBridge: TestsUserBridge;

	private readonly livechatBridge: TestLivechatBridge;

	private readonly uploadBridge: TestUploadBridge;

	private readonly emailBridge: TestsEmailBridge;

	private readonly contactBridge: TestContactBridge;

	private readonly uiInteractionBridge: TestsUiIntegrationBridge;

	private readonly schedulerBridge: TestSchedulerBridge;

	private readonly cloudBridge: TestAppCloudWorkspaceBridge;

	private readonly videoConfBridge: TestsVideoConferenceBridge;

	private readonly oauthBridge: TestOAuthAppsBridge;

	private readonly moderationBridge: TestsModerationBridge;

	private readonly roleBridge: TestsRoleBridge;

	private readonly threadBridge: TestsThreadBridge;

	private readonly outboundBridge: TestOutboundCommunicationBridge;

	private readonly experimentalBridge: TestExperimentalBridge;

	constructor(store: InMemoryPersistenceStore) {
		super();

		this.mockCommandBridge = new MockCommandBridge();
		this.mockMessageBridge = new MockMessageBridge();
		this.mockPersistenceBridge = new MockPersistenceBridge(store);
		this.mockRoomBridge = new MockRoomBridge();
		this.mockActivationBridge = new MockAppActivationBridge();
		this.mockListenerBridge = new MockListenerBridge();

		this.apiBridge = new TestsApiBridge();
		this.appDetailsBridge = new TestsAppDetailChangesBridge();
		this.envBridge = new TestsEnvironmentalVariableBridge();
		this.httpBridge = new TestsHttpBridge();
		this.setsBridge = new TestsServerSettingBridge();
		this.internalBridge = new TestsInternalBridge();
		this.internalFederationBridge = new TestsInternalFederationBridge();
		this.userBridge = new TestsUserBridge();
		this.livechatBridge = new TestLivechatBridge();
		this.uploadBridge = new TestUploadBridge();
		this.emailBridge = new TestsEmailBridge();
		this.contactBridge = new TestContactBridge();
		this.uiInteractionBridge = new TestsUiIntegrationBridge();
		this.schedulerBridge = new TestSchedulerBridge();
		this.cloudBridge = new TestAppCloudWorkspaceBridge();
		this.videoConfBridge = new TestsVideoConferenceBridge();
		this.oauthBridge = new TestOAuthAppsBridge();
		this.moderationBridge = new TestsModerationBridge();
		this.roleBridge = new TestsRoleBridge();
		this.threadBridge = new TestsThreadBridge();
		this.outboundBridge = new TestOutboundCommunicationBridge();
		this.experimentalBridge = new TestExperimentalBridge();
	}

	public getCommandBridge(): MockCommandBridge {
		return this.mockCommandBridge;
	}

	public getMessageBridge(): MockMessageBridge {
		return this.mockMessageBridge;
	}

	public getPersistenceBridge(): MockPersistenceBridge {
		return this.mockPersistenceBridge;
	}

	public getAppActivationBridge(): MockAppActivationBridge {
		return this.mockActivationBridge;
	}

	public getRoomBridge(): MockRoomBridge {
		return this.mockRoomBridge;
	}

	public getListenerBridge(): MockListenerBridge {
		return this.mockListenerBridge;
	}

	public getApiBridge(): ApiBridge {
		return this.apiBridge;
	}

	public getAppDetailChangesBridge(): AppDetailChangesBridge {
		return this.appDetailsBridge;
	}

	public getEnvironmentalVariableBridge(): EnvironmentalVariableBridge {
		return this.envBridge;
	}

	public getHttpBridge(): HttpBridge {
		return this.httpBridge;
	}

	public getServerSettingBridge(): ServerSettingBridge {
		return this.setsBridge;
	}

	public getInternalBridge(): IInternalBridge {
		return this.internalBridge;
	}

	public getInternalFederationBridge(): IInternalFederationBridge {
		return this.internalFederationBridge;
	}

	public getUserBridge(): UserBridge {
		return this.userBridge;
	}

	public getLivechatBridge(): LivechatBridge {
		return this.livechatBridge;
	}

	public getUploadBridge(): UploadBridge {
		return this.uploadBridge;
	}

	public getEmailBridge(): TestsEmailBridge {
		return this.emailBridge;
	}

	public getContactBridge(): ContactBridge {
		return this.contactBridge;
	}

	public getUiInteractionBridge(): UiInteractionBridge {
		return this.uiInteractionBridge;
	}

	public getSchedulerBridge(): SchedulerBridge {
		return this.schedulerBridge;
	}

	public getCloudWorkspaceBridge(): CloudWorkspaceBridge {
		return this.cloudBridge;
	}

	public getVideoConferenceBridge(): VideoConferenceBridge {
		return this.videoConfBridge;
	}

	public getOAuthAppsBridge(): OAuthAppsBridge {
		return this.oauthBridge;
	}

	public getModerationBridge(): ModerationBridge {
		return this.moderationBridge;
	}

	public getThreadBridge(): ThreadBridge {
		return this.threadBridge;
	}

	public getRoleBridge(): RoleBridge {
		return this.roleBridge;
	}

	public getOutboundMessageBridge(): OutboundMessageBridge {
		return this.outboundBridge;
	}

	public getExperimentalBridge(): ExperimentalBridge {
		return this.experimentalBridge;
	}
}
