import type { ISlashCommand } from '../../../src/definition/slashcommands';
import { CommandBridge } from '../../../src/server/bridges/CommandBridge';

export class MockCommandBridge extends CommandBridge {
	private registeredCommands: Map<string, ISlashCommand> = new Map();

	private enabledCommands: Set<string> = new Set();

	private disabledCommands: Set<string> = new Set();

	public async doDoesCommandExist(command: string, appId: string): Promise<boolean> {
		return this.doesCommandExist(command, appId);
	}

	public async doEnableCommand(command: string, appId: string): Promise<void> {
		return this.enableCommand(command, appId);
	}

	public async doDisableCommand(command: string, appId: string): Promise<void> {
		return this.disableCommand(command, appId);
	}

	public async doModifyCommand(command: ISlashCommand, appId: string): Promise<void> {
		return this.modifyCommand(command, appId);
	}

	public async doRegisterCommand(command: ISlashCommand, appId: string): Promise<void> {
		return this.registerCommand(command, appId);
	}

	public async doUnregisterCommand(command: string, appId: string): Promise<void> {
		return this.unregisterCommand(command, appId);
	}

	protected async doesCommandExist(command: string, _appId: string): Promise<boolean> {
		return this.registeredCommands.has(command);
	}

	protected async enableCommand(command: string, _appId: string): Promise<void> {
		this.enabledCommands.add(command);
		this.disabledCommands.delete(command);
	}

	protected async disableCommand(command: string, _appId: string): Promise<void> {
		this.disabledCommands.add(command);
		this.enabledCommands.delete(command);
	}

	protected async modifyCommand(command: ISlashCommand, _appId: string): Promise<void> {
		this.registeredCommands.set(command.command, command);
	}

	protected async registerCommand(command: ISlashCommand, _appId: string): Promise<void> {
		this.registeredCommands.set(command.command, command);
		this.enabledCommands.add(command.command);
	}

	protected async unregisterCommand(command: string, _appId: string): Promise<void> {
		this.registeredCommands.delete(command);
		this.enabledCommands.delete(command);
		this.disabledCommands.delete(command);
	}

	public getRegisteredCommands(): Map<string, ISlashCommand> {
		return new Map(this.registeredCommands);
	}

	public getEnabledCommands(): Set<string> {
		return new Set(this.enabledCommands);
	}

	public getDisabledCommands(): Set<string> {
		return new Set(this.disabledCommands);
	}

	public clear(): void {
		this.registeredCommands.clear();
		this.enabledCommands.clear();
		this.disabledCommands.clear();
	}
}
