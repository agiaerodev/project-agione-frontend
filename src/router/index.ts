import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { StateInterface } from '../store';
//import routes from './routes';
import configRoutes from '../setup/localRoutes'
import pluginRouter from 'src/plugins/router'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route<StateInterface>(function (/* { store, ssrContext } */) {
  const dynamicRoutes = configRoutes.getRoutes()

  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: dynamicRoutes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.VUE_ROUTER_BASE
    ),
  });

  Router.onError((error) => {
    console.log(error)
    if (/chunk/.test(error.message)) {
      console.warn("Error chunk", error);
      window.location.reload();
    }
  });

  pluginRouter.setRouter(Router)

  return Router;
});
