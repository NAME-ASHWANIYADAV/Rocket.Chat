import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCalendarEventMutations = () => {
	const queryClient = useQueryClient();
	const createEndpoint = useEndpoint('POST', '/v1/calendar-events.create');
	const updateEndpoint = useEndpoint('POST', '/v1/calendar-events.update');
	const deleteEndpoint = useEndpoint('POST', '/v1/calendar-events.delete');

	const createEvent = useMutation({
		mutationFn: async (params: {
			startTime: string;
			subject: string;
			description: string;
			endTime?: string;
			meetingUrl?: string;
			reminderMinutesBeforeStart?: number;
			busy?: boolean;
		}) => {
			return createEndpoint(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
		},
	});

	const updateEvent = useMutation({
		mutationFn: async (params: {
			eventId: string;
			startTime: string;
			subject: string;
			description: string;
			endTime?: string;
			meetingUrl?: string;
			reminderMinutesBeforeStart?: number;
			busy?: boolean;
		}) => {
			return updateEndpoint(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
		},
	});

	const deleteEvent = useMutation({
		mutationFn: async (params: { eventId: string }) => {
			return deleteEndpoint(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
		},
	});

	return { createEvent, updateEvent, deleteEvent };
};
