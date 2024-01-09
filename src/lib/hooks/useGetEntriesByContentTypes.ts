import { useEffect, useState } from 'react';
//import { Entry } from '@contentful/app-sdk';
import { EntryProps } from 'contentful-management';
import useCMA from './useCMA';

type GetEntriesHookResult = {
    isLoading: boolean;
	entries: EntryProps[];
};

const useGetEntriesByContentTypes = (
	contentTypes: string[]
): GetEntriesHookResult => {

    const [isLoading, setIsLoading] = useState<boolean>(true);
	const [entries, setEntries] = useState<EntryProps[]>([]);
	const { environment } = useCMA();

	useEffect(() => {
		if (!environment) return;
        if (contentTypes.length === 0) return;

        setIsLoading(true);

        const promises = contentTypes.map((contentType) => {
            return environment.getEntries({
				content_type: contentType,
			});
        });

        Promise.all(promises).then((results) => {
            const items: EntryProps[][] = results
                .map(({items}) => items);

            const itemsConcat = items.reduce((result, currentArray) => {
                return result.concat(currentArray);
              }, [])
              .filter((item) => !item.sys.archivedVersion);

            setEntries(itemsConcat);
            setIsLoading(false);
        }); //todo: error handling

        return () => setIsLoading(false);

	}, [contentTypes, environment]);

	return {
        isLoading,
		entries,
	};
};

export default useGetEntriesByContentTypes;
