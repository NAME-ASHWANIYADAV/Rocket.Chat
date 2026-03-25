import type { AppStatus } from '../../../src/definition/AppStatus';
import type { ProxiedApp } from '../../../src/server/ProxiedApp';
import { AppActivationBridge } from '../../../src/server/bridges/AppActivationBridge';

export class MockAppActivationBridge extends AppActivationBridge {
	private statusChanges: Array<{ appId: string; status: AppStatus }> = [];

	protected async appAdded(_app: ProxiedApp): Promise<void> {}

	protected async appUpdated(_app: ProxiedApp): Promise<void> {}

	protected async appRemoved(_app: ProxiedApp): Promise<void> {}

	protected async appStatusChanged(app: ProxiedApp, status: AppStatus): Promise<void> {
		this.statusChanges.push({ appId: app.getID(), status });
	}

	protected async actionsChanged(): Promise<void> {}

	public getStatusChanges(): Array<{ appId: string; status: AppStatus }> {
		return [...this.statusChanges];
	}

	public clear(): void {
		this.statusChanges = [];
	}
}
