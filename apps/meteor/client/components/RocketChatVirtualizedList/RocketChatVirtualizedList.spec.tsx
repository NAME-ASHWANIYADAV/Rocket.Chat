import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';

import RocketChatVirtualizedList from './RocketChatVirtualizedList';
import type { RocketChatVirtualizedListHandle } from './RocketChatVirtualizedList';

// Mock OverlayScrollbars
jest.mock('overlayscrollbars-react', () => ({
	useOverlayScrollbars: () => [jest.fn(), () => undefined],
}));

jest.mock('overlayscrollbars/styles/overlayscrollbars.css', () => ({}));
jest.mock('./RocketChatVirtualizedList.styles.css', () => ({}));

// Mock TanStack Virtual because JSDOM has no layout engine (elements have 0 height)
// so useVirtualizer would calculate 0 visible items
const mockScrollToIndex = jest.fn();

jest.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: (i: number) => number }) => {
		// Simulate rendering first 10 items (or all if fewer)
		const visibleCount = Math.min(count, 10);
		const virtualItems = Array.from({ length: visibleCount }, (_, i) => ({
			key: i,
			index: i,
			start: i * estimateSize(i),
			size: estimateSize(i),
		}));

		return {
			getVirtualItems: () => virtualItems,
			getTotalSize: () => count * estimateSize(0),
			measureElement: jest.fn(),
			scrollToIndex: mockScrollToIndex,
			range: visibleCount > 0 ? { startIndex: 0, endIndex: visibleCount - 1 } : null,
		};
	},
}));

describe('RocketChatVirtualizedList', () => {
	beforeEach(() => {
		mockScrollToIndex.mockClear();
	});

	it('should render only visible items, not all items', () => {
		render(
			<div style={{ height: '400px', overflow: 'auto' }}>
				<RocketChatVirtualizedList
					items={Array.from({ length: 1000 }, (_, i) => `Item ${i}`)}
					estimateSize={() => 40}
					renderRow={(item) => <span>{item}</span>}
				/>
			</div>,
		);

		// Only first 10 items should be rendered (mock simulates this)
		expect(screen.getByText('Item 0')).toBeInTheDocument();
		expect(screen.getByText('Item 9')).toBeInTheDocument();

		// Item 500 should NOT be in the DOM — proves virtualization
		expect(screen.queryByText('Item 500')).not.toBeInTheDocument();
	});

	it('should have proper ARIA roles for accessibility', () => {
		render(
			<div style={{ height: '400px' }}>
				<RocketChatVirtualizedList items={['Item 1', 'Item 2']} estimateSize={() => 40} renderRow={(item) => <span>{item}</span>} />
			</div>,
		);

		expect(screen.getByRole('list')).toBeInTheDocument();
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
	});

	it('should expose scrollToIndex via ref', () => {
		const ref = React.createRef<RocketChatVirtualizedListHandle>();

		render(
			<div style={{ height: '200px' }}>
				<RocketChatVirtualizedList
					ref={ref}
					items={Array.from({ length: 100 }, (_, i) => `Item ${i}`)}
					estimateSize={() => 40}
					renderRow={(item) => <span>{item}</span>}
				/>
			</div>,
		);

		expect(ref.current).not.toBeNull();
		expect(ref.current?.scrollToIndex).toBeDefined();

		ref.current?.scrollToIndex({ index: 50, align: 'center' });
		expect(mockScrollToIndex).toHaveBeenCalledWith(50, { align: 'center' });
	});

	it('should call onRangeChanged with visible range', () => {
		const onRangeChanged = jest.fn();

		render(
			<div style={{ height: '200px' }}>
				<RocketChatVirtualizedList
					items={Array.from({ length: 50 }, (_, i) => `Item ${i}`)}
					estimateSize={() => 40}
					onRangeChanged={onRangeChanged}
					renderRow={(item) => <span>{item}</span>}
				/>
			</div>,
		);

		expect(onRangeChanged).toHaveBeenCalledWith({ startIndex: 0, endIndex: 9 });
	});

	it('should render without errors when onScrollingChange is provided', () => {
		render(
			<div style={{ height: '400px' }}>
				<RocketChatVirtualizedList
					items={['A', 'B', 'C']}
					estimateSize={() => 40}
					onScrollingChange={jest.fn()}
					renderRow={(item) => <span>{item}</span>}
				/>
			</div>,
		);

		expect(screen.getByText('A')).toBeInTheDocument();
	});

	it('should have no a11y violations', async () => {
		const { container } = render(
			<div style={{ height: '400px' }}>
				<RocketChatVirtualizedList
					items={['Item 1', 'Item 2', 'Item 3']}
					estimateSize={() => 40}
					renderRow={(item) => <span>{item}</span>}
				/>
			</div>,
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
