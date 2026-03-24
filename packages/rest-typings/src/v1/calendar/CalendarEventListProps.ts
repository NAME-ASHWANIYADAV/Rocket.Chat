import { ajvQuery } from '../Ajv';

export type CalendarEventListProps = { date: string } | { startDate: string; endDate: string };

const calendarEventListPropsSchema = {
	type: 'object',
	oneOf: [
		{
			properties: {
				date: {
					type: 'string',
					nullable: false,
				},
			},
			required: ['date'],
			additionalProperties: false,
		},
		{
			properties: {
				startDate: {
					type: 'string',
					nullable: false,
				},
				endDate: {
					type: 'string',
					nullable: false,
				},
			},
			required: ['startDate', 'endDate'],
			additionalProperties: false,
		},
	],
} as const;

export const isCalendarEventListProps = ajvQuery.compile<CalendarEventListProps>(calendarEventListPropsSchema);
