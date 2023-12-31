import { useEffect, useState } from 'react';
import useCMA from './useCMA';

export type EntriesTitle = {
    id: string;
    name: string;
    displayField: string;
}

type GetEntriesHookResult = {
    isLoading: boolean;
	entriesTitles: EntriesTitle[];
};

const useGetEntriesTitles = (
	contentTypes: string[]
): GetEntriesHookResult => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
	const [entriesTitles, setEntriesTitles] = useState<EntriesTitle[]>([]);
	const { environment } = useCMA();

	useEffect(() => {
		if (!environment) return;

        setIsLoading(true)

        const promises = contentTypes.map((contentType) => {
            return environment.getContentType(contentType);
        });

        Promise.all(promises).then((results) => {
            const result = results.map(({sys, name, displayField}) => {
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
