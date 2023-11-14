import { FieldAppSDK } from '@contentful/app-sdk';

const getValidationsFromField = (field: FieldAppSDK['field']) => {

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

    return null;
  
};

export default getValidationsFromField;