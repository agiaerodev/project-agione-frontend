//Get package information
import pjson from '../../package.json';
import environment from '../environments/environment'
//Parse domain to know from where is loading
let tagsToParceHost = ['http://', 'https://', ':8080', ':3000', 'www.'];
let host = window.location.href;
tagsToParceHost.forEach(tagToReplace => host = host.replace(tagToReplace, ''));
let loadFrom = host.split('/')[1];

//Define the productFrom and mode
let productFrom = null;
let mode = 'iadmin';
if (loadFrom) {
  productFrom = ['booking'].includes(loadFrom) ? `q${loadFrom}` : null;
  if (!productFrom && ['iadmin', 'ipanel'].includes(loadFrom)) mode = loadFrom;
}

export default {
  baseUrl: environment.baseUrl,
  version: pjson.version,//Package version
  mode,//Define load mode
  productFrom,//Define load as product
  validateModeAccess: true,//Define if validate app mode access
  forceRoleAndDepartment: false,//Force to select role and department
  //useLocalTranslations: true,//Define from where use the translations
  //UI Languages
  languages: {
    default: 'es',
    availables: ['en-us', 'es']
  },
  //Modules
  modules: [
    'qcrud',
    'quser',
    'qnotification',
    'qcommerce',
    'qblog',
    'qform',
    'qplan',
    'qad',
    'qdocument',
    'qplace',
    'qcheckin',
    'qlocations',
    'qappointment',
    'qbooking',
    'qwallet',
    'qretail',
    'qgamification',
    'qevent',
    'qpage',
    'qredirect',
    'qmenu',
    'qmedia',
    'qslider',
    'qchat',
    'qqreable',
    'qtranslation',
    'qrequestable',
    'qauction',
    'qbuilder',
    'qsite',
    'qproduct',
    'qorder',
    'qprice',
    'qcredit',
    'qoffline',
    'qwebhook',
    'qaccounting',
    'qtask',
    'qcomment',
    'qtelemetry'
  ],
  //Cache
  saveCache: {
    refresh: [
      'sessionData',
      'auth.department.id',
      'auth.role.id',
      'impersonatorData',
      'app.state.extra',
      'auth.organization.id',
      'org-wizard-data',
      'org-wizard-categories',
      'org-wizard-plans',
      'org-wizard-step',
      'api.version'
    ],
    logout: [
      'offlineRequests',
      'site.default.locale',
      'qsite.settings',
      'qsite.module.configs',
      'qsite.site.hooks',
      'qtranslation.translations',
      'org-wizard-data',
      'org-wizard-categories',
      'org-wizard-plans',
      'org-wizard-step',
      'api.version'
    ]
  },
  //Cache Time in Seconds
  cacheTime: (3600 * 3),
  //Reset Store
  resetStores: [
    'quserAuth/RESET'
  ],
  //Footer movile main action
  mobilMainAction: {
    icon: 'fas fa-home',
    color: 'primary',
    route: 'app.home'
  }
};
