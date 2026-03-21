import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import type { MouseEvent } from 'react';
import { forwardRef, memo, useRef } from 'react';

import EmojiCategoryRow from './EmojiCategoryRow';
import type { EmojiPickerItem } from '../../../../app/emoji/client';
import { RocketChatVirtualizedList } from '../../../components/RocketChatVirtualizedList';
import type { RocketChatVirtualizedListHandle } from '../../../components/RocketChatVirtualizedList';

type CategoriesResultProps = {
	items: EmojiPickerItem[];
	customItemsLimit: number;
	handleLoadMore: () => void;
	handleSelectEmoji: (event: MouseEvent<HTMLElement>) => void;
	handleScroll: (range: { startIndex: number; endIndex: number }) => void;
};

const CategoriesResult = forwardRef<RocketChatVirtualizedListHandle, CategoriesResultProps>(function CategoriesResult(
	{ items, customItemsLimit, handleLoadMore, handleSelectEmoji, handleScroll },
	ref,
) {
	const wrapper = useRef<HTMLDivElement>(null);

	return (
		<Box
			ref={wrapper}
			className={css`
				&.pointer-none .rcx-emoji-picker__element {
					pointer-events: none;
				}
			`}
			height='full'
		>
			<RocketChatVirtualizedList
				ref={ref}
				items={items}
				onRangeChanged={handleScroll}
				onScrollingChange={(isScrolling: boolean) => {
					if (!wrapper.current) {
						return;
					}

					if (isScrolling) {
						wrapper.current.classList.add('pointer-none');
					} else {
						wrapper.current.classList.remove('pointer-none');
					}
				}}
				renderRow={(item) => (
					<EmojiCategoryRow
						item={item}
						customItemsLimit={customItemsLimit}
						handleLoadMore={handleLoadMore}
						handleSelectEmoji={handleSelectEmoji}
					/>
				)}
			/>
		</Box>
	);
});

export default memo(CategoriesResult);
