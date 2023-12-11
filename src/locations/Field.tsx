import { useEffect, useMemo, useRef, useState } from 'react';
import { Spinner, Note } from '@contentful/f36-components';
import { FieldAppSDK, Entry } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import useAutoResizer from '../lib/hooks/useAutoResizer';
import useGetEntriesByContentTypes from '../lib/hooks/useGetEntriesByContentTypes';
import useGetEntriesByIds from '../lib/hooks/useGetEntriesByIds';
import useGetContentTypesByIds from '../lib/hooks/useGetContentTypesByIds';
import getValidationsFromField from '../lib/utils/getValidationsFromField';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import useGetContentTypesByNames from '../lib/hooks/useGetContentTypesByNames';
import { LEVEL_FIELD_ID } from '../const';
import getEntryLevel, { EntryLevel } from '../lib/utils/getEntryLevel';
import { ContentType, EntryProps } from 'contentful-management';
import getEntryStatus, { PublishStatus } from '../lib/utils/getEntryStatus';
import sortEntriesByLevel from '../lib/utils/sortEntriesByLevel';

interface LinkContentType {
	linkContentType: string[];
}

export interface EntrySaved {
	sys: {
		type: 'Link';
		linkType: string;
		id: string;
	};
}

export interface Option {
	value: string;
	label: string;
	entry: EntrySaved;
	status: PublishStatus;
	level: EntryLevel;
}

const getDefaultValue = ({
	entries, 
	locale, 
	validContentTypes,
	contentTypesFull,
	levels
}:{
	entries: Entry[], 
	locale: string, 
	validContentTypes: string[],
	contentTypesFull: ContentType[],
	levels: any[]
}) => {

	const result = entries.map((entry: Entry) => {

		const contentType = entry.sys.contentType.sys.id;
		const error = !validContentTypes.includes(contentType);
		const contentTypeObj = contentTypesFull.find(({sys}) => sys.id === contentType);
		const {
			displayField
		} = contentTypeObj || {} ;
		const label = (!!displayField && !!locale) ? (entry.fields[displayField][locale]) : 'Untitled';

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


	console.log('defaultIds', defaultIds)

	const {
		isLoading: isLoadingContentTypes,
		contentTypes: defaultsContentTypes
	} = useGetContentTypesByIds(defaultIds);

	const contentTypes = useMemo(() => {
		return [...new Set([...optionsContentTypes, ...defaultsContentTypes])]
	}, [optionsContentTypes, defaultsContentTypes]);

	const {
		isLoading: isLoadingContentTypesFull,
		isError: isErrorContentTypesFull,
		result: contentTypesFull
	} = useGetContentTypesByNames(contentTypes);



	const _optionsContentTypes = useMemo(() => {
		return isOpen ? optionsContentTypes : [];
	}, [optionsContentTypes, isOpen]);

	const { 
		isLoading: isLoadingOptions, 
		entries: options 
	} = useGetEntriesByContentTypes(_optionsContentTypes);

	const { 
		isLoading: isLoadingDefaults, 
		entries: defaults 
	} = useGetEntriesByIds(defaultIds);

	const levels = useMemo(() => contentTypesFull.map((contentType) => {

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

	}), [contentTypesFull]);



	const defaultValue = useMemo(() => getDefaultValue({
		entries: defaults, 
		locale: sdk.field.locale, 
		validContentTypes: optionsContentTypes,
		contentTypesFull: contentTypesFull,
		levels
	}), [
		defaults, 
		sdk.field.locale,
		optionsContentTypes,
		contentTypesFull,
		levels
	]);


	const optionsSortedByLevel = useMemo(() => sortEntriesByLevel(options, sdk.field.locale), [options, sdk.field.locale]);

	const _options = useMemo(() => optionsSortedByLevel.map((option: EntryProps) => {
			const status = getEntryStatus(option);
			const contentType = option.sys.contentType.sys.id;
			const displayField = contentTypesFull.find(({sys}) => sys.id === contentType)?.displayField;
			const label = (!!displayField && !!option.fields[displayField]) ? option.fields[displayField][sdk.field.locale] : 'Untitled';
			
			const level = getEntryLevel({
				entry: option, 
				locale: sdk.field.locale,
				levels
			});

			return {
				entry: {
					sys: {
						type: 'Link',
						linkType: option.sys.type,
						id: option.sys.id,
					},
				},
				value: option.sys.id,
				label,
				status,
				level
			} as Option;
		}
	), [optionsSortedByLevel, sdk.field.locale, levels, contentTypesFull]);


	const [isLoaded, setIsLoaded] = useState<boolean>(false)

	//useEffect(() => { setTimeout(() => setIsLoaded(true), 3000) },[])
	
	if (
		isLoadingDefaults 
		|| isLoadingContentTypes
		|| isLoadingContentTypesFull
		//|| !isLoaded
	) {
		return <Spinner variant='default' />;
	}

	if (
		error
		|| isErrorContentTypesFull
	) {
		return <Note variant="negative">{error}</Note>;
	}

	return (
		<CustomSelect 
			defaultValue={defaultValue}
			isLoadingOptions={isLoadingOptions}
			options={_options}
			setIsOpen={setIsOpen}
			isOpen={isOpen}
		/>
	);
};

export default Field;
