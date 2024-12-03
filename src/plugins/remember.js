
import { helper, cache } from 'src/plugins/utils'

class Remember {
  /*Return data in cache*/
  sync(key, seconds, callback) {
    cache.get.item(key).then(response => {
      let data = response
      let difference = data ? this.timestamp() - data.updated_at : seconds
      if (difference >= seconds || !data) {
        return callback()
      } else {
        return data.data
      }
    }).catch(error => {
    })
  }

  /*Return data in cache*/
  async(params = {}) {
    return new Promise(async (resolve, reject) => {
      params = {key: false, seconds: (3600 * 3), callBack: false, refresh: false, ...params}//Validate params
      let cacheData = await cache.get.item(params.key)//Get data from 
      let responseData = params.refresh ? null : cacheData//Get data from
      let currentDateInSeconds = (new Date().getTime() / 1000)//Current date in seconds
      let dataError = false //To errors

      //Validate if was expired
      if (responseData && responseData.expiresIn) {
        if (currentDateInSeconds >= responseData.expiresIn) {
          if (navigator.onLine) await cache.remove(params.key)
          responseData = false
        }
      } else responseData = false

      //Request data
      if (!responseData && (typeof params.callBack == 'function')) {
        //Do callback
        await params.callBack().then(async response => {
          //Transform response data
          if (!dataError){
            responseData = {
              data: response.data.data || response.data,
              meta: response.data.meta || {},
              status: response.status,
              expiresIn: (currentDateInSeconds += params.seconds)
            }
          }else
            responseData = {
              data: dataError.data,
              status: dataError.status,
            }

          //Save in cache
          if (navigator.onLine) {
            await cache.set(params.key, responseData);
          }
        }).catch(error => {
          dataError = error
          if(!navigator.onLine) responseData = cacheData
        })
      }

      //Response
      responseData ? resolve(responseData) : reject(dataError)
    })
  }

  refresh(key, data) {
    cache.get.item(key).then(response => {
      try {
        cache.set(key, {
          data: data,
          meta: response.data.meta ? response.data.meta : '',
          updated_at: helper.timestamp()
        })
      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
    })

  }

  flush(key) {
    cache.remove(key)
  }
}

const remember = new Remember()

export {remember}
