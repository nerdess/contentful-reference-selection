import { useEffect, useState } from 'react';
import { Entry } from '@contentful/app-sdk';
import useCMA from './useCMA';

type GetEntriesHookResult = {
    isLoading: boolean;
	entries: Entry[];
};

const useGetEntriesByIds = (
	ids: string[]
): GetEntriesHookResult => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
	const [entries, setEntries] = useState<Entry[]>([]);
	const { environment } = useCMA();

	useEffect(() => {
		if (!environment) return;
        if (ids.length === 0) return;

        setIsLoading(true);

        const promises = ids.map((id) => {
            return environment.getEntries({
				'sys.id': id,
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


	}, [ids, environment]);

	return {
        isLoading,
		entries,
	};
};

export default useGetEntriesByIds;
