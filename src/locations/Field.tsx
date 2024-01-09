import useAutoResizer from '../lib/hooks/useAutoResizer';
import { FieldAppSDK } from '@contentful/app-sdk';
import { FieldConnector } from '@contentful/field-editor-shared';
import DataWrapper from '../components/DataWrapper/DataWrapper';
import { useSDK } from '@contentful/react-apps-toolkit';

const Field = () => {

	useAutoResizer();
	const sdk = useSDK<FieldAppSDK>();

	return (

		<FieldConnector<any> field={sdk.field} isInitiallyDisabled={false}>
			{({ value, setValue }) => {
				return (
					<DataWrapper 
						sdk={sdk}
						value={value} 
						setValue={setValue} 
					/>
				);
			}}
		</FieldConnector>
	
	);
};

export default Field;
