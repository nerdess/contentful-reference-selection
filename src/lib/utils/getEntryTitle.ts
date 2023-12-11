const getEntryTitle = (entriesTitles: any[] = [], contentType: string = '') => {
	return entriesTitles.find(({ id }) => {
		return id === contentType;
	}).displayField;
};

export default getEntryTitle;