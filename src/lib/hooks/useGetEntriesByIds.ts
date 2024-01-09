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
	const [entries, setEntries] = useState<any[]>([]); //Entry[] | '...'
	const { 
        isLoading: isLoadingCMA,
        environment
     } = useCMA();

	useEffect(() => {
		if (!environment) return;
        if (ids.length === 0) return;

        setIsLoading(true);

        const promises = ids.map((id) => {
            return environment.getEntries({
				'sys.id': id,
			});
        });

        Promise.allSettled(promises).then((results) => {
 
            const _results = results.map((result, i) => {
                if (result.status === 'fulfilled' && result.value.items.length === 1) {
                    return result.value.items[0];
                } 
                return {
                    id: ids[i],
                    error: true,
                }
            })

            setEntries(_results);
            setIsLoading(false);
          
        });

        return () => setIsLoading(false);


	}, [ids, environment]);

	return {
        isLoading: isLoading || isLoadingCMA,
		entries,
	};
};

export default useGetEntriesByIds;
