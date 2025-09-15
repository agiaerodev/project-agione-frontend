import { Loading } from 'quasar';
import treeSelect from '@tkmam1x/vue3-treeselect';
import crud from 'modules/qcrud/_components/crud';
import innerLoading from 'modules/qsite/_components/master/innerLoading';
import notFound from 'modules/qsite/_components/master/404';
import notAuthorized from 'modules/qsite/_components/master/notAuthorized';
import notResult from 'modules/qsite/_components/master/notResults';
import uploadImg from 'modules/qsite/_components/master/uploadImage';
import dynamicField from 'modules/qsite/_components/master/dynamicField';
import dynamicForm from 'modules/qsite/_components/master/dynamicForm';
import captcha from 'modules/qsite/_components/master/captcha';
import locales from 'modules/qsite/_components/master/locales';
import avatarImage from 'modules/qsite/_components/master/avatarImage';
import headerToApp from 'modules/qsite/_components/master/headerToApp';
import shareLink from 'modules/qsite/_components/master/shareLink';
import btnMenu from 'modules/qsite/_components/master/btnMenu';
import masterModal from 'modules/qsite/_components/master/masterModal';
import pageActions from 'modules/qsite/_components/master/pageActions';
import crudComponent from 'modules/qcrud/_components/v2/crud';
import kanban from 'modules/qsite/_components/master/kanban/index.vue';
import folders from 'modules/qsite/_components/master/folders/index.vue';
import promiseTemplate from 'modules/qsite/_components/master/promiseTemplate/index.vue';
import activities from 'modules/qgamification/_components/categoryView/index.vue';
import helpText from 'modules/qsite/_components/master/helpText.vue';


export default ({ app }) => {
  //Components
  let components = [
    { name: 'crud', component: crud },
    { name: 'tree-select', component: treeSelect },
    { name: 'inner-loading', component: innerLoading },
    { name: 'not-found', component: notFound },
    { name: 'not-authorized', component: notAuthorized },
    { name: 'not-result', component: notResult },
    { name: 'upload-image', component: uploadImg },
    { name: 'dynamic-field', component: dynamicField },
    { name: 'dynamic-form', component: dynamicForm },
    { name: 'captcha', component: captcha },
    { name: 'locales', component: locales },
    { name: 'avatar-image', component: avatarImage },
    { name: 'header-app', component: headerToApp },
    { name: 'share-link', component: shareLink },
    { name: 'btn-menu', component: btnMenu },
    { name: 'master-modal', component: masterModal },
    { name: 'page-actions', component: pageActions },
    { name: 'crud-component', component: crudComponent },
    { name: 'kanban', component: kanban },
    { name: 'folders', component: folders },
    { name: 'promiseTemplate', component: promiseTemplate },
    { name: 'activities', component: activities },
    { name: 'help-text', component: helpText }
  ];

  //Register components
  components.forEach(item => app.component(item.name, item.component));

  //Hidde loading
  Loading.hide();
}
