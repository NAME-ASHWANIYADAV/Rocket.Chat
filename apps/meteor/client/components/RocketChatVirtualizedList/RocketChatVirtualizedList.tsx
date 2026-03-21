import { css } from '@rocket.chat/css-in-js';
import { Box, Palette } from '@rocket.chat/fuselage';
import { useOverlayScrollbars } from 'overlayscrollbars-react';
import type { ReactElement, Ref } from 'react';
import React, { useRef, useEffect, useImperativeHandle, forwardRef, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useScrollState } from './useScrollState';
import './RocketChatVirtualizedList.styles.css';

import 'overlayscrollbars/styles/overlayscrollbars.css';

export type RocketChatVirtualizedListProps<T> = {
	items: T[];
	renderRow: (item: T, index: number) => ReactElement;
	estimateSize?: (index: number) => number;
	overscan?: number;
	onRangeChanged?: (range: { startIndex: number; endIndex: number }) => void;
	onScrollingChange?: (isScrolling: boolean) => void;
};

export type RocketChatVirtualizedListHandle = {
	scrollToIndex: (opts: { index: number; align?: 'start' | 'center' | 'end' }) => void;
};

const scrollbarsStyle = css`
	.os-scrollbar {
		--os-handle-bg: ${Palette.stroke['stroke-dark']};
		--os-handle-bg-hover: ${Palette.stroke['stroke-dark']};
		--os-handle-bg-active: ${Palette.stroke['stroke-dark']};
	}
`;

const getScrollbarsOptions = () =>
	({
		scrollbars: { autoHide: 'move' },
		overflow: { x: 'hidden' as const },
	}) as const;

function RocketChatVirtualizedListInner<T>(
	{
		items,
		renderRow,
		estimateSize = () => 40,
		overscan = 5,
		onRangeChanged,
		onScrollingChange,
	}: RocketChatVirtualizedListProps<T>,
	ref: Ref<RocketChatVirtualizedListHandle>,
) {
	const rootRef = useRef<HTMLDivElement>(null);
	const scrollElementRef = useRef<HTMLDivElement>(null);

	// OverlayScrollbars integration (same pattern as VirtualizedScrollbars.tsx)
	const [initialize, osInstance] = useOverlayScrollbars({
		options: getScrollbarsOptions(),
		defer: true,
	});

	useEffect(() => {
		const root = rootRef.current;
		const viewport = scrollElementRef.current;

		if (root && viewport) {
			initialize({
				target: root,
				elements: {
					viewport,
				},
			});
		}

		return () => osInstance()?.destroy();
	}, [initialize, osInstance]);

	// TanStack Virtual
	const virtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => scrollElementRef.current,
		estimateSize,
		overscan,
	});

	// Imperative handle for scrollToIndex (used by EmojiPicker.tsx)
	useImperativeHandle(ref, () => ({
		scrollToIndex: (opts) => virtualizer.scrollToIndex(opts.index, { align: opts.align ?? 'start' }),
	}));

	// Range changed callback (used for category tracking)
	const range = virtualizer.range;

	useEffect(() => {
		if (range && onRangeChanged) {
			onRangeChanged({ startIndex: range.startIndex, endIndex: range.endIndex });
		}
	}, [range, onRangeChanged]);

	// Scroll state detection (used for pointer-none during fast scroll)
	useScrollState(scrollElementRef, onScrollingChange);

	const virtualItems = virtualizer.getVirtualItems();
	const totalSize = virtualizer.getTotalSize();

	return (
		<Box ref={rootRef} height='full' width='full' className={scrollbarsStyle}>
			<div
				ref={scrollElementRef}
				className='rcx-virtualized-list__viewport'
				role='list'
				tabIndex={0}
			>
				<div
					className='rcx-virtualized-list__track'
					style={{ height: `${totalSize}px` }}
				>
					{virtualItems.map((virtualItem) => (
						<div
							key={virtualItem.key}
							data-index={virtualItem.index}
							ref={virtualizer.measureElement}
							className='rcx-virtualized-list__item'
							role='listitem'
							style={{ transform: `translateY(${virtualItem.start}px)` }}
						>
							{renderRow(items[virtualItem.index], virtualItem.index)}
						</div>
					))}
				</div>
			</div>
		</Box>
	);
}

RocketChatVirtualizedListInner.displayName = 'RocketChatVirtualizedList';

const RocketChatVirtualizedList = memo(forwardRef(RocketChatVirtualizedListInner)) as <T>(
	props: RocketChatVirtualizedListProps<T> & React.RefAttributes<RocketChatVirtualizedListHandle>,
) => ReactElement | null;

export default RocketChatVirtualizedList;

