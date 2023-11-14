import { useEffect, useState } from 'react';
import { Entry } from '@contentful/app-sdk';
import useCMA from './useCMA';
import { QueryOptions } from '@contentful/app-sdk/dist/types/entities';

type GetEntriesHookResult = {
    isLoading: boolean;
	entries: Entry[];
};

const useGetEntriesByQuery = (
	//contentTypes: string[]
    query: QueryOptions
): GetEntriesHookResult => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
	const [entries, setEntries] = useState<any>([]);
	const { environment } = useCMA();

	useEffect(() => {
		if (!environment) return;

        setIsLoading(true);

        environment.getEntries(query).then((result) => {
           
            console.log('results', result);

            setIsLoading(false);
            setEntries(result);
        }); //todo: error handling

        return () => setIsLoading(false);

	}, [environment, query]);

	return {
        isLoading,
		entries,
	};
};

export default useGetEntriesByQuery;
