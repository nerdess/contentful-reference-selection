import { useState } from 'react';
import {
	Badge,
	Box,
	Caption,
	EntityStatusBadge,
	Flex,
	Stack,
	ToggleButton,
} from '@contentful/f36-components';
import { FieldAppSDK} from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import Select, {
	InputProps,
	MultiValueGenericProps,
	MultiValueProps,
	MultiValueRemoveProps,
	OptionProps,
	ValueContainerProps,
	components,
} from 'react-select';
import { DoneIcon, ArrowDownTrimmedIcon } from '@contentful/f36-icons';
import getEntryStatus, { PublishStatus } from '../../lib/utils/getEntryStatus';
import getEntryLevel, { EntryLevel } from '../../lib/utils/getEntryLevel';
import tokens from '@contentful/f36-tokens';
import './styles.scss';
import { reduce } from 'lodash';

/*interface CustomSelectProps {
	isOpen: boolean;
}

type ExtendedSelectProps = SelectProps & CustomSelectProps;*/

interface Options {
	value: string;
	label: string;
	entry: EntrySaved;
	status: PublishStatus;
	level: number | null;
}

interface EntrySaved {
	sys: {
		type: 'Link';
		linkType: string;
		id: string;
	};
}

const DropdownIndicator = () => null; //DropdownIndicatorProps

const IndicatorSeparator = () => null; //IndicatorSeparatorProps



const ValueContainer = (props: ValueContainerProps) => {
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

const MultiValueContainer = (props: MultiValueGenericProps) => (
	<components.MultiValueContainer {...props} />
);

const MultiValueLabel = (props: MultiValueGenericProps) => {
	const { innerProps, data } = props as {
		innerProps: MultiValueProps['innerProps'];
		data: any;
	};

	const { css } = innerProps;

	const newInnerProps = {
		...innerProps,
		css: {
			...(typeof css === 'object' ? css : {}),
			backgroundColor: data.error ? tokens.red300 : tokens.gray300,
			borderTopLeftRadius: tokens.borderRadiusSmall,
			borderBottomLeftRadius: tokens.borderRadiusSmall,
			borderTopRightRadius: 0,
			borderBottomRightRadius: 0,
		},
	};

	return <components.MultiValueLabel {...props} innerProps={newInnerProps} />;
};

const MultiValueRemove = (props: MultiValueRemoveProps) => {
	const { innerProps, data } = props as {
		innerProps: MultiValueRemoveProps['innerProps'];
		data: any;
	};

	const { css } = innerProps;

	const newInnerProps = {
		...innerProps,
		css: {
			...(typeof css === 'object' ? css : {}),
			backgroundColor: data.error ? tokens.red300 : tokens.gray300,
			borderTopLeftRadius: 0,
			borderBottomLeftRadius: 0,
			borderTopRightRadius: tokens.borderRadiusSmall,
			borderBottomRightRadius: tokens.borderRadiusSmall,
			':hover': {
				backgroundColor: data.error ? tokens.red400 : tokens.gray400,
				color: 'inherit',
			},
		},
	};

	return (
		<components.MultiValueRemove
			{...props}
			data={data}
			innerProps={newInnerProps}
		/>
	);
};

const Option = (props: OptionProps) => {

	const { data } = props;

	//console.log('data', data);

	const {
		status,
		level
	}: {
		status: PublishStatus;
		level: EntryLevel;
	} = data as any;

	const colorMapping = [
		tokens.gray300,
		tokens.gray200,
		tokens.gray100
	]


	const bgColor = (level.level && colorMapping[level.level-1]) ? colorMapping[level.level-1] : 'red';

	return (
		<components.Option {...props}>
			<Stack 
				fullWidth 
				justifyContent='space-between'
			>
				<Stack fullWidth justifyContent='space-between'>
					<Box>{props.label}</Box>
					<Stack justifyContent='space-between'>
						{(level.level && level.label) && <Box>
							<Badge 
								//variant="secondary"
								style={{
									backgroundColor: bgColor, 
									whiteSpace: 'nowrap',
									color: 'inherit'
								}}
							>
								{level.label}
							</Badge>
						</Box>}
						<Box>
							<EntityStatusBadge entityStatus={status} />
						</Box>
					</Stack>
				</Stack>

				<DoneIcon
					style={{ visibility: props.isSelected ? 'visible' : 'hidden' }}
				/>
			</Stack>
		</components.Option>
	);
};

const getEntryTitle = (entriesTitles: any[] = [], contentType: string = '') => {
	return entriesTitles.find(({ id }) => {
		return id === contentType;
	}).displayField;
};

const Input = (props: InputProps) => {
	return <components.Input {...props} placeholder='Search...' />;
};

const sortOptionsByLevel = (
	options: any[], 
	levels: any[],
	locale: string
) => {

	const sorted = options.sort((a,b) => {

		const levelA = a.fields.level[locale][0] || null;
		const idA = a.sys.contentType.sys.id || null;
		const levelsA = levels.find(({id}) => id === idA)?.levels || [];
		const indexOfA = levelsA.indexOf(levelA);

		const levelB = b.fields.level[locale][0] || null;
		const idB = b.sys.contentType.sys.id || null;
		const levelsB = levels.find(({id}) => id === idB)?.levels || [];
		const indexOfB = levelsB.indexOf(levelB);

		return indexOfA - indexOfB;
	});

	return options;
}



const CustomSelect = ({
	defaultValue,
	options,
	entriesTitles,
	levels
}: {
	defaultValue: any[];
	options: any[];
	entriesTitles: any[];
	levels: any[];
}) => {

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const sdk = useSDK<FieldAppSDK>();

	const _options = sortOptionsByLevel(options, levels, sdk.field.locale);

	return (
		<Stack
			className={`crs-wrapper ${isOpen ? 'crs-wrapper-open' : ''}`}
			alignItems='start'
		>
			<Box style={{ flex: 1 }}>
				<Select
					key={defaultValue.length}
					components={{
						DropdownIndicator,
						MultiValueContainer,
						IndicatorSeparator,
						Input,
						Option,
						ValueContainer,
						MultiValueLabel,
						MultiValueRemove,
					}}
					isClearable={false}
					//isOpen={isOpen}
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
						const result = newValue.map(
							({ entry }: { entry: EntrySaved }) => entry
						);
						sdk.field.setValue(result);
					}}
					hideSelectedOptions={false}
					menuIsOpen={isOpen}
					//selectProps={{isOpen}}
					options={
						/*_.orderBy(*/
						_options.map(
							(option): Options => {
								const status = getEntryStatus(option);
								const contentType = option.sys.contentType.sys.id;
								const entryTitle = getEntryTitle(entriesTitles, contentType);
								const label =
									(
										option.fields[entryTitle][sdk.field.locale]
									) 
									|| 'Untitled';
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
								};
							}
						)
						//({ label }) => removeAccents(label.toLowerCase()))
					}
					classNamePrefix='crs'
				/>
			</Box>
			<Box style={{ width: 42 }}>
				<ToggleButton
					className="crs__toggle-button"
					isActive={false}
					onToggle={() => setIsOpen(!isOpen)}
					aria-label='Toggle'
					icon={<ArrowDownTrimmedIcon />}
				/>
			</Box>
		</Stack>
	);
};

export default CustomSelect;
