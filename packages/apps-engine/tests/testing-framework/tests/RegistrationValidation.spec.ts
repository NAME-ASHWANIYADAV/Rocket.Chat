import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

import type { IRead, IModify, IHttp, IPersistence } from '../../../src/definition/accessors';
import type { ISlashCommand, SlashCommandContext } from '../../../src/definition/slashcommands';
import type { MockCommandBridge } from '../bridges/MockCommandBridge';
import { TestEnvironmentSetup } from '../setup/TestEnvironmentSetup';

describe("Component Registration Validation (Douglas's Feedback)", () => {
	let testEnv: TestEnvironmentSetup;

	beforeEach(() => {
		testEnv = new TestEnvironmentSetup();
	});

	describe('Slash Command Registration Introspection', () => {
		it('should capture a registered slash command with all its properties', async () => {
			const mockCommand: ISlashCommand = {
				command: 'todo',
				i18nDescription: 'Manage your todo list',
				i18nParamsExample: '/todo add Buy groceries',
				providesPreview: false,
				async executor(_context: SlashCommandContext, _read: IRead, _modify: IModify, _http: IHttp, _persis: IPersistence): Promise<void> {
					// Command implementation
				},
			};

			// Register through the bridge (simulating engine behavior)
			const cmdBridge = testEnv.getBridges().getCommandBridge() as MockCommandBridge;
			await cmdBridge.doRegisterCommand(mockCommand, 'test-app');

			// ⭐ Use introspection API to verify registration
			const commands = testEnv.getRegisteredSlashCommands();

			assert.strictEqual(commands.length, 1, 'Should have exactly 1 registered command');
			assert.strictEqual(commands[0].command, 'todo');
			assert.strictEqual(commands[0].i18nDescription, 'Manage your todo list');
			assert.strictEqual(commands[0].i18nParamsExample, '/todo add Buy groceries');
			assert.strictEqual(commands[0].providesPreview, false);
		});

		it('should capture multiple registered slash commands', async () => {
			const cmdBridge = testEnv.getBridges().getCommandBridge() as MockCommandBridge;

			const commands: ISlashCommand[] = [
				{
					command: 'todo',
					i18nDescription: 'Manage todos',
					providesPreview: false,
					async executor() {},
				},
				{
					command: 'poll',
					i18nDescription: 'Create polls',
					providesPreview: true,
					async executor() {},
				},
			];

			for (const cmd of commands) {
				await cmdBridge.doRegisterCommand(cmd, 'test-app');
			}

			const registered = testEnv.getRegisteredSlashCommands();
			assert.strictEqual(registered.length, 2, 'Should have 2 registered commands');

			const todoCmd = testEnv.getSlashCommand('todo');
			assert.ok(todoCmd, '/todo command should be findable by name');
			assert.strictEqual(todoCmd.providesPreview, false);

			const pollCmd = testEnv.getSlashCommand('poll');
			assert.ok(pollCmd, '/poll command should be findable by name');
			assert.strictEqual(pollCmd.providesPreview, true);
		});

		it('should track command enable/disable state', async () => {
			const cmdBridge = testEnv.getBridges().getCommandBridge() as MockCommandBridge;

			const cmd: ISlashCommand = {
				command: 'greet',
				i18nDescription: 'Send a greeting',
				providesPreview: false,
				async executor() {},
			};

			await cmdBridge.doRegisterCommand(cmd, 'test-app');
			assert.ok(cmdBridge.getEnabledCommands().has('greet'), 'Command should be enabled after registration');

			await cmdBridge.doDisableCommand('greet', 'test-app');
			assert.ok(cmdBridge.getDisabledCommands().has('greet'), 'Command should be disabled');
			assert.ok(!cmdBridge.getEnabledCommands().has('greet'), 'Command should not be in enabled set');

			await cmdBridge.doEnableCommand('greet', 'test-app');
			assert.ok(cmdBridge.getEnabledCommands().has('greet'), 'Command should be re-enabled');
		});

		it('should handle command unregistration', async () => {
			const cmdBridge = testEnv.getBridges().getCommandBridge() as MockCommandBridge;

			const cmd: ISlashCommand = {
				command: 'temp',
				i18nDescription: 'Temporary command',
				providesPreview: false,
				async executor() {},
			};

			await cmdBridge.doRegisterCommand(cmd, 'test-app');
			assert.strictEqual(testEnv.getRegisteredSlashCommands().length, 1);

			await cmdBridge.doUnregisterCommand('temp', 'test-app');
			assert.strictEqual(testEnv.getRegisteredSlashCommands().length, 0, 'Command should be removed after unregistration');
		});

		it('should report doesCommandExist correctly', async () => {
			const cmdBridge = testEnv.getBridges().getCommandBridge() as MockCommandBridge;

			assert.strictEqual(await cmdBridge.doDoesCommandExist('nonexistent', 'test-app'), false, 'Non-registered command should not exist');

			await cmdBridge.doRegisterCommand(
				{ command: 'exists', i18nDescription: 'Test', providesPreview: false, async executor() {} },
				'test-app',
			);

			assert.strictEqual(await cmdBridge.doDoesCommandExist('exists', 'test-app'), true, 'Registered command should exist');
		});
	});
});
