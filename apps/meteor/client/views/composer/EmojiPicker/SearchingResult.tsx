import { EmojiPickerNotFound } from '@rocket.chat/ui-client';
import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import EmojiElement from './EmojiElement';
import SearchingResultWrapper from './SearchingResultWrapper';
import type { EmojiItem } from '../../../../app/emoji/client';
import { RocketChatVirtualizedList } from '../../../components/RocketChatVirtualizedList';

const EMOJIS_PER_ROW = 9;

type SearchingResultProps = {
	searchResults: EmojiItem[];
	handleSelectEmoji: (event: MouseEvent<HTMLElement>) => void;
};

const SearchingResult = ({ searchResults, handleSelectEmoji }: SearchingResultProps) => {
	const { t } = useTranslation();

	const rows = useMemo(() => {
		const rowCount = Math.ceil(searchResults.length / EMOJIS_PER_ROW);
		return Array.from({ length: rowCount }, (_, i) => i);
	}, [searchResults.length]);

	if (searchResults.length === 0) {
		return <EmojiPickerNotFound>{t('No_emojis_found')}</EmojiPickerNotFound>;
	}

	return (
		<RocketChatVirtualizedList
			items={rows}
			estimateSize={() => 36}
			renderRow={(rowIndex) => {
				const startIdx = rowIndex * EMOJIS_PER_ROW;
				const rowEmojis = searchResults.slice(startIdx, startIdx + EMOJIS_PER_ROW);

				return (
					<SearchingResultWrapper>
						{rowEmojis.map(({ emoji, image }) => (
							<EmojiElement key={emoji} emoji={emoji} image={image} onClick={handleSelectEmoji} />
						))}
					</SearchingResultWrapper>
				);
			}}
		/>
	);
};

export default SearchingResult;
