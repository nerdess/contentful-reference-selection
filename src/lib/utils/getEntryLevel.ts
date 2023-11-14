//see docs: https://www.contentful.com/developers/docs/tutorials/general/determine-entry-asset-state/

import { EntryProps } from "contentful-management";

export type EntryLevel = {
  level: number | null;
  label: string | null;
} 

const getEntryLevel = ({
    entry,
    locale,
    levels,
}: {
    entry: EntryProps;
    locale: string;
    levels: any[];
}): EntryLevel => {

  const {
    fields
  } = entry || {};

  if (
    !fields.hasOwnProperty('level') 
    || !fields.level[locale]
  ) return {
    level: null,
    label: null,
  };

  const _levels = levels.find(({id}) => id === entry.sys.contentType.sys.id).levels;
  const label = entry.fields.level[locale][0] || null;
  const level = _levels.indexOf(label)+1 || null;

  return {
    level,
    label
  }

}

export default getEntryLevel;