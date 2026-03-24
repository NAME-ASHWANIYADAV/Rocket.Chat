import { settingsRegistry } from '../../app/settings/server';

export const addSettings = async (): Promise<void> => {
	await settingsRegistry.addGroup('Calendar', async function () {
		await this.add('Calendar_BusyStatus_Enabled', true, {
			type: 'boolean',
			public: true,
			invalidValue: false,
		});
	});
};
