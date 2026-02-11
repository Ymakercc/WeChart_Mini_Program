/**
 * API 接口统一管理
 * 基础路径: http://43.142.75.179:83
 */

import { BASE_URL, get, post, upload } from "@/utils/request";

export { BASE_URL };

// ==================== 用户认证相关 ====================

/**
 * 用户登录（小程序专用）
 */
export const login = (data) => {
  return post("/api/login", data);
};

/**
 * 用户注册
 */
export const register = (data) => {
  return post("/api/register", data);
};

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  return get("/api/user/info");
};

/**
 * 退出登录
 */
export const logout = () => {
  return post("/api/logout");
};

// ==================== 用户菜单 ====================

/**
 * 获取当前用户菜单权限
 */
export const getMenus = () => {
  return get("/api/user/menus");
};

// ==================== 消防首页/统计 ====================

/**
 * 获取首页统计数据
 */
export const getHomeStats = (params) => {
  return get("/fire/home", params);
};

/**
 * 获取当前用户负责的公司列表（用于公司切换）
 */
export const getMyCompanyList = () => {
  return get("/api/fire/company/myList");
};

/**
 * 获取公司列表
 * @param {Object} data - 可选查询参数 { keyword: string }
 */
export const getCompanyList = (data) => {
  return post("/fire/company/list", data);
};

/**
 * 切换当前公司
 * @param {Object} data - { companyId }
 */
export const switchCompany = (data) => {
  return post("/api/fire/company/switch", data);
};

/**
 * 获取公司详情
 */
export const getCompanyDetail = (companyId) => {
  return get(`/api/fire/company/detail/${companyId}`);
};

/**
 * 获取当前选中的公司（从会话中读取）
 */
export const getCurrentCompany = () => {
  return get("/api/fire/company/current");
};

/**
 * 获取设备状态统计
 */
export const getEquipmentStats = () => {
  return get("/fire/stats/equipment");
};

/**
 * 获取建筑统计
 */
export const getBuildingStats = () => {
  return get("/fire/stats/building");
};

// ==================== 消防建筑 ====================

/**
 * 获取建筑列表
 */
export const getBuildingList = (data) => {
  return post("/api/fire/building/list", data);
};

/**
 * 获取建筑详情
 * @param {string|number} id - 建筑ID
 */
export const getBuildingDetail = (id) => {
  return get(`/api/fire/building/detail/${id}`);
};

/**
 * 新增建筑
 * @param {Object} data - 建筑信息
 */
export const addBuilding = (data) => {
  return post("/api/fire/building/add", data);
};

/**
 * 编辑建筑
 * @param {Object} data - 建筑信息
 */
export const updateBuilding = (data) => {
  return post("/api/fire/building/edit", data);
};

/**
 * 根据公司获取建筑列表
 */
export const getBuildingsByCompany = (companyId) => {
  return get(`/api/fire/building/byCompany/${companyId}`);
};

// ==================== 消防设备 ====================

/**
 * 获取设备列表
 */
export const getEquipmentList = (data) => {
  return post("/api/fire/equipment/list", data);
};

/**
 * 获取设备详情
 */
export const getEquipmentDetail = (id) => {
  return get(`/api/fire/equipment/detail/${id}`);
};

/**
 * 新增设备
 */
export const addEquipment = (data) => {
  return post("/api/fire/equipment/add", data);
};

/**
 * 编辑设备
 */
export const editEquipment = (data) => {
  return post("/api/fire/equipment/edit", data);
};

/**
 * 扫码获取设备
 */
export const scanEquipment = (equipmentCode) => {
  return get(`/api/fire/equipment/scan/${equipmentCode}`);
};

/**
 * 报修/故障上报
 */
export const reportFault = (data) => {
  return post("/api/fire/equipment/reportFault", data);
};

// ==================== 维保任务 ====================

/**
 * 获取我的任务列表
 */
export const getMyTaskList = (data) => {
  return post("/api/fire/task/myList", data);
};

/**
 * 获取任务详情
 */
export const getTaskDetail = (taskId) => {
  return get(`/api/fire/task/detail/${taskId}`);
};

/**
 * 获取系统详情
 */
export const getSystemDetail = (recordId) => {
  return get(`/api/fire/task/system/${recordId}`);
};

/**
 * 获取设备详情
 */
export const getDeviceDetail = (recordId) => {
  return get(`/api/fire/task/equipment/${recordId}`);
};

/**
 * 更新检查结果（快速操作）
 */
export const updateCheckResult = (data) => {
  return post("/api/fire/task/updateCheckResult", data);
};

/**
 * 更新故障描述
 * 请求参数{
 *   "recordId": 301,
 *   "faultDescription": "电源箱外壳破损，需要更换"
 * }
 */
export const updateFaultDesc = (data) => {
  return post("/api/fire/task/updateFaultDesc", data);
};

/**
 * 跟新检查详情
 * 请求参数{
  "recordId": 301,
  "checkResult": "2",
  "faultDescription": "电源箱外壳破损，需要更换",
  "otherNotes": "已通知维修人员",
  "faultImages": "http://xxx.com/image1.jpg,http://xxx.com/image2.jpg"
}
 */
export const updateCheckDetail = (data) => {
  return post("/api/fire/task/updateCheckDetail", data);
};

// ==================== 维保测试（巡检管理） =================---

/**
 * 获取巡检登记列表
 */
export const getInspectionList = (data) => {
  return post("/api/fire/inspection/list", data);
};

/**
 * 获取我的巡检列表
 */
export const getMyInspectionList = (data) => {
  return post("/api/fire/inspection/myList", data);
};

/**
 * 获取巡检详情
 */
export const getInspectionDetail = (id) => {
  return get(`/api/fire/inspection/detail/${id}`);
};

/**
 * 新增巡检登记
 */
export const addInspection = (data) => {
  return post("/api/fire/inspection/add", data);
};

/**
 * 修改巡检登记
 */
export const editInspection = (data) => {
  return post("/api/fire/inspection/edit", data);
};

/**
 * 删除巡检登记
 */
export const deleteInspection = (id) => {
  return post(`/api/fire/inspection/delete/${id}`);
};

// ==================== 签到相关 ====================

/**
 * 获取签到列表
 */
export const getCheckInList = (data) => {
  return post("/api/fire/checkIn/list", data);
};

/**
 * 新增签到
 */
export const addCheckIn = (data) => {
  return post("/api/fire/checkIn/add", data);
};

/**
 * 获取签到详情
 */
export const getCheckInDetail = (id) => {
  return get(`/api/fire/checkIn/detail/${id}`);
};

/**
 * 校验打卡范围
 */
export const validateLocation = (data) => {
  return post("/api/fire/checkIn/validateLocation", data);
};

// ==================== 文件上传 ====================

/**
 * 上传文件
 */
export const uploadFile = (filePath, formData) => {
  return upload(filePath, formData);
};

// ==================== 维保报告 ====================

/**
 * 获取报告列表
 */
export const getReportList = (data) => {
  return post("/api/fire/report/list", data);
};

/**
 * 获取报告详情
 */
export const getReportDetail = (id) => {
  return get(`/api/fire/report/detail/${id}`);
};

/**
 * 下载报告URL
 */
export const getReportDownloadUrl = (id) => {
  return `/api/fire/report/download/${id}`;
};

// ==================== 字典数据 ====================

/**
 * 获取系统类型
 */
export const getSystemTypes = () => {
  return get("/api/fire/dict/systemTypes");
};

/**
 * 获取维保类型
 */
export const getInspectionTypes = () => {
  return get("/api/fire/dict/inspectionTypes");
};

export default {
  // 认证
  login,
  register,
  getUserInfo,
  logout,
  getMenus,
  // 首页
  getHomeStats,
  getCompanyList,
  getMyCompanyList,
  switchCompany,
  getCompanyDetail,
  getCurrentCompany,
  getEquipmentStats,
  getBuildingStats,
  // 建筑
  getBuildingList,
  getBuildingDetail,
  getBuildingsByCompany,
  addBuilding,
  updateBuilding,
  // 设备
  getEquipmentList,
  getEquipmentDetail,
  addEquipment,
  editEquipment,
  scanEquipment,
  reportFault,
  // 任务
  getMyTaskList,
  getTaskDetail,
  getSystemDetail,
  getDeviceDetail,
  updateCheckResult,
  updateFaultDesc,
  updateCheckDetail,
  // 巡检
  getInspectionList,
  getMyInspectionList,
  getInspectionDetail,
  addInspection,
  editInspection,
  deleteInspection,
  // 签到
  getCheckInList,
  addCheckIn,
  getCheckInDetail,
  validateLocation,
  // 报告
  getReportList,
  getReportDetail,
  getReportDownloadUrl,
  // 字典
  getSystemTypes,
  getInspectionTypes,
  // 文件
  uploadFile,
};
