import { helper, cache, eventBus } from 'src/plugins/utils';
import appConfig from 'src/setup/app';

class Middleware {
  constructor(router, store) {
    this.router = router;
    this.store = store;
    this.availablesLanguages = config('app.languages.availables');
    this.defaultLanguage = config('app.languages.default');
    this.redirectTo = false;
    this.allowNavigate = true;
    this.historyPage();//Handler to history page
  }

  //Check bearer on URL
  checkBearer(fullPath) {
    return new Promise(async resolve => {
      //Validate if already exista a session
      let sessionData = await cache.get.item('sessionData');
      if (sessionData) return resolve(true);
      //Search bearer on url
      let bearer = helper.getUrlParamByName('authbearer', fullPath);
      //Validate if exist bearer
      if (!bearer) return resolve(true);
      //Set bearer on cache
      await cache.set('sessionData', {
        userToken: 'Bearer ' + bearer,
        expiresIn: helper.getUrlParamByName('expiresatbearer', fullPath)
      });
      //Auth update
      await this.store.dispatch('quserAuth/AUTH_UPDATE');
      //Resolve
      resolve(true);
    });
  }

  //CHeck login
  checkLogin() {
    return new Promise(async (resolve, reject) => {
      try {
        // Validate auth
        let isAuthenticated = process.env.CLIENT ? this.store.state.quserAuth.authenticated : true;
        //try login
        if (!isAuthenticated) isAuthenticated = await this.store.dispatch('quserAuth/AUTH_TRYAUTOLOGIN');
        //Update user data
        else this.store.dispatch('quserAuth/AUTH_UPDATE');
        //Check if should change password
        this.store.dispatch('quserAuth/AUTH_FORCE_PASSWORD');
        //Response
        resolve(isAuthenticated);
      } catch (error) {
        console.error('Error on check login', error);
        reject(error);
      }
    });
  }

  //Catch history page
  historyPage() {
    //Get Event change route, if was for navigator
    window.popStateDetected = false;
    window.addEventListener('load', () => {
      window.history.pushState({}, '');
    });
    window.addEventListener('popstate', async () => {
      window.popStateDetected = true;
      //Close modals
      let closedModal = await this.closeModals();
      //Emit back action
      if (!closedModal) this.emitBackAction();
    });
  }

  //handler to back action in navigator
  closeModals() {
    return new Promise((resolve, reject) => {
      let doBackAction = window.popStateDetected;
      let closedModal = false;

      if (doBackAction) {
        //Close modals
        let modals = document.getElementsByClassName('q-dialog');
        if (modals && modals.length) {
          const lastModal = modals[modals.length - 1];
          if (lastModal && lastModal.__vue__) {
            lastModal.__vue__.$parent.hide(); // Close modal
            closedModal = true;
          }
        }
      }

      window.popStateDetected = false;//Reset prop
      resolve(closedModal);//Response
    });
  }

  //Emit back event
  emitBackAction() {
    //Watch if event was catch
    eventBus.on('back.handler.catch', () => this.allowNavigate = false);
    //Dispatch event
    eventBus.emit('back.handler');
    //Close Event
    eventBus.off('back.handler.catch');
  }

  //Validate if route require authentication
  async validateRoute(to, from) {
    return new Promise(async (resolve, reject) => {
      if (to.meta.authenticated) {
        //If user is authenticated
        if (await this.checkLogin()) {
          //Validate permissions of route
          if (to.meta && to.meta.permission)
            if (!this.store.getters['quserAuth/hasAccess'](to.meta.permission)) this.redirectTo = { name: 'app.home' };

          //Validate mode access permission
          if (appConfig.validateModeAccess && !this.store.getters['quserAuth/hasAccess'](`profile.access.${appConfig.mode}`)) {
            const otherWorkSpace = appConfig.mode == 'iadmin' ? 'ipanel' : 'iadmin';
            //Validate if redirect to other workSpace
            if (this.store.getters['quserAuth/hasAccess'](`profile.access.${otherWorkSpace}`)) {
              const redirectToWorkSpace = window.location.href.replace(appConfig.mode, otherWorkSpace);
              helper.openExternalURL(redirectToWorkSpace, false);
            } else {
              this.redirectTo = { name: 'app.not.authorized' };
            }
            //this.store.dispatch('quserAuth/AUTH_LOGOUT')
          } else if (to.name == 'app.not.authorized') {//Back to home if is authorized
            this.redirectTo = { name: 'app.home' };
          }

          //Validate redirect from URL
          let routeNamesFromRedirect = ['auth.login', 'auth.register'];
          if (routeNamesFromRedirect.includes(from.name) || routeNamesFromRedirect.includes(to.name)) {
            //get local origin Url
            let origenUrl = this.store.state.qsiteApp.baseUrl;
            //Define last navigator history route
            let windowLastRoute = from.query ? from.query.redirectTo : false;
            if (!windowLastRoute) windowLastRoute = to.query ? to.query.redirectTo : false;
            //Define from vue route
            let fromVueRoute = from.query ? from.query.fromVueRoute : false;
            if (!fromVueRoute) fromVueRoute = to.query ? to.query.fromVueRoute : false;

            //validate last navigator history route to redirect
            if (windowLastRoute && windowLastRoute.length &&
              (windowLastRoute.indexOf(origenUrl) >= 0) && (windowLastRoute.indexOf('login') == -1) &&
              (windowLastRoute.indexOf('logout') == -1)) {
              //Redirect last
              return location.href = windowLastRoute;
              //validate last vue router history route to rediret
            } else if (fromVueRoute && !['auth.logout', 'auth.login', 'auth.register'].includes(fromVueRoute)) {
              // Filter params
              const redirectParams = Object.fromEntries(
                Object.entries(from.query).filter(([key]) => key !== 'fromVueRoute')
              );
              //Redirect last
              this.redirectTo = { name: fromVueRoute, query: redirectParams };
            }
          }

          //If is authenticated, redirect page from login to home
          if (!this.redirectTo && (to.name == 'auth.login')) this.redirectTo = { name: 'app.home' };
        } else {//If user not is authenticate
          if (!['auth.login', 'auth.register'].includes(to.name)) this.redirectTo = {
            name: 'auth.login',
            query: { fromVueRoute: to.name, ...to.query }
          };
        }
      }

      if (to.name == 'app.update.app' && to.query.updated) {
        this.redirectTo = {
          name: to.query.fromVueRoute || 'app.home',
          query: { ...JSON.parse(to.query.fromVueRouteQuery) },
          params: { ...JSON.parse(to.query.fromVueRouteParams) }
        };
      }

      //Response
      resolve(true);
    });
  }

  //go to next route
  goToNextRoute(to, from, next) {
    try {
      let locale = (from && from.name) ? helper.getLocaleRouteName(from.name) : false;//Locale to route
      let nextRoute = (this.redirectTo && (this.redirectTo.name != to.name)) ? this.redirectTo : to;//Get next route
      this.store.commit('qsiteApp/SET_CURRENT_ROUTE', (nextRoute));//Update current route

      //Validate if require locale
      if (locale && !helper.getLocaleRouteName(nextRoute.name)) {
        nextRoute = { ...nextRoute, name: `${locale}.${nextRoute.name}` };
      }

      //Remove authbearer from url
      if (to.query.authbearer) {
        delete to.query.expiresatbearer;
        delete to.query.authbearer;
        return next(to)
      }

      //Include fromVueRoter to updatePage
      if (to.name == 'app.update.app' && !to.query.updated && from.name != 'app.update.app') {
        if(from.name) to.query.fromVueRoute = from.name;
        to.query.fromVueRouteParams = JSON.stringify(from.params);
        to.query.fromVueRouteQuery = JSON.stringify(from.query);
        to.query.updated = '1';
        to.fullPath = `${to.path}?${Object.entries(to.query).map(([key, value]) => `${key}=${value}`).join('&')}`;
      }

      //Go to route
      if (nextRoute.name == to.name) return next();
      if (from.name != nextRoute.name) return next(nextRoute);
      return next(false);
    } catch (err) {
      console.error('Navigation error:', err);
      return next(false);
    }
  }
}

//Boot
export default async ({ router, store, app }) => {
  let middleware = new Middleware(router, store);//Define class middleware
  await middleware.checkBearer(window.location.href);//Check bearer
  await middleware.checkLogin();//Check login

  //Handler to any route
  router.beforeEach(async (to, from, next) => {
    try {
      middleware.redirectTo = false;//Reset redirect to

      //Set previous path
      to.meta.previousPath = from.path;

      //Validate if go to next route
      if (!middleware.allowNavigate) {
        middleware.allowNavigate = true;
        return next(false);
      }

      //Validate route authentication and permissions
      await middleware.validateRoute(to, from);

      //Go to next route
      middleware.goToNextRoute(to, from, next);
    } catch (err) {
      console.error('Navigation error:', err);
      return next(false);
    }
  });
}
