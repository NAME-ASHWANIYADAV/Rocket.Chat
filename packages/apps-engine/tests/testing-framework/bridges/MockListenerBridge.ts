import type { IMessage } from '../../../src/definition/messages';
import type { AppInterface } from '../../../src/definition/metadata';
import type { IRoom } from '../../../src/definition/rooms';
import type { UIKitIncomingInteraction } from '../../../src/definition/uikit';
import type { IListenerBridge } from '../../../src/server/bridges/IListenerBridge';

export class MockListenerBridge implements IListenerBridge {
	async messageEvent(_int: AppInterface, _message: IMessage): Promise<void | boolean | IMessage> {
		return undefined;
	}

	async roomEvent(_int: AppInterface, _room: IRoom): Promise<void | boolean | IRoom> {
		return undefined;
	}

	async uiKitInteractionEvent(_int: AppInterface, _action: UIKitIncomingInteraction): Promise<void | boolean> {
		return undefined;
	}
}
