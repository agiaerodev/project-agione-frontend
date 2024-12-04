import { cache } from 'src/plugins/utils';

class cacheOffline {

  async getDataIntoObject(apiRoute = null) {
    if (!apiRoute) return [];

    const TAG = '::offline';
    let route = [ apiRoute ];
    
    if (!apiRoute.includes(TAG) && !apiRoute.includes('::requestParams')) {
      const keys = await cache.keys()
      route = keys.filter(key => key.includes(apiRoute));
      const matchingSpecialKey = route.filter(key => key.includes(TAG));
      if (matchingSpecialKey.length > 0) route = matchingSpecialKey;
    }

    return await cache.get.items(route) || { data: [] }
  }

  async getAllList(apiRoute = null) {
    const data = []
    const cacheResponse = await this.getDataIntoObject(apiRoute);
    
    Object.keys(cacheResponse).map(key => { 
      if (Array.isArray(cacheResponse[key]?.data)) data.push(...cacheResponse[key]?.data) 
    })

    return { data };
  }

  async addNewRecord(apiRoute = null, data = {}) {
    const route = `${apiRoute}::offline`
    const cacheResponse = await cache.get.item(route);
    if (!cacheResponse) return;
    const dataInCache = structuredClone(cacheResponse);
    
    dataInCache.data.unshift({ ...data });
    await cache.set(route, dataInCache);
    return true;
  }

  async updateRecord(apiRoute = null, data = {}, id) {
    const cacheResponse = await this.getDataIntoObject(apiRoute);
    const dataInCache = structuredClone(cacheResponse);
    let recordUpdate = {}

    Object.keys(cacheResponse).map(async key => {
      if (!Array.isArray(dataInCache[key].data)) return;
      const records = await dataInCache[key].data.map(item => {
        if (String(item.id) === String(id)) {
          recordUpdate = { ...item, ...data }
          return recordUpdate
        } else return item
      });
      const newData = {
        ...dataInCache[key],
        data: records
      };
      await cache.set(key, { ...newData });
    });

    return recordUpdate;
  }

  async updateList(apiRoute = null, data) {
    const cacheResponse = await this.getDataIntoObject(apiRoute);
    const dataInCache = structuredClone(cacheResponse);

    Object.keys(dataInCache).map(async key => {
      if (!Array.isArray(dataInCache[key].data)) return;
      dataInCache[key].data.push({ ...data });
      await cache.set(key, { ...dataInCache[key] });
    });

    return true;
  }

  async deleteItem(itemId, apiRoute = null) {
    const cacheResponse = await this.getDataIntoObject(apiRoute);
    const dataInCache = structuredClone(cacheResponse);

    Object.keys(dataInCache).map(async key => {
      if (!Array.isArray(dataInCache[key]?.data)) return;
      const index = dataInCache[key].data.findIndex(
        item => String(item.id) === String(itemId)
      );
      if (index < 0) return null;
      dataInCache[key].data.splice(index, 1);
      await cache.set(key, { ...dataInCache[key] });
    });

    return true;
  }

  async getItemById(itemId, apiRoute = null) {
    const cacheResponse = await this.getAllList(apiRoute);
    
    const record = await cacheResponse.data.find(
      item => item.id === itemId
    );
    return record || { data: [] }
  }
}

const cacheOff = new cacheOffline();

export default cacheOff;
