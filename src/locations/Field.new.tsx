import React, { useMemo, useState, useEffect } from 'react';
import { Paragraph, Spinner, Stack } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import Select from 'react-select';
import useAutoResizer from '../lib/hooks/useAutoResizer';
import useGetEntries from '../lib/hooks/useGetEntries';
import { MultiSelect } from "react-multi-select-component";

const Field = () => {

  useAutoResizer();

  const [height, setHeight] = useState<number | null>(null);
  //const ref = React.useRef<HTMLDivElement>(null);
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
  /*const defaultValues = sdk.field.getValue().map((fieldItem: any) => {
    const label = entries.find((item) => item.sys.id === fieldItem.sys.id)?.fields.tag[sdk.field.locale];
    return {
      entry: {...fieldItem},
      value: fieldItem.sys.id,
      label
    };
  });*/

  const style = height ? { height } : {};


  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const defaultValues = sdk.field.getValue().map((fieldItem: any) => {
      const label = entries.find((item) => item.sys.id === fieldItem.sys.id)?.fields.tag[sdk.field.locale];
      return {
        entry: {...fieldItem},
        value: fieldItem.sys.id,
        label
      };
    });
    setSelected(defaultValues);
  }, [entries, sdk.field])

  const options = entries.map((entry) => {
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
  })


  if (isLoading) {
    return <Spinner variant="default" />;
  }


	return (
    <div style={{height: 400}}> 

      <MultiSelect
        hasSelectAll={false}
        options={options}
        value={selected}
        onChange={setSelected}
        labelledBy="Select"
      />



       {/* <Select
          defaultValue={defaultValue}
          isMulti
          name={sdk.field.id}
          onFocus={() => {setIsOpen(true)}}
          onBlur={() => {setIsOpen(false)}}
          onMenuClose={() => {setHeight(null)}}
          onMenuOpen={() => {setHeight(300)}}
          onChange={(values) => {
            console.log('values',values);
            const result = values.map(({ entry }) => entry);
            console.log('result',result);
            field.setValue(result);
          }}
          hideSelectedOptions={false}
          menuIsOpen={open}
          //openMenuOnFocus={true}
          options={options}
          //className="basic-multi-select"
          //classNamePrefix="select"
        />*/}  
    </div>
	);
};

export default Field;
