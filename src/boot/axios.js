import axios from 'axios';
import { alert, cache } from 'src/plugins/utils';
import { Loading } from 'quasar';
import qs from 'qs';

function versionToNumber(version) {
  return version.split('.').reduce((acc, part, index) => {
    return acc + parseInt(part, 10) * Math.pow(1000, 2 - index);
  }, 0);
}
export default function({ app, router, store, ssrContext }) {
  //Open Loading
  Loading.show();
  //=========== Set base url to axios
  const baseUrl = config('app.baseUrl');

  const tagsToParceHost = [
    'http://',
    'https://',
    ':8080',
    ':3000',
    'www.'
  ];
  //Get base url
  const rootHost = baseUrl || (ssrContext ? ssrContext.req.get('host') : window.location.host);
  let host = rootHost;
  //Parse host if not exist in .env
  if (!baseUrl) {
    tagsToParceHost.forEach(
      tagToReplace => host = host.replace(tagToReplace, '')
    );
    if (rootHost.indexOf('www') != -1) host = `www.${host}`;//Set again WWW
    host = `https://${host}`; //Add protocol
  }
  store.commit('qsiteApp/SET_BASE_URL', host); //Set base Url in store
  store.commit(
    'qsiteApp/SET_ORIGIN_URL',
    (ssrContext ? ssrContext.req.get('origin') : window.location.origin)
  ); //Set origin Url in store
  axios.defaults.baseURL = `${host}/api`;// Set base url in axios
  console.log(`[AXIOS] Registered Host: ${host}`);

  //========== Set default params: setting
  axios.defaults.params = { setting: {} };

  //========== Serialize the params
  axios.defaults.paramsSerializer = function(params) {
    return qs.stringify(
      Object.fromEntries(
        Object.entries(params).map(([key, value]) => [
          key,
          typeof value === 'object' ? JSON.stringify(value) : value
        ])
      )
    );
  };

  //========== Show alert from interceptor
  function showMessages(messages = []) {
    messages.forEach(item => {
      if (item.message !== '') {
        alert[item.type || 'info'](item);
      }
    });
  }

  function getOfflineTitle(config) {
    if (config.data) {
      return config.data.titleOffline || config.params.titleOffline;
    }
    return config.params.titleOffline;
  }

  //========== Handle the AbortController
  let abortController = null;
  router.beforeEach(async (to, from, next) => {
    // cancel any ongoing requests
    if (abortController) abortController.abort();
    //Set new abortController
    abortController = new AbortController();
    axios.defaults.signal = abortController.signal;
    // continue to the next route
    next();
  });

  //========== Request interceptor
  axios.interceptors.request.use(async function(config) {
    store.dispatch('quserAuth/REFRESH_TOKEN');
    //Set abortController for the GET methods
    if (config.method == 'get') {
      config.signal = abortController ? abortController.signal : null;
    }
    //Return config
    return config;
  }, function(error) {
    // Do something with request error
    return Promise.reject(error);
  });
  //========== Response interceptor
  axios.interceptors.response.use(async (response) => {
    //Show messages
    if (response.data && response.data.messages) {
      showMessages(response.data.messages);
    }

    const KEY = 'api.version'
    const backendVersion = response.headers['x-app-version'];
    const version = await cache.get.item(KEY)

    if (
      typeof backendVersion === 'string' &&
      typeof version === 'string' &&
      version.length > 0 &&
      backendVersion.length > 0
     ) {
      //Check if the version is updated
      if (
        versionToNumber(backendVersion) > versionToNumber(version) &&
        router.currentRoute.value.name != 'app.update.app') {
        router.push({
          name: 'app.update.app',
          query: {
            version: backendVersion
          }
        })
      }
    } else if (typeof backendVersion === 'string' && backendVersion.length > 0) {
      await cache.set(KEY, backendVersion)
    }

    //Response
    return response;
  }, (error) => {
    //if (axios.isCancel(error)) return Promise.reject('axiosIsCancel');
    if (!axios.isCancel(error)) {
      //Response
      if (error.response) {
        let status = error.response.status;
        switch (status) {
          case 401:
            let routeName = router.currentRoute.value.name;
            //Logout
            if (
              (routeName != 'auth.login') &&
              (routeName != 'auth.change.password')
            ) router.push({ name: 'auth.logout' });
            break;
          case 400://Intercep request errors to show alert message
            let errorsRequest = {};
            //Map the errors
            if (error.response.data) {
              if (error.response.data.errors) {
                errorsRequest = JSON.parse(error.response.data.errors);
              }
              if (error.response.data.messages) {
                error.response.data.messages.forEach(item => {
                  errorsRequest = {
                    ...errorsRequest,
                    ...JSON.parse(item.message)
                  };
                });
              }
            }
            //Instance alert message
            if (Object.keys(errorsRequest).length) {
              showMessages([{
                type: 'error',
                timeout: 20000,
                message: Object.keys(errorsRequest).map(key => {
                  let language = key.split('.')[0];
                  let item = errorsRequest[key];
                  return `<div>• [${language}] ${item.join(',')}</div>`;
                }).join('')
              }]);
            }
            break;
          default:
            if (
              error.response.data &&
              error.response.data.messages &&
              status != 404
            ) showMessages(error.response.data.messages);
            break;
        }
      }
    }
    //Return response error
    return Promise.reject(error);
  });

  //============ Set ignore SSL
  //process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  //axios.defaults.httpsAgent = new https.Agent({rejectUnauthorized: false})

  //============= Set as global
  app.config.globalProperties.$axios = axios;
}
