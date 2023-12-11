import {  EntryProps } from "contentful-management";
import removeAccents from './removeAccents';
import _ from 'lodash';

const sortEntriesByLevel = (
	entries: EntryProps[], 
	locale: string
): EntryProps[] => {

	if (entries.length === 0) return entries;

	const sortedOptions = _.flatMap(_.groupBy(entries, (option) => {
		return (option.fields.level && option.fields.level[locale]) ? option.fields.level[locale][0] : null;
	}), v => _.sortBy(v, (option) => {
		return (option.fields.tag && option.fields.tag[locale]) ? removeAccents(option.fields.tag[locale].toLowerCase()) : null;
	}, 'ASC'));

	const sortedGroup = _.sortBy(sortedOptions, (option) => {
		return (option.fields.level && option.fields.tag[locale]) ? removeAccents(option.fields.level[locale][0].toLowerCase()) : null;
	});

	return sortedGroup;
}

export default sortEntriesByLevel;