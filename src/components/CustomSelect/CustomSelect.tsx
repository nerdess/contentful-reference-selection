import {
	Badge,
	Box,
	EntityStatusBadge,
	Flex,
	Spinner,
	Stack,
	ToggleButton,
} from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import Select, {
	InputProps,
	MenuListProps,
	MultiValueGenericProps,
	MultiValueProps,
	MultiValueRemoveProps,
	OptionProps,
	StylesConfig,
	ValueContainerProps,
	components,
} from 'react-select';
import { DoneIcon, ArrowDownTrimmedIcon } from '@contentful/f36-icons';
import { PublishStatus } from '../../lib/utils/getEntryStatus';
import { EntryLevel } from '../../lib/utils/getEntryLevel';
import tokens from '@contentful/f36-tokens';
import { EntrySaved, Option as OptionProp } from '../../locations/Field';
import './styles.scss';

const COLORMAPPING = [tokens.gray300, tokens.gray200, tokens.gray100];

const DropdownIndicator = () => null; //DropdownIndicatorProps

const IndicatorSeparator = () => null; //IndicatorSeparatorProps

const MenuList = (props: MenuListProps) => {

	const { selectProps } = props;
	const { isLoadingOptions } = selectProps as any;

	if (isLoadingOptions) {
		return <Spinner style={{ margin: 10 }} />;
	}

	return <components.MenuList {...props} />;
};

const ValueContainer = (props: ValueContainerProps) => {

	const { selectProps } = props;
	const { setIsOpen } = selectProps as any;
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
			<Box
				style={{ cursor: 'pointer' }}
				onClick={(e: React.MouseEvent<HTMLDivElement>) => {
					const targetElement = e.target as HTMLDivElement;

					if (targetElement.classList.contains('crs__value-container')) {
						setIsOpen((isOpen: boolean) => !isOpen);
					}
				}}
			>
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
	const { level } = data;
	const bgColor = getBgColor(level.level);
	const newInnerProps = {
		...innerProps,
		css: {
			...(typeof css === 'object' ? css : {}),
			backgroundColor: data.error ? tokens.red300 : bgColor,
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
	const { level } = data;
	const bgColor = getBgColor(level.level);

	const newInnerProps = {
		...innerProps,
		css: {
			...(typeof css === 'object' ? css : {}),
			backgroundColor: data.error ? tokens.red300 : bgColor,
			borderTopLeftRadius: 0,
			borderBottomLeftRadius: 0,
			borderTopRightRadius: tokens.borderRadiusSmall,
			borderBottomRightRadius: tokens.borderRadiusSmall,
			transition: 'filter 0.2s ease-in-out',
			':hover': {
				//backgroundColor: data.error ? tokens.red400 : bgColorHover,
				filter: 'brightness(96%)',
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

const getBgColor = (level: number | null) => {
	return level && COLORMAPPING[level - 1]
		? COLORMAPPING[level - 1]
		: 'transparent';
};

const Option = (props: OptionProps) => {
	const { data } = props;

	const {
		status,
		level,
	}: {
		status: PublishStatus;
		level: EntryLevel;
	} = data as any;

	const bgColor = getBgColor(level.level);

	return (
		<components.Option {...props}>
			<Stack fullWidth justifyContent='space-between'>
				<Stack fullWidth justifyContent='space-between'>
					<Box>{props.label}</Box>
					<Stack justifyContent='space-between'>
						{!!level.level && !!level.label && (
							<Box>
								<Badge
									style={{
										backgroundColor: bgColor,
										whiteSpace: 'nowrap',
										color: 'inherit',
									}}
								>
									<span
										style={{
											fontWeight: 'normal',
										}}
									>
										{level.label}
									</span>
								</Badge>
							</Box>
						)}
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

const Input = (props: InputProps) => {
	return <components.Input {...props} placeholder='Search...' />;
};

const CustomSelect = ({
	defaultValue,
	options,
	isOpen,
	setIsOpen,
	isLoadingOptions,
}: {
	defaultValue: any[];
	options: OptionProp[];
	isOpen: boolean;
	//setIsOpen: (open: boolean) => boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	isLoadingOptions: boolean;
}) => {
	const sdk = useSDK<FieldAppSDK>();

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
						MenuList,
					}}
					isClearable={false}
					styles={{
						control: (baseStyles) => ({
							...baseStyles,
							borderColor: 'transparent',
						}),
					} as StylesConfig}
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
					options={options}
					classNamePrefix='crs'
					// @ts-ignore
					isLoadingOptions={isLoadingOptions}
					setIsOpen={setIsOpen}
				/>
			</Box>
			<Box style={{ width: 42 }}>
				<ToggleButton
					className='crs__toggle-button'
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
