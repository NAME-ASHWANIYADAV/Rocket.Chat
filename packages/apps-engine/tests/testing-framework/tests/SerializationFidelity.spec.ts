import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

import { InMemoryPersistenceStore } from '../storage/InMemoryPersistenceStore';

describe("Serialization Fidelity (Douglas's Key Concern)", () => {
	let store: InMemoryPersistenceStore;

	beforeEach(() => {
		store = new InMemoryPersistenceStore();
	});

	describe('Function Stripping', () => {
		it('should strip functions from persisted data', () => {
			const id = store.create(
				{
					text: 'Buy groceries',
					onComplete: () => console.log('done'),
					nested: {
						callback: function handler() {},
					},
				},
				'test-app',
			);

			const stored = store.readById(id, 'test-app') as any;

			assert.strictEqual(stored.text, 'Buy groceries', 'String data should be preserved');
			assert.strictEqual(stored.onComplete, undefined, 'Top-level function should be stripped');
			assert.strictEqual(stored.nested.callback, undefined, 'Nested function should be stripped');
		});

		it('should preserve non-function properties alongside functions', () => {
			const id = store.create(
				{
					name: 'Task',
					priority: 1,
					completed: false,
					handler: () => {},
				},
				'test-app',
			);

			const stored = store.readById(id, 'test-app') as any;

			assert.strictEqual(stored.name, 'Task');
			assert.strictEqual(stored.priority, 1);
			assert.strictEqual(stored.completed, false);
			assert.strictEqual(stored.handler, undefined, 'Function should be stripped');
		});
	});

	describe('Undefined Value Stripping', () => {
		it('should strip undefined values from persisted data', () => {
			const id = store.create({ a: 1, b: undefined, c: 'hello' }, 'test-app');

			const stored = store.readById(id, 'test-app') as any;

			assert.strictEqual(stored.a, 1);
			assert.strictEqual('b' in stored, false, 'Property with undefined value should not exist in stored data');
			assert.strictEqual(stored.c, 'hello');
		});
	});

	describe('Date Serialization', () => {
		it('should convert Date objects to ISO strings', () => {
			const testDate = new Date('2024-03-25T12:00:00.000Z');
			const id = store.create(
				{
					createdAt: testDate,
					text: 'Task with date',
				},
				'test-app',
			);

			const stored = store.readById(id, 'test-app') as any;

			assert.strictEqual(typeof stored.createdAt, 'string', 'Date should be converted to string');
			assert.strictEqual(stored.createdAt, '2024-03-25T12:00:00.000Z', 'Date string should be ISO format');
		});
	});

	describe('Circular Reference Detection', () => {
		it('should throw on circular references (matching MongoDB behavior)', () => {
			const circular: any = { name: 'test' };
			circular.self = circular;

			assert.throws(
				() => store.create(circular, 'test-app'),
				(err: Error) => err instanceof TypeError,
				'Circular reference should throw TypeError',
			);
		});
	});

	describe('Class Instance Stripping', () => {
		it('should strip class methods and keep only plain data', () => {
			class TaskModel {
				text: string;

				done: boolean;

				constructor(text: string) {
					this.text = text;
					this.done = false;
				}

				toggle() {
					this.done = !this.done;
				}
			}

			const task = new TaskModel('Buy groceries');
			const id = store.create(task as any, 'test-app');
			const stored = store.readById(id, 'test-app') as any;

			assert.strictEqual(stored.text, 'Buy groceries', 'Data should be preserved');
			assert.strictEqual(stored.done, false, 'Data should be preserved');
			assert.strictEqual(stored.toggle, undefined, 'Class methods should be stripped');
		});
	});

	describe('Complex Nested Objects', () => {
		it('should correctly serialize deeply nested objects', () => {
			const id = store.create(
				{
					poll: {
						question: 'Lunch?',
						options: [
							{ text: 'Pizza', votes: [1, 2, 3] },
							{ text: 'Sushi', votes: [] },
						],
						metadata: {
							created: new Date('2024-01-01'),
							anonymous: true,
						},
					},
				},
				'test-app',
			);

			const stored = store.readById(id, 'test-app') as any;

			assert.strictEqual(stored.poll.question, 'Lunch?');
			assert.strictEqual(stored.poll.options.length, 2);
			assert.deepStrictEqual(stored.poll.options[0].votes, [1, 2, 3]);
			assert.strictEqual(typeof stored.poll.metadata.created, 'string');
		});
	});

	describe('CRUD Operations with Serialization', () => {
		it('should maintain serialization fidelity across update operations', () => {
			const id = store.create({ count: 0 }, 'test-app');
			store.update(id, { count: 5, handler: () => {} }, false, 'test-app');

			const stored = store.readById(id, 'test-app') as any;

			assert.strictEqual(stored.count, 5, 'Updated value should persist');
			assert.strictEqual(stored.handler, undefined, 'Function in update should be stripped');
		});

		it('should handle purge correctly', () => {
			store.create({ text: 'Task 1' }, 'app-1');
			store.create({ text: 'Task 2' }, 'app-1');
			store.create({ text: 'Task 3' }, 'app-2');

			store.purge('app-1');

			const all = store.getAll();
			assert.strictEqual(all.length, 1, 'Only app-2 data should remain after purge');
			assert.strictEqual((all[0].data as any).text, 'Task 3');
		});
	});
});
