<template>
  <view class="page" :class="{ firetest: recordType === '1' }">
    <!-- 导航栏 -->
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      title="设备列表"
      :background-color="recordType === '1' ? '#ff9800' : '#e53935'"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <view class="content">
      <!-- 系统标题头部 -->
      <view class="system-header">
        <text class="header-icon">📋</text>
        <text class="header-title">{{ systemInfo.itemName || "系统" }}</text>
      </view>

      <!-- 设备列表 -->
      <scroll-view class="device-list" scroll-y>
        <view
          class="device-card"
          v-for="item in deviceList"
          :key="item.recordId"
          @tap="goDeviceDetail(item)"
        >
          <!-- 设备名称和标签 -->
          <view class="device-header">
            <text class="device-name">{{ item.itemName }}</text>
          </view>

          <!-- 统计信息 -->
          <view class="device-stats">
            <text class="stat-item">总项 {{ item.totalItems || 0 }}</text>
            <text class="stat-item">已完成 {{ item.completedItems || 0 }}</text>
            <text class="stat-item"
              >未完成 {{ item.uncompletedItems || 0 }}</text
            >
          </view>

          <!-- 右侧状态和箭头 -->
          <view class="device-right">
            <view
              class="status-badge"
              :class="
                item.completedItems >= item.totalItems && item.totalItems > 0
                  ? 'completed'
                  : 'pending'
              "
            >
              <text>{{
                item.completedItems >= item.totalItems && item.totalItems > 0
                  ? "已完成"
                  : "未完成"
              }}</text>
            </view>
            <view class="action-btn-wrapper" v-if="recordType === '1'">
              <button class="btn-maintain" @tap.stop="openMaintenance(item)">
                维护
              </button>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading-state" v-if="loading">
          <text>加载中...</text>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="deviceList.length === 0 && !loading">
          <text class="empty-text">暂无设备数据</text>
        </view>
      </scroll-view>
    </view>

    <!-- 维护信息弹窗 -->
    <uni-popup ref="maintenancePopup" type="bottom" background-color="#fff">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">设备维护信息</text>
          <text class="popup-close" @tap="closeMaintenance">×</text>
        </view>
        <scroll-view scroll-y class="popup-form">
          <view class="form-item">
            <text class="label">设备位置</text>
            <input
              class="input"
              v-model="maintenanceForm.deviceLocation"
              placeholder="请输入设备位置"
            />
          </view>
          <view class="form-item">
            <text class="label">测试情况</text>
            <textarea
              class="textarea"
              v-model="maintenanceForm.testSituation"
              placeholder="请输入测试情况"
            />
          </view>
          <view class="form-item">
            <text class="label">测试结果</text>
            <textarea
              class="textarea"
              v-model="maintenanceForm.testResult"
              placeholder="请输入测试结果"
            />
          </view>
          <view class="form-item">
            <text class="label">现场照片</text>
            <view class="image-list">
              <view
                class="image-item"
                v-for="(img, index) in maintenanceForm.sitePhotosList"
                :key="index"
              >
                <image :src="img" mode="aspectFill" @tap="previewImage(img)" />
                <text class="delete-btn" @tap="deleteImage(index)">×</text>
              </view>
              <view
                class="image-add"
                @tap="chooseImage"
                v-if="maintenanceForm.sitePhotosList.length < 5"
              >
                <uni-icons type="plusempty" size="30" color="#999"></uni-icons>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="popup-footer">
          <button
            class="btn-submit"
            @tap="submitMaintenance"
            :loading="submitting"
          >
            保存维护信息
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onShow } from "@dcloudio/uni-app";
import { ref } from "vue";

const recordId = ref(null);
const recordType = ref("0");
const loading = ref(false);
const systemInfo = ref({});
const deviceList = ref([]);

const maintenancePopup = ref(null);
const submitting = ref(false);
const maintenanceForm = ref({
  recordId: null,
  deviceLocation: "",
  testSituation: "",
  testTime: "",
  testResult: "",
  sitePhotosList: [],
});

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 加载设备列表
const loadDeviceList = async () => {
  if (!recordId.value) return;

  try {
    loading.value = true;
    const res = await api.getSystemDetail(recordId.value);

    if (res.code === 200 || res.code === 0) {
      const data = res.data || {};
      // 系统信息
      if (data.system) {
        systemInfo.value = data.system;
      }
      // 设备列表
      deviceList.value = (data.equipments || []).filter(
        (item) => item.recordType === recordType.value,
      );
    }
  } catch (e) {
    console.error("获取设备列表失败:", e);
    uni.showToast({ title: "获取设备列表失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 跳转到设备详情（检查项列表）
const goDeviceDetail = (item) => {
  uni.setStorageSync("currentDevice", item);
  uni.navigateTo({
    url: `/pages/task/device?recordId=${item.recordId}&recordType=${recordType.value}`,
  });
};

// 打开维护弹窗
const openMaintenance = (item) => {
  maintenanceForm.value = {
    recordId: item.recordId,
    deviceLocation: item.deviceLocation || "",
    testSituation: item.testSituation || "",
    testTime: item.testTime || "",
    testResult: item.testResult || "",
    sitePhotosList: item.sitePhotos
      ? item.sitePhotos.split(",").filter((s) => s)
      : [],
  };
  maintenancePopup.value.open();
};

const closeMaintenance = () => {
  maintenancePopup.value.close();
};

const previewImage = (url) => {
  uni.previewImage({
    urls: maintenanceForm.value.sitePhotosList,
    current: url,
  });
};

const deleteImage = (index) => {
  maintenanceForm.value.sitePhotosList.splice(index, 1);
};

const chooseImage = () => {
  uni.chooseImage({
    count: 5 - maintenanceForm.value.sitePhotosList.length,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const tempFilePaths = res.tempFilePaths;
      uni.showLoading({ title: "上传中..." });

      for (const path of tempFilePaths) {
        try {
          const uploadRes = await api.uploadFile(path);
          if (uploadRes.code === 200 || uploadRes.code === 0) {
            maintenanceForm.value.sitePhotosList.push(
              uploadRes.fileName || uploadRes.data.url,
            );
          }
        } catch (e) {
          console.error("图片上传失败:", e);
        }
      }
      uni.hideLoading();
    },
  });
};

const submitMaintenance = async () => {
  try {
    submitting.value = true;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const data = {
      recordId: maintenanceForm.value.recordId,
      deviceLocation: maintenanceForm.value.deviceLocation,
      testSituation: maintenanceForm.value.testSituation,
      testResult: maintenanceForm.value.testResult,
      sitePhotos: maintenanceForm.value.sitePhotosList.join(","),
      testTime: maintenanceForm.value.testTime || formattedDate,
    };

    const res = await api.updateMaintenance(data);
    if (res.code === 200 || res.code === 0) {
      uni.showToast({ title: "保存成功" });
      closeMaintenance();
      loadDeviceList();
    } else {
      uni.showToast({ title: res.msg || "保存失败", icon: "none" });
    }
  } catch (e) {
    console.error("保存维护信息失败:", e);
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    submitting.value = false;
  }
};

onShow(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  recordId.value = options.recordId;
  recordType.value = options.recordType || "0";

  // 从缓存获取系统信息
  const cached = uni.getStorageSync("currentSystem");
  if (cached) {
    systemInfo.value = cached;
  }

  // 加载设备列表
  loadDeviceList();
});
</script>

<style scoped>
.page {
  width: 100vw;
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: calc(16px + env(safe-area-inset-top));
  overflow: hidden;
}

/* 系统标题头部 */
.system-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.header-icon {
  font-size: 32rpx;
}

.header-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

/* 设备列表 */
.device-list {
  flex: 1;
  background: #fff;
}

/* 设备卡片 */
.device-card {
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.device-card:active {
  background: #f9f9f9;
}

.device-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.device-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.device-tag {
  font-size: 22rpx;
  color: #999;
  padding: 4rpx 12rpx;
  background: #f5f5f5;
  border-radius: 4rpx;
}

.device-stats {
  display: flex;
  gap: 30rpx;
}

.stat-item {
  font-size: 26rpx;
  color: #1976d2;
}

.firetest .stat-item {
  color: #f57c00;
}

/* 右侧状态和箭头 */
.device-right {
  position: absolute;
  top: 50%;
  right: 30rpx;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.status-badge text {
  font-size: 24rpx;
}

.status-badge.pending {
  background: #e53935;
}

.firetest .status-badge.pending {
  background: #f57c00;
}

.status-badge.pending text {
  color: #fff;
}

.status-badge.completed {
  background: rgba(76, 175, 80, 0.1);
}

.status-badge.completed text {
  color: #4caf50;
}

.arrow {
  font-size: 36rpx;
  color: #ccc;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40rpx;
}

.loading-state text {
  font-size: 26rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 弹窗样式 */
.popup-content {
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
}

.popup-close {
  font-size: 40rpx;
  color: #999;
}

.popup-form {
  flex: 1;
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: bold;
}

.input {
  height: 80rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.textarea {
  width: 100%;
  height: 160rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  width: 160rpx;
  height: 160rpx;
  position: relative;
}

.image-item image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.image-add {
  width: 160rpx;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx dashed #ccc;
}

.popup-footer {
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-submit {
  background: #ff9800;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.action-btn-wrapper {
  margin-right: 20rpx;
}

.btn-maintain {
  background: #ff9800;
  color: #fff;
  font-size: 24rpx;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 28rpx;
  margin: 0;
}

.btn-maintain:active {
  opacity: 0.8;
}

.firetest .device-name {
  color: #e65100;
}
</style>
