import { useEffect, useState } from 'react';
import useCMA from './useCMA';

type Result = {
    id: string;
    name: string;
    displayField: string;
}

type GetEntriesHookResult = {
    isLoading: boolean;
	entriesTitles: Result[];
};

const useGetEntriesTitles = (
	contentTypes: string[]
): GetEntriesHookResult => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
	const [entriesTitles, setEntriesTitles] = useState<Result[]>([]);
	const { environment } = useCMA();

	useEffect(() => {
		if (!environment) return;

        setIsLoading(true)

        const promises = contentTypes.map((contentType) => {
            return environment.getContentType(contentType);
        });

        Promise.all(promises).then((results) => {
            const result = results.map(({sys, name, displayField}): Result => {
                return {
                    id: sys.id,
                    name,
                    displayField: displayField,
                }
            });

            setIsLoading(false);
            setEntriesTitles(result);
        });

        return () => setIsLoading(false);

	}, [contentTypes, environment]);

	return {
        isLoading,
		entriesTitles,
	};
};

export default useGetEntriesTitles;
