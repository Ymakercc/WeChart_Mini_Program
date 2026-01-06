/**
 * 统一请求封装
 * 基础路径: http://43.142.75.179:83
 */

// 接口基础路径
// H5 开发环境使用代理（通过 /api 前缀），其他端使用完整地址
// let BASE_URL = 'http://43.142.75.179:83'  // 正式服务器地址
let BASE_URL = 'http://127.0.0.1:83'  // 正式服务器地址

// 判断是否为 H5 环境 (浏览器环境)
// #ifdef H5
BASE_URL = '/api'
// #endif

// Token 存储 key
const TOKEN_KEY = 'token'

/**
 * 获取存储的 Token
 */
export const getToken = () => {
  return uni.getStorageSync(TOKEN_KEY)
}

/**
 * 设置 Token
 */
export const setToken = (token) => {
  uni.setStorageSync(TOKEN_KEY, token)
}

/**
 * 移除 Token
 */
export const removeToken = () => {
  uni.removeStorageSync(TOKEN_KEY)
}

/**
 * 封装的请求方法
 * @param {Object} options - 请求配置
 * @param {String} options.url - 请求路径（不含基础路径）
 * @param {String} options.method - 请求方法 GET/POST/PUT/DELETE
 * @param {Object} options.data - 请求数据
 * @param {Boolean} options.loading - 是否显示加载中，默认 true
 * @param {Boolean} options.showError - 是否显示错误提示，默认 true
 */
export const request = (options) => {
  return new Promise((resolve, reject) => {
    // 显示加载中
    if (options.loading !== false) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
    }

    // 获取 Token
    const token = getToken()

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': options.contentType || 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        // 隐藏加载中
        if (options.loading !== false) {
          uni.hideLoading()
        }

        // 请求成功
        if (res.statusCode === 200) {
          const data = res.data
          
          // 业务成功 (RuoYi 返回 code: 0 或 200 表示成功)
          if (data.code === 0 || data.code === 200) {
            resolve(data)
          } 
          // 未登录或 Token 过期
          else if (data.code === 401) {
            removeToken()
            uni.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none'
            })
            // 跳转到登录页
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/index'
              })
            }, 1500)
            reject(data)
          } 
          // 其他业务错误
          else {
            if (options.showError !== false) {
              uni.showToast({
                title: data.msg || '请求失败',
                icon: 'none'
              })
            }
            reject(data)
          }
        } else {
          // HTTP 状态码错误
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        // 隐藏加载中
        if (options.loading !== false) {
          uni.hideLoading()
        }
        
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * GET 请求
 */
export const get = (url, data, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

/**
 * POST 请求
 */
export const post = (url, data, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 */
export const put = (url, data, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 */
export const del = (url, data, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * 文件上传
 */
export const upload = (filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    uni.showLoading({
      title: '上传中...',
      mask: true
    })

    uni.uploadFile({
      url: BASE_URL + '/common/upload',
      filePath: filePath,
      name: 'file',
      formData: formData,
      header: {
        'Authorization': getToken() ? `Bearer ${getToken()}` : ''
      },
      success: (res) => {
        uni.hideLoading()
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          if (data.code === 0 || data.code === 200) {
            resolve(data)
          } else {
            uni.showToast({
              title: data.msg || '上传失败',
              icon: 'none'
            })
            reject(data)
          }
        } else {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default {
  request,
  get,
  post,
  put,
  del,
  upload,
  getToken,
  setToken,
  removeToken,
  BASE_URL
}
