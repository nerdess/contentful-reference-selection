import { useEffect, useState } from 'react';
import useCMA from './useCMA';
import { ContentType } from 'contentful-management';

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
        
            const foo = items.filter(({sys}) => {
                return names.includes(sys.id)
            });

            setIsLoading(false);
            setResult(foo);
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
