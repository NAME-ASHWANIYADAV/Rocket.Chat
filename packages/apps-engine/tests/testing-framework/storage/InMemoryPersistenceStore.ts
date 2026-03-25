import { randomUUID } from 'crypto';

interface IStoredRecord {
	id: string;
	data: object;
	associations: Array<{ model: string; id: string }>;
	appId: string;
}

export class InMemoryPersistenceStore {
	private records: Map<string, IStoredRecord> = new Map();

	private serialize(data: object): object {
		return JSON.parse(JSON.stringify(data));
	}

	public create(data: object, appId: string, associations: Array<{ model: string; id: string }> = []): string {
		const id = randomUUID();
		const serializedData = this.serialize(data);

		this.records.set(id, {
			id,
			data: serializedData,
			associations,
			appId,
		});

		return id;
	}

	public readById(id: string, _appId: string): object | undefined {
		const record = this.records.get(id);

		if (!record) {
			return undefined;
		}

		return this.serialize(record.data);
	}

	public readByAssociations(associations: Array<{ model: string; id: string }>, _appId: string): Array<object> {
		const results: Array<object> = [];

		for (const record of this.records.values()) {
			const matchesAll = associations.every((queryAssoc) =>
				record.associations.some((recAssoc) => recAssoc.model === queryAssoc.model && recAssoc.id === queryAssoc.id),
			);

			if (matchesAll) {
				results.push(this.serialize(record.data));
			}
		}

		return results;
	}

	public update(id: string, data: object, upsert: boolean, appId: string): string {
		const existing = this.records.get(id);

		if (!existing && !upsert) {
			throw new Error(`Record with id "${id}" not found`);
		}

		const serializedData = this.serialize(data);

		if (existing) {
			existing.data = serializedData;
			return id;
		}

		this.records.set(id, {
			id,
			data: serializedData,
			associations: [],
			appId,
		});

		return id;
	}

	public updateByAssociations(associations: Array<{ model: string; id: string }>, data: object, upsert: boolean, appId: string): string {
		const serializedData = this.serialize(data);

		for (const record of this.records.values()) {
			const matchesAll = associations.every((queryAssoc) =>
				record.associations.some((recAssoc) => recAssoc.model === queryAssoc.model && recAssoc.id === queryAssoc.id),
			);

			if (matchesAll) {
				record.data = serializedData;
				return record.id;
			}
		}

		if (upsert) {
			return this.create(data, appId, associations);
		}

		throw new Error('No records matching the given associations found');
	}

	public remove(id: string, _appId: string): object | undefined {
		const record = this.records.get(id);

		if (!record) {
			return undefined;
		}

		this.records.delete(id);
		return record.data;
	}

	public removeByAssociations(associations: Array<{ model: string; id: string }>, _appId: string): Array<object> {
		const removed: Array<object> = [];

		for (const [id, record] of this.records.entries()) {
			const matchesAll = associations.every((queryAssoc) =>
				record.associations.some((recAssoc) => recAssoc.model === queryAssoc.model && recAssoc.id === queryAssoc.id),
			);

			if (matchesAll) {
				removed.push(record.data);
				this.records.delete(id);
			}
		}

		return removed;
	}

	public purge(appId: string): void {
		for (const [id, record] of this.records.entries()) {
			if (record.appId === appId) {
				this.records.delete(id);
			}
		}
	}

	public getAll(): Array<IStoredRecord> {
		return Array.from(this.records.values());
	}

	public clear(): void {
		this.records.clear();
	}
}
