import { alert, i18n, cache } from 'src/plugins/utils'
import app from '/src/setup/app.js'

class Helper {
  constructor() {
    this.dynamicSelectList = {};
  }

  // get the list of categories of the dynamic field
  getDynamicSelectList() {
    return this.dynamicSelectList;
  }

  setDynamicSelectList(data) {
    this.dynamicSelectList = {
      ...data
    };
  }

  //return timestamp in seconds unix
  timestamp(date = false) {
    if (!date) {
      date = new Date()
    }//Current date
    else {
      date = new Date(date)
    }
    return date.getTime()
  }

  //mask value with format phone US
  maskPhone(number) {
    if (number) {
      let value = this.getInt(number)
      let response = ''

      if (value) {
        value = value.toString()
        value.length >= 1 ? response += '(' : false
        response += value.substr(0, 3)
        value.length >= 4 ? response += ') ' : false
        response += value.substr(3, 3)
        value.length >= 7 ? response += '-' + value.substr(6, 4) : false
      } else {
        response = value ? value[0] : ''
      }

      return response
    } else {
      return number
    }
  }

  //get only numbers from a string
  getInt(value) {
    let regex = /(\d+)/g
    let response = value.match(regex)
    response = response ? response.join('') : response

    return response
  }

  //Return alphanumeric and symbol (-)
  getSlug(str) {
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·_,:;";
    var to = "aaaaeeeeiiiioooouuuunc-----";
    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    //Replace symbols
    str = str.replace(/[^\w /]+/g, ' ').trim()
      .replace(/ +/g, '-')

    return str;
  }

  //Return range date
  rangeDate(type) {
    type ? true : type = 'today'

    let from = new Date() //Create object date
    let to = new Date() //Create object date
    switch (type) {
      case 'today':
        break
      case 'yesterday':
        from.setSeconds(-86400)
        to.setSeconds(-86400)
        break
      case 'tomorrow':
        from.setSeconds(86400)
        to.setSeconds(86400)
        break
      case 'currentMonth':
        from.setDate(1)
        to = new Date(to.getFullYear(), from.getMonth() + 1, 0)
        break
      case 'lastMonth':
        from = new Date(from.getFullYear(), from.getMonth() - 1, 1)
        to = new Date(to.getFullYear(), to.getMonth(), 0)
        break

    }

    return {
      from: from.getFullYear() + '/' + (from.getMonth() + 1) + '/' + from.getDate(),
      to: to.getFullYear() + '/' + (to.getMonth() + 1) + '/' + to.getDate(),
    }
  }

  //set names months in dom*/
  nameMonths() {
    var d = new Date()
    var mount = d.getMonth()
    var months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    return [
      {label: months[(mount != 0) ? (mount - 1) : 11], value: 'lastMonth'},
      {label: months[mount], value: 'currentMonth'},
      {label: 'Today', value: 'today'}
    ]
  }

  //load latitude and longitude
  async loadPosition() {
    try {
      const position = await this.getCurrentPosition()
      return position.coords
    } catch (error) {
    }
  }

  // get position of navigator
  getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      navigator.permissions.query({'name': 'geolocation'})
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  }

  //Convert fields to frontend
  convertToFrontField(fields = [], mergeFields = []) {
    let response = {}

    //Merge fields
    if (mergeFields.length) {
      mergeFields.forEach(mergeField => {
        //Search merge field name in fields

        var existField = false
        fields.forEach((field, index) => {
          if (field.name == mergeField.name) {
            existField = true
            if (mergeField.value) {
              fields[index] = mergeField
            } else {
              fields[index].id = mergeField.id
            }
          }
        })

        if (!existField) {
          fields.push(mergeField)
        }
      })
    }
    //Conver fields
    fields.forEach(field => {
      response[field.name] = field
    })
    return response
  }

  //Convert to backend fields
  convertToBackField(fields) {
    let response = []
    for (var field in fields) {
      response.push(fields[field])
    }
    return response
  }

  //Convert strings to snake_case
  convertStringToSnakeCase(string) {
    return string.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

    /* -> OLD
    return string.replace(/[\w]([A-Z0-9])/g, function (m) {
      return m[0] + '_' + m[1]
    }).toLowerCase()
    */
  }

  //Convert object keys to snake_case
  toSnakeCase(object, params = {}) {
    //Items to ignore when try to convert to snakeCase
    const notToSnakeCase = [...(params.notToSnakeCase || []), ...["options", "fields", "settings", "permissions"]]
    const keysNotToSnakeCase = (params.keysNotToSnakeCase || []);
    //function recursive to loop all items from object
    let convertObject = (dataObject) => {
      let response = {}//Object to save fields vonverted
      //Loop all items for convert

      for (var item in dataObject) {
        let itemValue = dataObject[item]//Value from item
        if (!notToSnakeCase.includes(item)) {
          //If value is object, also convert value
          if ((typeof itemValue === 'object' && itemValue !== null)) {
            if (Array.isArray(itemValue)) {
              itemValue = itemValue.map(item => (typeof item == 'object') ? convertObject(item) : item)
            } else itemValue = convertObject(dataObject[item])

            //itemValue = convertObject(dataObject[item])
          }
          //Add to response new Key with Value
          let objKey = keysNotToSnakeCase.includes(item) ? item : this.convertStringToSnakeCase(item);
          response[objKey] = (itemValue !== undefined) ? itemValue : null;
        } else {
          response[item] = itemValue
        }
      }
      return response
    }
    return convertObject(object)//Return response
  }

  snakeToCamelCaseKeys(obj) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key) {
        const newKey = this.snakeToCamelCase(key);
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            newObj[newKey] = this.snakeToCamelCaseKeys(value);
        } else if((Array.isArray(value) && typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean')){
            newObj[newKey] = Object.values(this.snakeToCamelCaseKeys(value));
        }else{
            newObj[newKey] = value;
        }
      }
    }
    return newObj;
  }

  //Convert object keys to snake_case
  objToArrayDeep(object) {
    //function recursive to loop all items from object
    let convertToArray = (dataObject) => {
      let response = []//Array to save fields vonverted
      //Loop all items for convert
      for (var itemName in dataObject) {
        let itemValue = dataObject[itemName]//Value from item
        //If value is object, also convert value
        if ((typeof itemValue === 'object' && itemValue !== null)) {
          itemValue = convertToArray(dataObject[itemName])
        }
        //Add to response new Key with Value
        response[itemName] = (itemValue !== undefined) ? itemValue : null
      }
      return response
    }
    return convertToArray(object)//Return response
  }

  checkPassword(password) {
    // Must be at least 8 characters and contain a at least 1 lowercase character, at least 1 uppercase character and a number.
    return password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/)
  }

  //redirect to google maps with encode address
  map(address) {
    if /* if we're on iOS, open in Apple Maps */
    ((navigator.platform.indexOf('iPhone') != -1) ||
      (navigator.platform.indexOf('iPod') != -1)) {
      window.open('maps://maps.google.com/maps?q=' + encodeURI(address))
    } else /* else use Google */{
      window.open('https://maps.google.com/maps?q=' + encodeURI(address))
    }
  }

  //Validate Format of email
  validateEmail(email) {
    var re = /\S+@\S+\.\S+/
    return re.test(email);
  }

  //Filter options to select
  filterOptions(val, options, permitValues) {
    if (val === '') return options
    let responseOptions = []//Response options
    //Filter
    for (let opt of options) {
      //Search in options
      if (JSON.stringify(opt).toLowerCase().indexOf(val.toLowerCase()) > -1)
        responseOptions.push(opt)
      //IF exist param permitvalues, compare if option exist
      else if (permitValues) {
        let optValue = opt.value.toString()//Parse value
        if (typeof (permitValues) == 'object') {
          permitValues.forEach(item => {
            if (item.toString() == optValue) responseOptions.push(opt)
          })
        } else if (permitValues.toString() == optValue) responseOptions.push(opt)
      }
    }
    //Response
    return responseOptions
  }

  //Open external URL
  openExternalURL(url, newWindow = true) {
    if (url.indexOf('http') == -1) url = `https://${url}`
    if (newWindow) window.open(url, '_blank')
    else window.location.href = url
  }

  //Get locale from route name
  getLocaleRouteName(routeName = false) {
    let response = false//Default response
    let availablesLanguages = config('app.languages.availables') || []
    if (routeName) {
      let routeNameSegment = routeName.split('.')//Split route name
      let firstSegment = routeNameSegment[0]//Get first segment form route name
      //Validate if first segmente it's a locale and set as locale
      if (availablesLanguages.indexOf(firstSegment) != -1) response = firstSegment
    }
    return response//Response
  }

  //Get locale from route path
  getLocaleRoutePath(routePath = false) {
    let response = false//Default response
    let availablesLanguages = config('app.languages.availables') || []
    routePath = routePath.replace('#/', '')//Parse path
    if (routePath) {
      let routeNameSegment = routePath.split('/')//Split route name
      let firstSegment = routeNameSegment[0]//Get first segment form route name
      //Validate if first segmente it's a locale and set as locale
      if (availablesLanguages.indexOf(firstSegment) != -1) response = firstSegment
    }
    return response//Response
  }

  //Method to load google maps
  loadGoogleMaps(key) {
    let autocompleteGoogle = document.querySelector("script[rel=apiGmaps]")
    if (!autocompleteGoogle)
      autocompleteGoogle = document.createElement('script')
    autocompleteGoogle.setAttribute('src', `https://maps.googleapis.com/maps/api/js?key=${key}&extension=.js&output=embed`)
    autocompleteGoogle.setAttribute('rel', 'apiGmaps')
    document.head.appendChild(autocompleteGoogle)
  }

  //Load CDN
  loadCDN(path) {
    let scripToCDN = document.createElement('script')
    scripToCDN.setAttribute('src', path)
    document.head.appendChild(scripToCDN)
  }

  //Append Script header
  appendScriptStringHead(scriptString) {
    return document.head.insertAdjacentHTML('beforeend', scriptString)
  }

  //validate rules
  validateRules(params = {}) {
    let response = true
    let rules = params.rules || []
    let value = params.value || false

    //Validate rules
    rules.forEach(rule => {
      if (typeof rule(value) == 'string') response = false
    })

    //Response
    return response
  }

  //Add history
  addHistory() {
    window.history.pushState("forward", null, "");
  }

  //Back history
  backHistory() {
    window.history.back()
  }

  //Copy to clipboard
  copyToClipboard(text = '', message = 'isite.cms.messages.copyToClipboard') {
    try {
      navigator.clipboard.writeText(text).then(function () {
        alert.info({
          icon: 'fas fa-copy',
          message: i18n.tr(message)
        });
      }, function (err) {
        alert.error({
          icon: 'fas fa-copy',
          message: i18n.tr('isite.cms.messages.failedCopyToClipboard')
        });
      });
    } catch (error) {
      alert.error({
        icon: 'fas fa-copy',
        message: i18n.tr('isite.cms.messages.failedCopyToClipboard')
      });
    }
  }

  //get base 64 from file
  getBase64(file) {
    return new Promise((resolve, reject) => {
      //Validate blob file (images)
      if (file.__img) {
        let srcFile = file.__img.src
        if (srcFile.indexOf('blob') == -1) return resolve(srcFile)
      }
      //Get base 64 from file
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        resolve(reader.result);
      };
    })
  }

  //Convert data url to file
  urlToFile(url, filename, mimeType) {
    return (
      fetch(url).then(function (res) {
        return res.arrayBuffer();
      }).then(function (buf) {
        return new File([buf], filename, {type: mimeType});
      })
    );
  }

  //Get params from url
  getUrlParamByName(name, url) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
  }

  //Download from url
  downloadFromURL(url) {
    let a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.click()
    a.remove()
  }

  //Convert bytes to human read
  formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Bytes';
    var k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  //Convert to capitalize
  toCapitalize(string, eachWord = false) {
    let response = []
    let words = eachWord ? string.split(" ") : [string]
    //Convert to capitalize
    words.forEach(word => response.push(word.charAt(0).toUpperCase() + word.slice(1)))
    //response
    return response.join(" ")
  }

  //Play sound notify
  playSound(params) {
    var audio = new Audio(params.url);
    audio.volume = params.volume || 1
    audio.play();
  }

  //Validate if values is only alphanumeric
  validateAlphaNumeric(val) {
    var re = /^[a-z0-9]+$/i
    return re.test(val);
  }

  //Validate if values is only slugable
  validateSlugFormat(val) {
    var re = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/
    return re.test(val);
  }

  //Return shifts time options by intervals of 5 minutes until 8 hours
  getShiftTimeOptions(params = {}) {
    //parse params data
    params = {hours: 'Horas', hour: 'Hora', minutes: 'Minutos', and: 'Y', ...params}

    let response = []//Instance default response
    let minutes = 5//Instance minutes
    let hours = 0//Intance hours

    //Lopp each hour until 8 hours
    while (hours <= 8) {
      //Instance label to hours
      let labelHours = hours ? `${hours} ${hours >= 2 ? params.hours : params.hour}` : ''
      //Add to response de hour lopt
      if (hours) response.push({label: labelHours, value: (hours * 60)})
      //Loop intervals of 5 minutes
      while (minutes <= 55) {
        //Add option of minutes
        response.push({
          label: labelHours + (hours ? ` ${params.and}` : '') + ` ${minutes} ${params.minutes}`,
          value: minutes + (hours * 60)
        })
        //Sum 5 minutes to loop
        minutes += 5
      }
      hours += 1//Sum 1 hour to loop
      minutes = 5//Restore minutes to 5 minutes to loop
    }


    //Response
    return response
  }

  //Validate textColor according to background
  pickTextColor(bgColor, lightColor = '#FFFFFF', darkColor = "#000000") {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? darkColor : lightColor;
  }

  //Return local baseUrl
  getBaseURl(baseUrl = false) {
    let tagsToParceHost = ['http://', 'https://', ':8080', ':3000', 'www.']
    //Get base url
    let rootHost = baseUrl || window.location.host
    let host = rootHost
    //Parse host if not exist in .env
    if (!baseUrl) {
      tagsToParceHost.forEach(tagToReplace => host = host.replace(tagToReplace, ''))
      if (rootHost.indexOf('www') != -1) host = `www.${host}`//Set again WWW
      host = `https://${host}` //Add protocol
    }
    //Response
    return host
  }

  //snakeCase to Camel
  snakeToCamelCase(str) {
    return str.toLowerCase().replace(/([-_][a-z])/g, group =>
      group
        .toUpperCase()
        .replace('-', '')
        .replace('_', '')
    );
  }

  // validate Url
  validateUrl(url) {
    return /^(http|https):\/\/[^\s/$.?#].[^\s]*$/.test(url)
  }

  //snakeCase to Camel
  async convertStringToObject() {
    try {
      let url = "";
      const origin = window.location.href.split("?");
      if (origin.length === 2) {
        url = origin[1] || "";
      }
      if (url.length > 0) {
        const regex = /=/g;
        const regex2 = /&/g;
        const remplaceFilter = url.replace(regex, ":").replace(regex2, ",");
        const remplaceObject = eval("({" + remplaceFilter + "})");
        Object.keys(remplaceObject).forEach((key) => {
          //[ptc]
          // if (Vue.prototype.$filter.fields.hasOwnProperty(key)) {
          //   remplaceObject[key] = String(remplaceObject[key]);
          // }
        });
        return remplaceObject || {};
      }
      return {};
    } catch (error) {
      alert.error('The filter url is misspelled');
      console.log(error);
    }
  }

  //Return the module and entity name from permission string
  getInfoFromPermission(permission) {
    if (!permission) return null
    //Parse Route Permission
    let splitPermission = permission.split('.')
    //Instance the response
    return {
      module: (splitPermission[0] == 'profile') ? 'iprofile' : splitPermission[0],
      entity: splitPermission[1]
    }
  }

  arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    let sortedArr1 = arr1.slice().sort();
    let sortedArr2 = arr2.slice().sort();

    for (let i = 0; i < sortedArr1.length; i++) {
      if (sortedArr1[i] !== sortedArr2[i]) return false;
    }

    return true;
  }

  //Copy to clipboard Base64
  async copyBase64ToClipboard(base64 = '', message = 'isite.cms.messages.copyToClipboard') {
    try {
      //Get blob of base64Image
      const blob = await fetch(base64).then(r => r.blob())
      //Transform in a clipboard
      const image = new ClipboardItem({'image/png': blob})

      navigator.clipboard.write([image]).then(function () {
        alert.info({
          icon: 'fas fa-copy',
          message: i18n.tr(message)
        });
      }, function (err) {
        alert.error({
          icon: 'fas fa-copy',
          message: i18n.tr('isite.cms.messages.failedCopyToClipboard')
        });
      });
    } catch (error) {
      alert.error({
        icon: 'fas fa-copy',
        message: i18n.tr('isite.cms.messages.failedCopyToClipboard')
      });
    }
  }

  //Depp merge objects
  deepMergeObjects(obj1, obj2) {
    // Create a new object to hold the merged values
    let result = {...obj1};

    // Iterate over the properties of the second object
    for (let key in obj2) {
      // If the property is an object and exists in both, merge them
      if (typeof obj2[key] === 'object' && obj1[key]) {
        result[key] = this.deepMergeObjects(obj1[key], obj2[key]);
      } else {
        // Otherwise, just use the property from the second object
        result[key] = obj2[key];
      }
    }

    return result;
  }
  detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();

    let device = "Unknown";
    let version = "Unknown";

    if (/iphone|ipad|ipod/.test(userAgent)) {
      device = "iPhone/iPad/iPod";
      const versionMatch = userAgent.match(/os (\d+_\d+)/);
      if (versionMatch) {
        version = versionMatch[1].replace('_', '.');
      }
    } else if (/android/.test(userAgent)) {
      device = "Android";
      const versionMatch = userAgent.match(/android (\d+(\.\d+)?)/);
      if (versionMatch) {
        version = versionMatch[1];
      }
    } else if (/macintosh|mac os x/.test(userAgent)) {
      device = "MacOs";
      const versionMatch = userAgent.match(/mac os x (\d+[_\d]+)/);
      if (versionMatch) {
        version = versionMatch[1].replace(/_/g, '.');
      }
    } else if (/windows/.test(userAgent)) {
      device = "Windows";
      const versionMatch = userAgent.match(/windows nt (\d+(\.\d+)?)/);
      if (versionMatch) {
        version = versionMatch[1];
      }
    }

    return `${device} ${version}`;
  }
  documentationLink(path, token) {
    const baseUrl = app.kbBaseUrl
    
    const url = `${baseUrl}${path}`
    const parsedUrl = new URL(url);
    const hash = parsedUrl.hash ? parsedUrl.hash : ''
    const href = `${url.replace(/#.*$/, '')}?token=${token}${hash}`
    
    return (`
      <a 
      href='${href}'
      target='_blank'
      class='tw-text-blue-500'>
        Learn more
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
    `)
  }
  async getToken() {
    try {
      const sessionData = await cache.get.item('sessionData')
      return sessionData.userToken.replace('Bearer ', '')
    } catch (error) {
      console.log(error)
    }
  }

  // Function to get route params that match keys from data
  getRouteParams(route, data) {
    // Extract param names from the resolved route (using regex on route.path)
    const paramNames = (route.path.match(/:(\w+)/g) || []).map((param) => param.substring(1));

    // Filter data to include only keys that match param names
    const params = Object.fromEntries(
      Object.entries(data).filter(([key]) => paramNames.includes(key))
    );

    return params;
  }
}

const helper = new Helper();

export default helper;

export {helper}