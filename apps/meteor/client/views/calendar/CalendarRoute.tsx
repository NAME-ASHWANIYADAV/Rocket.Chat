import { lazy } from 'react';

import { router } from '../../providers/router';

const CalendarPage = lazy(() => import('./CalendarPage'));

router.defineRoutes([
	{
		path: '/calendar',
		id: 'calendar',
		element: CalendarPage,
	},
]);

export default CalendarPage;
