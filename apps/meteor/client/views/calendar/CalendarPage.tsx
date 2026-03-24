import type { ICalendarEvent } from '@rocket.chat/core-typings';
import { Box, States, StatesIcon, StatesTitle, StatesSubtitle } from '@rocket.chat/fuselage';
import { useMemo, useState, useCallback } from 'react';

import { useCalendarEvents } from './hooks/useCalendarEvents';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getMonthRange = (date: Date): { startDate: Date; endDate: Date } => {
	const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
	const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
	return { startDate, endDate };
};

const getCalendarGrid = (date: Date): Date[] => {
	const { startDate } = getMonthRange(date);
	const startDay = startDate.getDay();
	const gridStart = new Date(startDate);
	gridStart.setDate(gridStart.getDate() - startDay);

	const days: Date[] = [];
	for (let i = 0; i < 42; i++) {
		const day = new Date(gridStart);
		day.setDate(day.getDate() + i);
		days.push(day);
	}
	return days;
};

const getEventsForDay = (events: ICalendarEvent[], day: Date): ICalendarEvent[] => {
	return events.filter((event) => {
		const eventDate = new Date(event.startTime);
		return (
			eventDate.getFullYear() === day.getFullYear() &&
			eventDate.getMonth() === day.getMonth() &&
			eventDate.getDate() === day.getDate()
		);
	});
};

const formatTime = (date: Date): string => {
	return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CalendarPage = () => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const { startDate, endDate } = useMemo(() => getMonthRange(currentDate), [currentDate]);
	const { data: events, isLoading, isError } = useCalendarEvents(startDate, endDate);
	const calendarDays = useMemo(() => getCalendarGrid(currentDate), [currentDate]);

	const navigateMonth = useCallback(
		(direction: number) => {
			setCurrentDate((prev) => {
				const next = new Date(prev);
				next.setMonth(next.getMonth() + direction);
				return next;
			});
		},
		[setCurrentDate],
	);

	const goToToday = useCallback(() => setCurrentDate(new Date()), [setCurrentDate]);

	const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

	if (isError) {
		return (
			<States>
				<StatesIcon name='circle-exclamation' />
				<StatesTitle>Error loading calendar</StatesTitle>
				<StatesSubtitle>Could not fetch calendar events. Please try again.</StatesSubtitle>
			</States>
		);
	}

	return (
		<Box display='flex' flexDirection='column' height='100%' padding={24}>
			{/* Header */}
			<Box display='flex' alignItems='center' justifyContent='space-between' marginBlockEnd={16}>
				<Box display='flex' alignItems='center'>
					<Box
						is='button'
						onClick={goToToday}
						padding={8}
						borderWidth={1}
						borderColor='neutral-400'
						borderRadius={4}
						bg='surface-light'
						cursor='pointer'
						marginInlineEnd={16}
					>
						Today
					</Box>
					<Box display='flex' alignItems='center'>
						<Box is='button' onClick={() => navigateMonth(-1)} padding={8} cursor='pointer' bg='transparent' borderWidth={0}>
							◀
						</Box>
						<Box fontScale='h3' marginInline={16} minWidth={200} textAlign='center'>
							{monthYear}
						</Box>
						<Box is='button' onClick={() => navigateMonth(1)} padding={8} cursor='pointer' bg='transparent' borderWidth={0}>
							▶
						</Box>
					</Box>
				</Box>
				<Box fontScale='p2' color='hint'>
					Personal Calendar (POC)
				</Box>
			</Box>

			{/* Days of week header */}
			<Box
				display='grid'
				style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
				borderBlockEnd='1px solid'
				borderColor='neutral-300'
				marginBlockEnd={4}
			>
				{DAYS_OF_WEEK.map((day) => (
					<Box key={day} padding={8} fontScale='c1' textAlign='center' color='hint' fontWeight='bold'>
						{day}
					</Box>
				))}
			</Box>

			{/* Calendar grid */}
			<Box display='grid' style={{ gridTemplateColumns: 'repeat(7, 1fr)' }} flexGrow={1}>
				{calendarDays.map((day, index) => {
					const isCurrentMonth = day.getMonth() === currentDate.getMonth();
					const isToday = day.toDateString() === new Date().toDateString();
					const dayEvents = events ? getEventsForDay(events, day) : [];

					return (
						<Box
							key={index}
							borderWidth={1}
							borderColor='neutral-200'
							padding={4}
							minHeight={80}
							bg={isToday ? 'status-background-info' : 'surface-light'}
							opacity={isCurrentMonth ? 1 : 0.4}
						>
							<Box
								fontScale='c1'
								fontWeight={isToday ? 'bold' : 'normal'}
								color={isToday ? 'status-font-on-info' : 'default'}
								marginBlockEnd={4}
							>
								{day.getDate()}
							</Box>
							{isLoading ? (
								<Box fontScale='micro' color='hint'>
									...
								</Box>
							) : (
								dayEvents.slice(0, 3).map((event) => (
									<Box
										key={event._id}
										bg='status-background-success'
										color='status-font-on-success'
										borderRadius={4}
										padding={2}
										marginBlockEnd={2}
										fontScale='micro'
										style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
										title={`${event.subject} (${formatTime(event.startTime)})`}
									>
										{formatTime(event.startTime)} {event.subject}
									</Box>
								))
							)}
							{dayEvents.length > 3 && (
								<Box fontScale='micro' color='hint'>
									+{dayEvents.length - 3} more
								</Box>
							)}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};

export default CalendarPage;
