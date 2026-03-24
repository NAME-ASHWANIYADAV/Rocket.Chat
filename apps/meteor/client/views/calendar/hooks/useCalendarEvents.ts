import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';

export const useCalendarEvents = (startDate: Date, endDate: Date) => {
	const calendarData = useEndpoint('GET', '/v1/calendar-events.list');

	return useQuery({
		queryKey: ['calendar', 'events', startDate.toISOString(), endDate.toISOString()],

		queryFn: async () => {
			const { data } = await calendarData({ startDate: startDate.toISOString(), endDate: endDate.toISOString() });
			return data;
		},
	});
};

export const useCalendarEventsForDate = (date: Date) => {
	const calendarData = useEndpoint('GET', '/v1/calendar-events.list');

	return useQuery({
		queryKey: ['calendar', 'events', date.toISOString()],

		queryFn: async () => {
			const { data } = await calendarData({ date: date.toISOString() });
			return data;
		},
	});
};
