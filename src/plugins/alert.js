//Plugins
import {Notify} from 'quasar'
import {Dialog} from 'quasar'

//Components
import alertModal from 'src/modules/qsite/_components/master/alertModal'

class Alert {
  constructor() {
    this.defaultParams = {
      message: 'Notify',
      progress: true,
      pos: 'bottom-right',
      action: false,
      timeOut: 4000,
      actions: [],
      color: 'primary',
      textColor: 'grey',
      ...config('app.alert')
    }
  }

  //custom Alert
  custom(params = {}) {
    params = {...this.defaultParams, ...params}
    //Show
    if (params.mode && (params.mode == 'modal')) this.showModal(params)
    else this.showNotify(params)
  }

  //Return merged global params
  getGlobalParams(params) {
    //if not is modal and not has message, set all params as message
    if ((!params.mode || (params.mode != 'modal')) && !params.message) params = {message: params}
    //Merge with default params
    params = {...this.defaultParams, ...params}
    //Repsonse
    return params
  }

  //alert standar
  standar(params = {}){
    params = this.getGlobalParams(params)
    params.icon = params.icon || 'fa-light fa-bell'
    params.color = 'bg-grey-14'
    //Show
    if (params.mode && (params.mode == 'modal')) this.showModal(params)
    else {
      params.textColor = 'grey-14'
      this.showNotify(params)
    }
  }

  //Alert success
  success(params = {}) {
    params = this.getGlobalParams(params)
    params.icon = params.icon || 'fa-light fa-bell'
    params.color = 'green-5'
    //Show
    if (params.mode && (params.mode == 'modal')) this.showModal(params)
    else {
      params.textColor = 'green-5'
      this.showNotify(params)
    }
  }

  //Alert Error
  error(params = {}) {
    params = this.getGlobalParams(params)
    params.icon = params.icon || 'fa-solid fa-circle-xmark'
    params.color = 'red-5'
    //Show
    if (params.mode && (params.mode == 'modal')) this.showModal(params)
    else {
      params.textColor = 'red-5'
      this.showNotify(params);
    }
  }

  //Alert info
  info(params = {}) {
    params = this.getGlobalParams(params)
    params.icon = params.icon || 'fas fa-info-circle'
    params.color = 'light-blue-6'
    //Show
    if (params.mode && (params.mode == 'modal')) this.showModal(params)
    else {
      params.textColor = 'light-blue-6'
      this.showNotify(params);
    }
  }

  //Alert warning
  warning(params = {}) {
    params = this.getGlobalParams(params)
    params.icon = params.icon || 'fa fa-warning'
    params.color = 'orange-12'
    //Show
    if (params.mode && (params.mode == 'modal')) this.showModal(params)
    else {
      params.textColor = 'orange-12'
      this.showNotify(params)
    }
  }

  //Alert light
  light(params = {}) {
    params = this.getGlobalParams(params)
    params.icon = params.icon || 'fa-light fa-bell'
    params.color = 'faded'
    //Show
    if (params.mode && (params.mode == 'modal')) this.showModal(params)
    else {
      params.textColor = 'grey-8'
      this.showNotify(params)
    }
  }

  //Alert dark
  dark(params = {}) {
    params = this.getGlobalParams(params)
    params.icon = params.icon || 'fa-light fa-bell'
    params.color = 'black'
    //Show
    if (params.mode && (params.mode == 'modal')) this.showModal(params)
    else {
      params.textColor = 'dark'
      this.showNotify(params)
    }
  }

  //Show Notify
  showNotify(params) {
    //Added title if exist
    const message = params.title ? `
    <strong class="notify__title">${params.title}</strong>
    <br/>
    <span>${params.message}</span>
    ` : params.message

    Notify.create({
      ...params,
      message: message,
      icon: params.icon,
      progress: params.progress,
      timeout: params.action ? 0 : (params.timeout ?? params.timeOut),
      color: params.color,
      textColor: params.textColor,
      position: params.pos,
      actions: params.actions.length ? params.actions : [{icon: 'fa-light fa-xmark', color: 'gray', round: true}],
      html: true
    })
  }

  //Show modal
  showModal(params) {
    Dialog.create({
      component: alertModal,
      componentProps: {
        params: params
      }
    })
  }
}

const alert = new Alert()

export default alert

export {alert}
