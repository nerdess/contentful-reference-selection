import { useMemo, useState } from 'react';
import { Spinner, Note } from '@contentful/f36-components';
import { FieldAppSDK, Entry } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import useAutoResizer from '../lib/hooks/useAutoResizer';
import useGetEntriesByContentTypes from '../lib/hooks/useGetEntriesByContentTypes';
import useGetEntriesByIds from '../lib/hooks/useGetEntriesByIds';
import useGetEntriesTitles, { EntriesTitle } from '../lib/hooks/useGetEntriesTitles';
import useGetContentTypesByIds from '../lib/hooks/useGetContentTypesByIds';
import getValidationsFromField from '../lib/utils/getValidationsFromField';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import useGetContentTypesByNames from '../lib/hooks/useGetContentTypesByNames';
import { LEVEL_FIELD_ID } from '../const';
import getEntryLevel from '../lib/utils/getEntryLevel';

interface LinkContentType {
	linkContentType: string[];
}

const getDefaultValue = ({
	entries, 
	entriesTitles, 
	locale, 
	contentTypes,
	levels
}:{
	entries: Entry[], 
	entriesTitles: EntriesTitle[], 
	locale: string, 
	contentTypes: string[],
	levels: any[]
}) => {

	if (!entriesTitles || !contentTypes) return [];

	const result = entries.map((entry: Entry) => {

		const contentType = entry.sys.contentType.sys.id;
		const entryTitle = entriesTitles.find(({id}) => contentType === id);
		const {
			displayField
		} = entryTitle || {} ;
		const label = (!!displayField && !!locale) ? (entry.fields[displayField][locale]) : 'Untitled';
		const error = !contentTypes.includes(contentType);


		const level = getEntryLevel({
			entry, 
			locale,
			levels
		});

		return {
			entry: {
				sys: {
					type: 'Link',
					linkType: entry.sys.type,
					id: entry.sys.id
				},
			},
			value: entry.sys.id,
			label,
			error,
			level
		};
  	});
  	return result;

}

const getIds = (value: any) => {

  if (Array.isArray(value)) {
    return value.map(({sys}) => sys.id);
  }

  if (!Array.isArray(value) && typeof value === 'object' && value !== null) {
    return [value.sys.id];
  }

  return [];
};

const validationCheck = (field: FieldAppSDK['field']): boolean | string => {

  if (field.type !== 'Array' /*&& field.type !== 'Link'*/) {
    return 'This app only works on a reference (many) field 🤡';
  }

  return false;
}

const Field = () => {

	useAutoResizer();

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const sdk = useSDK<FieldAppSDK>();
	const error = useMemo(() => validationCheck(sdk.field), [sdk.field]);
	const validations = useMemo(() => getValidationsFromField(sdk.field), [sdk.field]);

	const optionsContentTypes: string[] = useMemo(
		() =>
			validations.reduce((accumulator: [], currentValue: LinkContentType) => {
				const { linkContentType } = currentValue;
				return [...accumulator, ...linkContentType];
			}, []),
		[validations]
	);

  	const defaultIds = useMemo(() => getIds(sdk.field.getValue()), [sdk.field]);

	const {
		isLoading: isLoadingContentTypes,
		contentTypes: defaultsContentTypes
	} = useGetContentTypesByIds(defaultIds);

	const contentTypes = useMemo(() => {
		return [...new Set([...optionsContentTypes, ...defaultsContentTypes])]
	}, [optionsContentTypes, defaultsContentTypes]);

	const { 
		isLoading: isLoadingOptions, 
		entries: options 
	} = useGetEntriesByContentTypes(optionsContentTypes);

	const { 
		isLoading: isLoadingDefaults, 
		entries: defaults 
	} = useGetEntriesByIds(defaultIds);

	const { 
		isLoading: isLoadingEntriesTitles, 
		entriesTitles 
	} = useGetEntriesTitles(contentTypes);

	const {
		isLoading: isLoadinOptionsContentTypesFull,
		isError: isErrorOptionsContentTypesFull,
		result: optionsContentTypesFull
	} = useGetContentTypesByNames(optionsContentTypes);

	const levels = useMemo(() => optionsContentTypesFull.map((contentType) => {

		let _levels = [] as string[];
		const validations = contentType.fields.find(({id}) => id === LEVEL_FIELD_ID)?.items?.validations;

		if (
			Array.isArray(validations) 
			&& validations.length > 0
			&& validations[0].in
		) {
			_levels = validations[0].in as string[];	
		}

		return {
			id: contentType.sys.id,
			levels: _levels
		}

	}), [optionsContentTypesFull]);



	const defaultValue = useMemo(() => getDefaultValue({
		entries: defaults, 
		entriesTitles, 
		locale: sdk.field.locale, 
		contentTypes: optionsContentTypes,
		levels
	}), [
		defaults, 
		entriesTitles, 
		sdk.field.locale,
		optionsContentTypes,
		levels
	]);



	if (
		isLoadingOptions
		|| isLoadingDefaults 
		|| isLoadingEntriesTitles 
		|| isLoadingContentTypes
		|| isLoadinOptionsContentTypesFull
	) {
		return <Spinner variant='default' />;
	}

	if (
		error
		|| isErrorOptionsContentTypesFull
	) {
		return <Note variant="negative">{error}</Note>;
	}

	return (
		<CustomSelect 
			defaultValue={defaultValue}
			options={options}
			entriesTitles={entriesTitles}
			levels={levels}
			setIsOpen={setIsOpen}
			isOpen={isOpen}
		/>
	);
};

export default Field;
