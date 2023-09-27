import React, { useMemo } from 'react';
import { Box, Flex, Spinner, Stack } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import Select, { ControlProps, DropdownIndicatorProps, IndicatorSeparatorProps, InputProps, MultiValueGenericProps, OptionProps, ValueContainerProps, components } from 'react-select';
import useAutoResizer from '../lib/hooks/useAutoResizer';
import useGetEntries from '../lib/hooks/useGetEntries';
import { DoneIcon} from '@contentful/f36-icons';
import _ from 'lodash';
import './field.scss';

const removeAccents = function (string: string) {
  return string
      .replace(/[áàãâä]/gi,"a")
      .replace(/[éè¨ê]/gi,"e")
      .replace(/[íìïî]/gi,"i")
      .replace(/[óòöôõ]/gi,"o")
      .replace(/[úùüû]/gi, "u")
      .replace(/[ç]/gi, "c")
      .replace(/[ñ]/gi, "n")
      .replace(/[^a-zA-Z0-9]/g," ");
  }

const DropdownIndicator: React.FC<DropdownIndicatorProps> = () => null;

const IndicatorSeparator: React.FC<IndicatorSeparatorProps> = () => null;

const Input: React.FC<InputProps> = props => <components.Input {...props} placeholder="Search..." />;

const MultiValueContainer: React.FC<MultiValueGenericProps> = (props) => <components.MultiValueContainer {...props} />;


const Option: React.FC<OptionProps> = props => {
  return (
    <components.Option {...props}>
      <Stack fullWidth justifyContent="space-between">
        <Box>{props.label}</Box>
        {props.isSelected && <DoneIcon />}
      </Stack>
    </components.Option>
  );
};


const Field = () => {

  useAutoResizer();

	const sdk = useSDK<FieldAppSDK>();
	const field = sdk.field;
	const { validations } = (field as any).items;
	const linkContentTypes: string[] = useMemo(
		() =>
			validations.reduce((accumulator: [], currentValue: any) => {
				const { linkContentType } = currentValue;
				return [...accumulator, ...linkContentType];
			}, []),
		[validations]
	);
  const { isLoading, entries } = useGetEntries({contentType: linkContentTypes.join(',')});
  const defaultValue = sdk.field.getValue()?.map((fieldItem: any) => {
    const label = entries.find((item) => item.sys.id === fieldItem.sys.id)?.fields.tag[sdk.field.locale];
    return {
      entry: {...fieldItem},
      value: fieldItem.sys.id,
      label
    };
  });
  const customStyles = {
    control: (baseStyles: any, state: any) => ({
      ...baseStyles,
      borderColor: 'transparent',
    })
  };



const ValueContainer: React.FC<ValueContainerProps> = (props) => {

  console.log('props', props);
  let placeholder = null;

  if (Array.isArray(props.children) && (props.children[0]?.key === 'placeholder' || !props.children[0])) {
    placeholder = <Box className="crs__placeholder-custom">Nothing selected</Box>
  }
  return <Flex flexDirection="column" justifyContent="center" fullWidth>{placeholder}<Box><components.ValueContainer {...props} /></Box></Flex>
};


  if (isLoading) {
    return <Spinner variant="default" />;
  }


	return (
    <div className="crs-wrapper"> 
        <Select
          components={{ DropdownIndicator, MultiValueContainer, IndicatorSeparator, Input, Option, ValueContainer }}
          isClearable={false}
          styles={customStyles}
          defaultValue={defaultValue}
          isMulti
          name={sdk.field.id}
          backspaceRemovesValue={false}
          //placeholder="Nothing selected"
          placeholder=""
          onChange={(values) => {
            const result = values.map(({ entry }) => entry);
            //setCount(result.length);
            field.setValue(result);
          }}
          hideSelectedOptions={false}
          menuIsOpen={true}
          options={_.orderBy(entries.map((entry) => {
            return {
              entry: {
                sys: {
                  type: 'Link',
                  linkType: entry.sys.type,
                  id: entry.sys.id,
                },
              },
              value: entry.sys.id,
              label: entry.fields.tag[sdk.field.locale],
            };
          }), 
          ({label}) => {removeAccents(label.toLowerCase())}
          )}
          classNamePrefix="crs"
        /> 
    </div>
	);
};

export default Field;
