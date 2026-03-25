import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

import { RocketChatAssociationModel, RocketChatAssociationRecord } from '../../../src/definition/metadata/RocketChatAssociations';
import type { MockMessageBridge } from '../bridges/MockMessageBridge';
import { TestEnvironmentSetup } from '../setup/TestEnvironmentSetup';

const TEST_APP_ID = 'test-todo-app';

describe('Runtime Behavior (E2E Mock Bridge Tests)', () => {
	let testEnv: TestEnvironmentSetup;

	beforeEach(() => {
		testEnv = new TestEnvironmentSetup();
	});

	describe('Persistence (Create → Read → Update → Delete)', () => {
		it('should store and retrieve data through the persistence accessor', async () => {
			const { persistence, reader } = testEnv.getAccessors(TEST_APP_ID);

			// Create a todo task
			const assoc = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'user-tasks-123');

			await persistence.createWithAssociation({ text: 'Buy groceries', done: false }, assoc);

			// Read it back through the reader
			const results = await reader.getPersistenceReader().readByAssociation(assoc);

			assert.strictEqual(results.length, 1, 'Should find 1 record by association');
			assert.strictEqual((results[0] as any).text, 'Buy groceries');
			assert.strictEqual((results[0] as any).done, false);
		});

		it('should handle multiple records with the same association', async () => {
			const { persistence, reader } = testEnv.getAccessors(TEST_APP_ID);

			const assoc = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'user-tasks-456');

			await persistence.createWithAssociation({ text: 'Task 1', done: false }, assoc);
			await persistence.createWithAssociation({ text: 'Task 2', done: true }, assoc);
			await persistence.createWithAssociation({ text: 'Task 3', done: false }, assoc);

			const results = await reader.getPersistenceReader().readByAssociation(assoc);
			assert.strictEqual(results.length, 3, 'Should find 3 records');
		});

		it('should store data with strict serialization (functions stripped)', async () => {
			const { persistence, reader } = testEnv.getAccessors(TEST_APP_ID);

			const assoc = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'serialization-test');

			await persistence.createWithAssociation(
				{
					text: 'Task with function',
					onComplete: () => console.log('done'),
				},
				assoc,
			);

			const results = await reader.getPersistenceReader().readByAssociation(assoc);
			assert.strictEqual((results[0] as any).text, 'Task with function');
			assert.strictEqual((results[0] as any).onComplete, undefined, 'Function should be stripped by serialization fidelity');
		});

		it('should create and read by ID', async () => {
			const { persistence, reader } = testEnv.getAccessors(TEST_APP_ID);

			const recordId = await persistence.create({ text: 'Simple task' });
			assert.ok(recordId, 'Should return a record ID');

			const record = await reader.getPersistenceReader().read(recordId);
			assert.strictEqual((record as any).text, 'Simple task');
		});

		it('should remove data by association', async () => {
			const { persistence, reader } = testEnv.getAccessors(TEST_APP_ID);

			const assoc = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'to-delete');

			await persistence.createWithAssociation({ text: 'Delete me' }, assoc);

			// Verify it exists
			let results = await reader.getPersistenceReader().readByAssociation(assoc);
			assert.strictEqual(results.length, 1);

			// Remove it
			await persistence.removeByAssociation(assoc);

			// Verify it's gone
			results = await reader.getPersistenceReader().readByAssociation(assoc);
			assert.strictEqual(results.length, 0, 'Record should be removed');
		});
	});

	describe('Message Bridge Integration', () => {
		it('should capture messages created through the bridge', async () => {
			const msgBridge = testEnv.getBridges().getMessageBridge() as MockMessageBridge;

			// Create a message directly through the bridge (simulating engine behavior)
			await msgBridge.doCreate(
				{
					id: 'msg-1',
					text: '✅ Task added: Buy groceries',
					room: { id: 'test-room' },
				} as any,
				TEST_APP_ID,
			);

			// Verify the message was captured
			const messages = msgBridge.getMessages();
			assert.strictEqual(messages.length, 1, 'Should have 1 captured message');
			assert.ok(messages[0].text.includes('Task added'), 'Message text should match');
		});

		it('should capture multiple messages', async () => {
			const msgBridge = testEnv.getBridges().getMessageBridge() as MockMessageBridge;

			for (let i = 1; i <= 3; i++) {
				await msgBridge.doCreate({ id: `msg-${i}`, text: `Message ${i}`, room: { id: 'test-room' } } as any, TEST_APP_ID);
			}

			assert.strictEqual(msgBridge.getMessages().length, 3);
		});
	});

	describe('Room Bridge Integration', () => {
		it('should return seeded rooms through the bridge', async () => {
			testEnv.seedRoom({
				id: 'general',
				slugifiedName: 'general',
				displayName: 'General',
				type: 'c' as any,
				creator: { id: 'admin', username: 'admin' } as any,
			} as any);

			// Read directly through the bridge to bypass RoomBridge permission checks
			const roomBridge = testEnv.getBridges().getRoomBridge();
			const room = await roomBridge.doGetById('general', TEST_APP_ID);

			assert.ok(room, 'Room should be found');
			assert.strictEqual(room.id, 'general');
			assert.strictEqual(room.displayName, 'General');
		});
	});

	describe('Test Environment Reset', () => {
		it('should clear all state on reset', async () => {
			const { persistence } = testEnv.getAccessors(TEST_APP_ID);
			const cmdBridge = testEnv.getBridges().getCommandBridge();

			// Add some data
			await persistence.create({ text: 'task' });
			await cmdBridge.doRegisterCommand(
				{ command: 'test', i18nDescription: 'Test', i18nParamsExample: '', providesPreview: false, async executor() {} },
				TEST_APP_ID,
			);

			// Reset
			testEnv.reset();

			// Verify everything is cleared
			assert.strictEqual(testEnv.getRegisteredSlashCommands().length, 0);
			assert.strictEqual(testEnv.getStore().getAll().length, 0);
		});
	});
});
