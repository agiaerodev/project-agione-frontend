import { cache } from 'src/plugins/utils';

export default async function paginateCacheOffline(fountain, search = null, page = 1, perPage = 10, filters=null) {
  let data = null;

  if (typeof fountain === 'string') {
    data = await cache.get.item(`${fountain}::offline`) || { data: [] };
  }

  if (typeof fountain === 'object') data = fountain;

  if (!data.data.length === 0) return data;

  const processedData = data.data.filter(item => {
    return Object.values(item).some(value => {
      if (value) {
        search = search ? search.toLowerCase() : null;
        if (search) {
          return String(value).toLowerCase().includes(search);
        } else {
          return true;
        }
      }
    });
  });

  const applyFilters = (data, filters) => {
    if (!filters) return data
    return data.filter(item => {
      return Object.entries(filters).every(([key, valueFilter]) => {
        if (!(key in item)) return true

        if (valueFilter === 'null') {
          return item[key] === null;
        }
        
        if (Array.isArray(valueFilter)) {
          return valueFilter.includes(item[key]);
        }
        
        if (typeof valueFilter === 'function') {
          return valueFilter(item[key]);
        }
        
        return item[key] === valueFilter;
      });
    });
  }

  const filteredData = applyFilters(processedData, filters);
  const totalPages = Math.ceil(filteredData.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentPageData = filteredData.slice(startIndex, endIndex);

  const response = {
    data: currentPageData,
    meta: {
      page: {
        total: filteredData.length,
        perPage: perPage,
        currentPage: page,
        lastPage: totalPages
      }
    }
  };

  return response;
}