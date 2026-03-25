import type { RocketChatAssociationRecord } from '../../../src/definition/metadata';
import { PersistenceBridge } from '../../../src/server/bridges/PersistenceBridge';
import type { InMemoryPersistenceStore } from '../storage/InMemoryPersistenceStore';

export class MockPersistenceBridge extends PersistenceBridge {
	private store: InMemoryPersistenceStore;

	constructor(store: InMemoryPersistenceStore) {
		super();
		this.store = store;
	}

	private mapAssociations(associations: Array<RocketChatAssociationRecord>) {
		return associations.map((a) => ({ model: a.getModel(), id: a.getID() }));
	}

	public async doPurge(appId: string): Promise<void> {
		this.store.purge(appId);
	}

	public async doCreate(data: object, appId: string): Promise<string> {
		return this.store.create(data, appId);
	}

	public async doCreateWithAssociations(data: object, associations: Array<RocketChatAssociationRecord>, appId: string): Promise<string> {
		return this.store.create(data, appId, this.mapAssociations(associations));
	}

	public async doReadById(id: string, appId: string): Promise<object> {
		return this.store.readById(id, appId);
	}

	public async doReadByAssociations(associations: Array<RocketChatAssociationRecord>, appId: string): Promise<Array<object>> {
		return this.store.readByAssociations(this.mapAssociations(associations), appId);
	}

	public async doRemove(id: string, appId: string): Promise<object | undefined> {
		return this.store.remove(id, appId);
	}

	public async doRemoveByAssociations(associations: Array<RocketChatAssociationRecord>, appId: string): Promise<Array<object> | undefined> {
		return this.store.removeByAssociations(this.mapAssociations(associations), appId);
	}

	public async doUpdate(id: string, data: object, upsert: boolean, appId: string): Promise<string> {
		return this.store.update(id, data, upsert, appId);
	}

	public async doUpdateByAssociations(
		associations: Array<RocketChatAssociationRecord>,
		data: object,
		upsert: boolean,
		appId: string,
	): Promise<string> {
		return this.store.updateByAssociations(this.mapAssociations(associations), data, upsert, appId);
	}

	protected async purge(appId: string): Promise<void> {
		this.store.purge(appId);
	}

	protected async create(data: object, appId: string): Promise<string> {
		return this.store.create(data, appId);
	}

	protected async createWithAssociations(data: object, associations: Array<RocketChatAssociationRecord>, appId: string): Promise<string> {
		return this.store.create(data, appId, this.mapAssociations(associations));
	}

	protected async readById(id: string, appId: string): Promise<object> {
		return this.store.readById(id, appId);
	}

	protected async readByAssociations(associations: Array<RocketChatAssociationRecord>, appId: string): Promise<Array<object>> {
		return this.store.readByAssociations(this.mapAssociations(associations), appId);
	}

	protected async remove(id: string, appId: string): Promise<object | undefined> {
		return this.store.remove(id, appId);
	}

	protected async removeByAssociations(associations: Array<RocketChatAssociationRecord>, appId: string): Promise<Array<object>> {
		return this.store.removeByAssociations(this.mapAssociations(associations), appId);
	}

	protected async update(id: string, data: object, upsert: boolean, appId: string): Promise<string> {
		return this.store.update(id, data, upsert, appId);
	}

	protected async updateByAssociations(
		associations: Array<RocketChatAssociationRecord>,
		data: object,
		upsert: boolean,
		appId: string,
	): Promise<string> {
		return this.store.updateByAssociations(this.mapAssociations(associations), data, upsert, appId);
	}

	public getStore(): InMemoryPersistenceStore {
		return this.store;
	}
}
