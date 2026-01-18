<template>
  <view class="page">
    <!-- 导航栏 -->
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      title="系统设备"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <view class="content">
      <!-- 系统标题头部 -->
      <view class="system-header">
        <text class="header-icon">📋</text>
        <text class="header-title">{{ systemInfo.systemName || "系统" }}</text>
      </view>

      <!-- 设备列表 -->
      <scroll-view class="device-list" scroll-y>
        <view
          class="device-card"
          v-for="item in deviceList"
          :key="item.deviceId"
          @tap="goDeviceDetail(item)"
        >
          <!-- 设备名称和标签 -->
          <view class="device-header">
            <text class="device-name">{{ item.deviceName }}</text>
            <text class="device-tag">巡查</text>
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
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onMounted, ref } from "vue";

const systemId = ref(null);
const taskId = ref(null);
const loading = ref(false);
const systemInfo = ref({});
const deviceList = ref([]);

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 加载设备列表
const loadDeviceList = async () => {
  if (!systemId.value) return;

  try {
    loading.value = true;
    const res = await api.getDevicesBySystemId(systemId.value);

    if (res.code === 200 || res.code === 0) {
      deviceList.value = res.data || res.rows || [];
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
    url: `/pages/task/device?id=${item.deviceId}&systemId=${systemId.value}&taskId=${taskId.value}`,
  });
};

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  systemId.value = options.id;
  taskId.value = options.taskId;

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

/* 覆盖 uni-nav-bar 样式 */
:deep(.uni-nav-bar-text) {
  font-size: 36rpx !important;
  font-weight: bold !important;
}

:deep(.uni-navbar__header-container) {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  display: flex !important;
  justify-content: center !important;
  pointer-events: none;
}

:deep(.uni-navbar__header-container-inner) {
  pointer-events: auto;
}

:deep(.uni-navbar__header-btns-left) {
  z-index: 10 !important;
  position: relative !important;
}
</style>
