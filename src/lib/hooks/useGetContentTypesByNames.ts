import { useEffect, useState } from 'react';
import useCMA from './useCMA';
import { ContentType } from 'contentful-management';
import { ReadableStreamDefaultController } from 'node:stream/web';

type GetEntriesHookResult = {
    isLoading: boolean;
    isError: boolean;
	result: ContentType[];
};

const useGetContentTypesByNames = (
	names: string[]
    //query: QueryOptions
): GetEntriesHookResult => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
	const [result, setResult] = useState<any>([]);
	const { environment } = useCMA();

	useEffect(() => {
		if (!environment) return;

        setIsLoading(true);

        environment.getContentTypes().then(({items}) => {
        
            const result = items.filter(({sys}) => {
                return names.includes(sys.id)
            });
            setResult(result);
            setIsLoading(false);
        }); //todo: error handling

        return () => setIsLoading(false);

	}, [environment, names]);

	return {
        isLoading,
        isError,
		result,
	};
};

export default useGetContentTypesByNames;
