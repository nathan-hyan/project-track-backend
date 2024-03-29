export const sorter = (sort: string) => {
  switch (sort) {
    case 'lastModified':
      return ['price.lastModified', -1];

    case 'name':
      return ['name', 1];

    case 'internalId':
      return ['internalId', 1];

    default:
      return [];
  }
};
