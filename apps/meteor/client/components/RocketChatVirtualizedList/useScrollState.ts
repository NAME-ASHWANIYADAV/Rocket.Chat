import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

const SCROLL_IDLE_TIMEOUT = 150;

export const useScrollState = (
	scrollElementRef: RefObject<HTMLElement | null>,
	onScrollingChange?: (isScrolling: boolean) => void,
): void => {
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		const viewport = scrollElementRef.current;
		if (!viewport || !onScrollingChange) {
			return;
		}

		const handleScroll = () => {
			onScrollingChange(true);
			clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(() => onScrollingChange(false), SCROLL_IDLE_TIMEOUT);
		};

		viewport.addEventListener('scroll', handleScroll);
		return () => viewport.removeEventListener('scroll', handleScroll);
	}, [scrollElementRef, onScrollingChange]);
};
