import React, { useEffect, useState, useMemo } from 'react';
import { Entry } from '@contentful/app-sdk';
import useCMA from './useCMA';

type GetEntriesHookResult = {
    isLoading: boolean;
	entries: Entry[];
};

const useGetEntries = ({
	contentType,
}: {
	contentType: string;
}): GetEntriesHookResult => {

    const [isLoading, setIsLoading] = useState<boolean>(true);
	const [entries, setEntries] = useState<Entry[]>([]);
	const { environment } = useCMA();

	useEffect(() => {
		if (!environment) return;

		environment
			.getEntries({
				//content_type: linkContentTypes.join(','),
				content_type: contentType,
			})
			.then((response) => {
				const { items } = response;
                setIsLoading(false);
				setEntries(items);
			});
	}, [contentType, environment]);

	return {
        isLoading,
		entries,
	};
};

export default useGetEntries;
