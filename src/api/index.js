/**
 * API 接口统一管理
 * 基础路径: http://43.142.75.179:83
 */

import { get, post, upload } from '@/utils/request'

// ==================== 用户认证相关 ====================

/**
 * 用户登录（小程序专用）
 */
export const login = (data) => {
  return post('/api/login', data)
}

/**
 * 用户注册
 */
export const register = (data) => {
  return post('/api/register', data)
}

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  return post('/api/userInfo')
}

/**
 * 退出登录
 */
export const logout = () => {
  return post('/api/logout')
}

// ==================== 消防首页/统计 ====================

/**
 * 获取首页统计数据
 */
export const getHomeStats = () => {
  return get('/fire/home')
}

/**
 * 获取公司列表
 * @param {Object} data - 可选查询参数 { keyword: string }
 */
export const getCompanyList = (data) => {
  return post('/fire/company/list', data)
}

/**
 * 获取设备状态统计
 */
export const getEquipmentStats = () => {
  return get('/fire/stats/equipment')
}

/**
 * 获取建筑统计
 */
export const getBuildingStats = () => {
  return get('/fire/stats/building')
}

// ==================== 消防建筑 ====================

/**
 * 获取建筑列表
 */
export const getBuildingList = (data) => {
  return post('/fire/building/list', data)
}

/**
 * 获取建筑详情
 * @param {string|number} id - 建筑ID
 */
export const getBuildingDetail = (id) => {
  return get(`/fire/building/detail/${id}`)
}

/**
 * 新增建筑
 * @param {Object} data - 建筑信息
 */
export const addBuilding = (data) => {
  return post('/fire/building/add', data)
}

/**
 * 编辑建筑
 * @param {Object} data - 建筑信息
 */
export const updateBuilding = (data) => {
  return post('/fire/building/update', data)
}

// ==================== 消防设备 ====================

/**
 * 获取设备列表
 */
export const getEquipmentList = (data) => {
  return post('/fire/equipment/list', data)
}

// ==================== 维保任务 ====================

/**
 * 获取任务列表
 */
export const getTaskList = (data) => {
  return post('/fire/task/list', data)
}

/**
 * 获取任务详情
 */
export const getTaskDetail = (taskId) => {
  return get(`/fire/task/detail/${taskId}`)
}

/**
 * 获取系统列表
 */
export const getSystemsByTaskId = (taskId) => {
  return post(`/fire/task/systems/${taskId}`)
}

/**
 * 获取设备列表（任务下的）
 */
export const getDevicesBySystemId = (systemId) => {
  return post(`/fire/task/devices/${systemId}`)
}

/**
 * 获取检查项列表
 */
export const getItemsByDeviceId = (deviceId) => {
  return post(`/fire/task/items/${deviceId}`)
}

/**
 * 保存检查结果
 */
export const saveCheckResult = (data) => {
  return post('/fire/task/saveCheckResult', data)
}

/**
 * 批量保存检查结果
 */
export const batchSaveCheckResult = (data) => {
  return post('/fire/task/batchSaveCheckResult', data)
}

// ==================== 签到相关 ====================

/**
 * 获取签到列表
 */
export const getCheckInList = (data) => {
  return post('/fire/checkIn/list', data)
}

// ==================== 文件上传 ====================

/**
 * 上传文件
 */
export const uploadFile = (filePath, formData) => {
  return upload(filePath, formData)
}

export default {
  // 认证
  login,
  register,
  getUserInfo,
  logout,
  // 首页
  getHomeStats,
  getCompanyList,
  getEquipmentStats,
  getBuildingStats,
  // 建筑
  getBuildingList,
  getBuildingDetail,
  addBuilding,
  updateBuilding,
  // 设备
  getEquipmentList,
  // 任务
  getTaskList,
  getTaskDetail,
  getSystemsByTaskId,
  getDevicesBySystemId,
  getItemsByDeviceId,
  saveCheckResult,
  batchSaveCheckResult,
  // 签到
  getCheckInList,
  // 文件
  uploadFile
}
