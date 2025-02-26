/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

// @ts-ignore Disable worbox Logs
self.__WB_DISABLE_DEV_LOGS = true;

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void };

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
// import { registerRoute } from 'workbox-routing';
//import { ExpirationPlugin } from 'workbox-expiration';
// import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { Queue } from 'workbox-background-sync';
import { clientsClaim, setCacheNameDetails } from 'workbox-core';
import { googleFontsCache } from 'workbox-recipes';
import moduleList from 'src/setup/modules.json';

self.skipWaiting()
// clientsClaim() is used so that a new Service Worker
// takes control of existing client windows (browser tabs)
// that are still controlled by a previous Service Worker.
clientsClaim();

setCacheNameDetails({
  prefix: 'compile-time',
  precache: 'precache',
  suffix: 'v2',
})

// Use with precache injection
const wbManifest = [ ...self.__WB_MANIFEST ]

const modules = moduleList.modules;
const moduleDefault = moduleList.default || [];

const filterRoutes = (routes: any, modules: string[]) => {
  // filtering resources to cache
  return routes.filter(asset => {
    if (asset.url.includes('src_modules')) {
      return modules.some(module => asset.url.includes(module));
    }
    return true;
  });
}

const resources = filterRoutes(wbManifest, modules.concat(moduleDefault));

// Use with precache injection
precacheAndRoute(resources);

cleanupOutdatedCaches()

googleFontsCache();

const requestPOST = new Map<string, Request>();
const sentPOST = new Map<string, any>();
const QUEUE_NAME = 'requests';
const status = {
  pending: 'PENDING',
  successful: 'SUCCESSFUL',
  failed: 'FAILED',
}
const methods = {
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE',
}
const NAME_OBJECT_STORE = 'storage';
const KEY_REQUESTS_IN_STORAGE = 'requests';
const SYNC_EVENT_TRIGGER_MESSAGE_NAME = 'trigger-sync-event';
const SYNC_EVENT_TIMEOUT = 5000;
let setTimeoutId = null;
// const CACHE_NAME = 'runtime-cache';

// const plugins = [
//   new ExpirationPlugin({
//     maxEntries: 50,
//     maxAgeSeconds: 60 * 60 // 1 Hour
//   })
// ];

// const match = request => {
//   const url = new URL(request.request.url);
//   const isApi = url.pathname.startsWith('/api/');

//   const isRefresh = request.request.headers.get('x-refresh');
//   const cache = request.request.headers.get('x-cache');

//   return { isApi, isRefresh, cache };
// };

// const matchNetworkFirst = request => {
//   const { isApi, isRefresh, cache } = match(request);

//   return isApi && isRefresh && !cache;
// };

// const matchCacheFirst = request => {
//   const { isApi, isRefresh, cache } = match(request);

//   return isApi && !isRefresh && !cache;
// };

// registerRoute(
//   matchNetworkFirst,
//   new NetworkFirst({
//     cacheName: CACHE_NAME,
//     plugins
//   }));

// registerRoute(
//   matchCacheFirst,
//   new CacheFirst({
//     cacheName: CACHE_NAME,
//     plugins
//   })
// );

const postMessage = (message: string) => {
  (self as any).clients.matchAll()
    .then(clients => {
      clients.forEach(client => client.postMessage(message));
    });
};

const transformReadableStreamToObject = async (data: ReadableStream): Promise<any> => {
  if (!data) return;
  try {
    const reader = data.getReader();
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += new TextDecoder().decode(value);
    }
    const isString = typeof result === 'string';
    return isString ? JSON.parse(result) : {}
  } catch (err) {
    console.error('Error reading ReadableStream in transformReadableStreamToObject', err);
    throw new Error(err);
  }
};

const parseUrlSegment = (fullUrl: string, segment: 'pathname' | 'id') => {
  if (!fullUrl) return;
  const url = new URL(fullUrl);
  const pathName = url.pathname;

  if (segment === 'pathname') return pathName;

  if (segment === 'id') {
    const pathParts = pathName.split('/');
    return pathParts[pathParts.length - 1];
  }
};

const createNewRequest = async (url: string, request, attr?) => {
  const requestClone = request.clone();

  const newRequest = {
    body: requestClone.body,
    cache: requestClone.cache,
    credentials: requestClone.credentials,
    headers: requestClone.headers,
    integrity: requestClone.integrity,
    keepalive: requestClone.keepalive,
    method: requestClone.method,
    mode: requestClone.mode,
    redirect: requestClone.redirect,
    referrer: requestClone.referrer,
    referrerPolicy: requestClone.referrerPolicy,
    signal: requestClone.signal,
    ...attr
  };

  return new Request(url ? url : requestClone.url, newRequest);
};

const replaceRequestUrlWithStoredUrl = async (
  clonedRequest,
  requestId: number | string,
  requestAttributes
) => {
  if (sentPOST.has(String(requestId))) {
    const url = clonedRequest.url.replace(requestId, sentPOST.get(String(requestId)));
    const newRequest = await createNewRequest(url, clonedRequest, { ...requestAttributes });

    return newRequest;
  }
};

const prepareRequest = async (entry) => {
  // If a POST or PUT request is successful and then that same record
  // is deleted during the disconnected state, then the fake ID
  // contained in the URL is replaced by the real ID generated
  // by the database as a response to the successful request.
  try {
    const method = entry.request.method;
    const requestId = entry.metadata?.requestId;
    const request = entry.request.clone()

    const dataBody = JSON.parse(await request.text())
    const idAttribute = dataBody?.attributes?.id;
    const databaseGeneratedId = sentPOST.get(requestId);

    // The sent id in the payload is updated with the real
    // id of the record in the database.
    if (idAttribute && databaseGeneratedId) {
      dataBody.attributes.id = databaseGeneratedId;
    }

    const body = JSON.stringify(dataBody);

    const requestAttributes = method === methods.delete ? { body: null, method: methods.delete } : { body };
    const newRequest = await replaceRequestUrlWithStoredUrl(
      entry.request.clone(),
      requestId,
      requestAttributes
    );

    return newRequest;
  } catch (err) {
    console.error('Error preparing request', err);
  }
};

const nameDB = () => {
  const hostname = self.location.hostname.split('.')
  let response: string[] = hostname

  //Set capitalize to all words
  hostname.forEach((word, index) => {
    if (index >= 1) {
      hostname[index] = word.charAt(0).toUpperCase() + word.slice(1)
    }
  })

  //Remove .com .org....
  if (hostname.length >= 2) response.pop()
  response.includes('localhost') && response.push(':8080')

  return `${response.join('')}DB`
}

const openConnectionWithIndexedDB = () => {
  return indexedDB.open(nameDB());
}

const executeTransaction = (objectStore: string, key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const openDB = openConnectionWithIndexedDB()

      openDB.onsuccess = (event) => {
        const db = openDB.result;
        const transaction = db.transaction(objectStore, 'readwrite')
        const storage = transaction.objectStore(objectStore)
        const request = storage.get(key)

        request.onsuccess = (event) => {
          resolve({ request, storage });
        }

        request.onerror = (event) => {
          reject((event.target as any).error);
        }
      }

      openDB.onerror = (event) => {
        reject((event.target as any).error);
      }
    } catch (error) {
      reject(error);
    }
  });
}

const getOfflineSetting = async (): Promise<boolean | null> => {
  try {
    const SITE_SETTINGS = 'qsite.settings'
    const SETTING = 'isite::offline'
    const { request } = await executeTransaction(NAME_OBJECT_STORE, SITE_SETTINGS);
    const storedData = request.result?.data;
    const offlineSetting = storedData.siteSettings.find(item => item.name === SETTING);
    return Boolean(offlineSetting.value);
  } catch (error) {
    console.error('Error getting offline setting:', error);
    return null;
  }
}

const saveExecutedRequests = async (request, id: number, status: string) => {
  const requestInfo = {
    id,
    requestData: {
      body: await request.text(),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    },
    timestamp: new Date().valueOf(),
    metadata: {
      status,
    }
  }

  const { request: requestsExecuted, storage } = await executeTransaction(
    NAME_OBJECT_STORE,
    KEY_REQUESTS_IN_STORAGE, 
  )

  const storedData = requestsExecuted.result?.requests || [];
  storedData.push(requestInfo)
  storage.put(
    { requests: storedData, },
    KEY_REQUESTS_IN_STORAGE
  )
}

const updateRequestStatus = async (entry, requestStatus) => {
  const { request: requestsExecuted, storage } = await executeTransaction(NAME_OBJECT_STORE, KEY_REQUESTS_IN_STORAGE);
  const storedData = requestsExecuted.result?.requests || [];
  storedData.map(async (item) => {
    if (String(item.id) === String(entry.metadata.id)) {
      item.metadata.status = requestStatus
    }
  })

  storage.put(
    { requests: storedData, },
    KEY_REQUESTS_IN_STORAGE
  )
}

const updateCacheData = async (response, key: string) => {
  if (!key) return;
  try {
    const { request, storage } = await executeTransaction(NAME_OBJECT_STORE, key);

    const data = request.result?.data;
    const newData = data.map(item => {
      const match = String(item.id) === String(response.offlineId);
      return match ? response : item;
    })
    storage.put(
      { ...request.result, data: newData, },
      key
    )
  } catch (error) {
    console.error('error', error)
  }
}

const queue = new Queue(QUEUE_NAME, {
  onSync: async ({ queue }) => {
    let entry;
    const retryCounters = new Map<string, number>();
    postMessage('synchronizing-data');
    
    while (entry = await queue.shiftRequest()) {
      if (!navigator.onLine) {
        await queue.unshiftRequest(entry); 
        break
      }
      try {
        const method = entry.request.method;
        const body = await entry.request.clone().text();
        const payload = await JSON.parse(body);
        const key = `${payload.attributes.api_route}::offline`

        if (
          method === methods.put ||
          method === methods.delete
        ) {
          const newRequest = await prepareRequest(entry);
          if (newRequest) entry.request = newRequest;
        }

        const response = await fetch(entry.request.clone());
        clearTimeout(setTimeoutId)

        if (method === methods.post) {
          const { data } = await response.json();
          if (data?.offlineId) await updateCacheData(data, key)
          // Save the ID generated by the server
          // to later use it in the URL of the DELETE or PUT
          // request corresponding to the created record.
          sentPOST.set(data?.offlineId, data?.id);
        }

        await updateRequestStatus(entry, status.successful)

        postMessage('successful');

        retryCounters.delete(entry.request.url);
      } catch (err) {
        // If a queued request fails, it will try two more times,
        // and if unsuccessful, it will remove it from the queue.
        const retryCounter = retryCounters.get(entry.request.url) || 0;
        const ATTEMPTS = 3;

        if (retryCounter < ATTEMPTS) {
          retryCounters.set(entry.request.url, retryCounter + 1);
            await queue.unshiftRequest(entry);
        } else {
          await updateRequestStatus(entry, status.failed)
          retryCounters.delete(entry.request.url);
        }

        console.error('Error sending request', err);
      }
    }

    postMessage('synchronized-data');
  }
});

self.addEventListener('fetch', (event: any) => {
  const supportedMethods = [
    methods.post,
    methods.put,
    methods.delete,
  ];

  if (!supportedMethods.includes(event.request.method)) {
    return;
  }

  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone());
      return response;
    } catch (error) {
      const path = new URL(event.request.url).pathname;
      const offlineActive = await getOfflineSetting()
      
      if (path.startsWith('/api/') && !navigator.onLine && offlineActive) {

        let requestId = null;

        if (event.request.method === methods.post) {
          const {
            attributes: { offline_id }
          } = await transformReadableStreamToObject(event.request.clone().body);
          requestPOST.set(String(offline_id), event.request.clone());
        }

        if (event.request.method === methods.put) {
          const id = parseUrlSegment(event.request.url, 'id');

          if (requestPOST.has(String(id))) {
            requestId = id;
          }
        }

        if (event.request.method === methods.delete) {
          const id = parseUrlSegment(event.request.url, 'id');

          if (requestPOST.has(String(id))) {
            requestId = id;
          }
        }

        const generatedID = new Date().valueOf();

        await queue.pushRequest({
          request: event.request.clone(),
          metadata: {
            requestId,
            id: generatedID, // ID to identify the request in the queue
          }
        });

        await saveExecutedRequests(event.request.clone(), generatedID, status.pending)

        postMessage('queue-request');
      }

      return error;
    }
  };

  event.respondWith(bgSyncLogic());
});

const handleSync = async () => {
  try {
    await queue.registerSync()
  } catch (e) {
    console.error(e)
  }
}

self.addEventListener('message', async (event) => {
  postMessage('activate');

  if (event.data.type === SYNC_EVENT_TRIGGER_MESSAGE_NAME) {
    const syncQueue = await queue.getAll();

    if (syncQueue.length > 0) {
      setTimeoutId = setTimeout(async () => {
        await handleSync()
      }, SYNC_EVENT_TIMEOUT)  
    }
  }
});