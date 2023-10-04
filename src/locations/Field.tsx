import React, { useMemo } from 'react';
import { Box, Flex, Spinner, Stack, Note } from '@contentful/f36-components';
import { FieldAppSDK, Entry } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import Select, {
	DropdownIndicatorProps,
	IndicatorSeparatorProps,
	InputProps,
	MultiValueGenericProps,
	OptionProps,
	ValueContainerProps,
	components,
} from 'react-select';
import useAutoResizer from '../lib/hooks/useAutoResizer';
import useGetEntriesByContentTypes from '../lib/hooks/useGetEntriesByContentTypes';
import useGetEntriesByIds from '../lib/hooks/useGetEntriesByIds';
import { DoneIcon } from '@contentful/f36-icons';
import useGetEntriesTitles from '../lib/hooks/useGetEntriesTitles';
import useGetContentTypes from '../lib/hooks/useGetContentTypes';
import getEntryStatus, {PublishStatus} from '../lib/utils/getEntryStatus';
import StatusBadge from '../components/StatusBadge';
import './field.scss';

interface EntrySaved {
	sys: {
		type: 'Link';
		linkType: string;
		id: string;
	};
}

interface Options {
	value: string;
	label: string;
	entry: EntrySaved;
	status: PublishStatus;
}

interface LinkContentType {
	linkContentType: string[];
}

/*const removeAccents = function (string: string) {
	return string
		.replace(/[áàãâä]/gi, 'a')
		.replace(/[éè¨ê]/gi, 'e')
		.replace(/[íìïî]/gi, 'i')
		.replace(/[óòöôõ]/gi, 'o')
		.replace(/[úùüû]/gi, 'u')
		.replace(/[ç]/gi, 'c')
		.replace(/[ñ]/gi, 'n')
		.replace(/[^a-zA-Z0-9]/g, ' ');
};*/

const DropdownIndicator: React.FC<DropdownIndicatorProps> = () => null;

const IndicatorSeparator: React.FC<IndicatorSeparatorProps> = () => null;

const Input: React.FC<InputProps> = (props) => (
	<components.Input {...props} placeholder='Search...' />
);

const ValueContainer: React.FC<ValueContainerProps> = (props) => {
	let placeholder = null;

	if (
		Array.isArray(props.children) &&
		(props.children[0]?.key === 'placeholder' || !props.children[0])
	) {
		placeholder = (
			<Box className='crs__placeholder-custom'>Nothing selected</Box>
		);
	}
	return (
		<Flex flexDirection='column' justifyContent='center' fullWidth>
			{placeholder}
			<Box>
				<components.ValueContainer {...props} />
			</Box>
		</Flex>
	);
};

const MultiValueContainer: React.FC<MultiValueGenericProps> = (props) => (
	<components.MultiValueContainer {...props} />
);

const Option: React.FC<OptionProps> = (props) => {

	const {
		data
	} = props

	const status = data.status as PublishStatus;

	return (
		<components.Option {...props}>
			<Stack fullWidth justifyContent='space-between'>
				<Stack fullWidth justifyContent='space-between'>
					<Box>{props.label}</Box>
					<Box><StatusBadge status={status} /></Box>
				</Stack>
				<DoneIcon style={{visibility: props.isSelected  ? 'visible' : 'hidden'}} />
			</Stack>
		</components.Option>
	);
};

const getValidations = (field: FieldAppSDK['field']) => {

  //multiple reference field
  if (field.type === 'Array') {
    const { validations } = (field as any)?.items;
    return validations;
  }

  //single reference field
  if (field.type === 'Link') {
    const { validations } = field;
    return validations;
  }

};

const getEntryTitle = (entriesTitles: any[] = [], contentType: string = '') => {
  return entriesTitles.find(({id}) => {
    return id === contentType
  })?.displayField;

}

const getDefaultValue = (entries: any[] = [], entriesTitles: any[] = [], locale: string = '') => {
	const result = entries.map((entry: Entry) => {

		const contentType = entry.sys.contentType.sys.id;
		const entryTitle = entriesTitles.find(({id}) => contentType === id)?.displayField;
		const label = (entry?.fields[entryTitle] && entry?.fields[entryTitle][locale]) || 'Untitled';

		return {
			entry: {
				sys: {
					type: 'Link',
					linkType: entry.sys.type,
					id: entry.sys.id
				},
			},
			value: entry.sys.id,
			label
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

	const sdk = useSDK<FieldAppSDK>();
	const field = sdk.field;
	const error = validationCheck(field);
	const validations = getValidations(field);
	const optionsContentTypes: string[] = useMemo(
		() =>
			validations.reduce((accumulator: [], currentValue: LinkContentType) => {
				const { linkContentType } = currentValue;
				return [...accumulator, ...linkContentType];
			}, []),
		[validations]
	);
  	const ids = useMemo(() => getIds(sdk.field.getValue()), [sdk.field]);

	const {
		isLoading: isLoadingContentTypes,
		contentTypes: defaultsContentTypes
	} = useGetContentTypes(ids);

	const contentTypes = useMemo(() => {
		return [...new Set([...optionsContentTypes, ...defaultsContentTypes])]
	}, [optionsContentTypes, defaultsContentTypes]);

	const { isLoading: isLoadingOptions, entries: options } = useGetEntriesByContentTypes(optionsContentTypes);
	const { isLoading: isLoadingDefaults, entries: defaults } = useGetEntriesByIds(ids);
	const { isLoading: isLoadingEntriesTitles, entriesTitles } = useGetEntriesTitles(contentTypes);
	const defaultValue = getDefaultValue(defaults, entriesTitles, sdk.field.locale);

	if (error) {
		return <Note variant="negative">{error}</Note>;
	}

	if (isLoadingOptions || isLoadingDefaults || isLoadingEntriesTitles || isLoadingContentTypes) {
		return <Spinner variant='default' />;
	}

	return (
		<div className='crs-wrapper'>
			<Select
				key={defaultValue.length}
				components={{
					DropdownIndicator,
					MultiValueContainer,
					IndicatorSeparator,
					Input,
					Option,
					ValueContainer,
				}}
				isClearable={false}
				styles={{
					control: (baseStyles) => ({
						...baseStyles,
						borderColor: 'transparent',
					}),
				}}
				defaultValue={defaultValue}
				isMulti
				name={sdk.field.id}
				backspaceRemovesValue={false}
				placeholder=''
				onChange={(newValue: any): void => {
					const result = newValue.map(({ entry }: { entry: EntrySaved }) => entry);
					field.setValue(result);
				}}
				hideSelectedOptions={false}
				menuIsOpen={true}
				options={/*_.orderBy(*/
					options.map(
						(option): Options => {

							const status = getEntryStatus(option);
							const contentType = option?.sys.contentType.sys.id;
							const entryTitle = getEntryTitle(entriesTitles, contentType);
							const label = ((option.fields[entryTitle] && entryTitle) && option.fields[entryTitle][sdk.field.locale]) || 'Untitled'

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
								status
							};
						}
					)
					//({ label }) => removeAccents(label.toLowerCase()))
        }
				classNamePrefix='crs'
			/>
		</div>
	);
};

export default Field;
