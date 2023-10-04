import { useEffect, useState } from 'react';
import { Entry } from '@contentful/app-sdk';
import useCMA from './useCMA';

type GetEntriesHookResult = {
    isLoading: boolean;
	entries: Entry[];
};

const useGetEntriesByContentTypes = (
	contentTypes: string[]
): GetEntriesHookResult => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
	const [entries, setEntries] = useState<Entry[]>([]);
	const { environment } = useCMA();

	useEffect(() => {
		if (!environment) return;

        setIsLoading(true);

        const promises = contentTypes.map((contentType) => {
            return environment.getEntries({
				content_type: contentType,
			});
        });

        Promise.all(promises).then((results) => {
            const items: Entry[][] = results.map(({items}) => items)
            const itemsConcat = items.reduce((result, currentArray) => {
                return result.concat(currentArray);
              }, []);
            setIsLoading(false);
            setEntries(itemsConcat);
        });

        return () => setIsLoading(false);

	}, [contentTypes, environment]);

	return {
        isLoading,
		entries,
	};
};

export default useGetEntriesByContentTypes;
