import { useEffect, useState } from 'react';
import useCMA from './useCMA';

type Result = {
	isLoading: boolean;
	contentTypes: string;
};

const useGetContentTypesByIds = (ids: string[]): Result => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
	const [contentTypes, setContentTypes] = useState<any>([]);
	const { environment } = useCMA();

	useEffect(() => {

		if (!environment) return;

		setIsLoading(true);

        const promises = ids.map((id) => {
            return environment.getEntry(id);
        });

        Promise.all(promises).then((results) => {
            const types = results.map(({sys}) => sys.contentType.sys.id);
            setIsLoading(false);
            setContentTypes(types);
        });
		
		return () => setIsLoading(false);


	}, [ids, environment]);

	return {
		isLoading,
		contentTypes,
	};
};

export default useGetContentTypesByIds;
