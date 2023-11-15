//see docs: https://www.contentful.com/developers/docs/tutorials/general/determine-entry-asset-state/

import { EntryProps } from "contentful-management";
import {LEVEL_FIELD_ID}  from "../../const";

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


  const levelType = levels.find(({id}) => id === entry.sys.contentType.sys.id)?.levels;
  const label = entry?.fields[LEVEL_FIELD_ID] ? entry.fields[LEVEL_FIELD_ID][locale][0] : null;
  const level = levelType?.indexOf(label) > -1 ? levelType.indexOf(label)+1 : null;

  return {
    level,
    label
  }

}

export default getEntryLevel;