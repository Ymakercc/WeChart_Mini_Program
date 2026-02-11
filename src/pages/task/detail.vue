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
      <!-- 任务标题 -->
      <view class="task-header">
        <view class="task-icon">📋</view>
        <text class="task-title">{{ taskInfo.taskName || "维保任务" }}</text>
      </view>

      <!-- 系统列表 -->
      <scroll-view class="system-list" scroll-y>
        <view
          class="system-card"
          v-for="item in systemList"
          :key="item.recordId"
          @tap="goSystemDetail(item)"
        >
          <!-- 系统名称 -->
          <view class="system-name">{{
            item.itemName || item.systemName
          }}</view>

          <!-- 统计信息 -->
          <view class="system-stats">
            <text class="stat-item">总项 {{ item.totalItems || 0 }}</text>
            <text class="stat-item">已完成 {{ item.completedItems || 0 }}</text>
            <text class="stat-item"
              >未完成 {{ item.uncompletedItems || 0 }}</text
            >
          </view>

          <!-- 状态和箭头 -->
          <view class="system-right">
            <text
              class="status-text"
              :class="
                item.completedItems >= item.totalItems && item.totalItems > 0
                  ? 'completed'
                  : 'pending'
              "
            >
              {{
                item.completedItems >= item.totalItems && item.totalItems > 0
                  ? "已完成"
                  : "未完成"
              }}
            </text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading-state" v-if="loading">
          <text>加载中...</text>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="systemList.length === 0 && !loading">
          <text class="empty-text">暂无系统数据</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onMounted, ref } from "vue";

const taskId = ref(null);
const loading = ref(false);
const taskInfo = ref({});
const systemList = ref([]);

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 跳转到结论页面
const goConclusion = () => {
  uni.showToast({ title: "结论功能开发中", icon: "none" });
};

// 加载任务详情
const loadTaskDetail = async () => {
  if (!taskId.value) return;

  try {
    loading.value = true;
    const res = await api.getTaskDetail(taskId.value);

    if (res.code === 200 || res.code === 0) {
      const data = res.data || {};
      taskInfo.value = data;

      // 如果详情接口返回系统列表
      if (data.systems && Array.isArray(data.systems)) {
        systemList.value = data.systems;
      } else {
        // 否则单独获取系统列表
        loadSystemList();
      }
    }
  } catch (e) {
    console.error("获取任务详情失败:", e);
    // 使用缓存数据
    const cached = uni.getStorageSync("currentTask");
    if (cached) {
      taskInfo.value = cached;
    }
    loadSystemList();
  } finally {
    loading.value = false;
  }
};

// 加载系统列表
const loadSystemList = async () => {
  if (!taskId.value) return;

  try {
    loading.value = true;
    const res = await api.getTaskDetail(taskId.value);

    if (res.code === 200 || res.code === 0) {
      systemList.value = res.data || res.rows || [];
    }
  } catch (e) {
    console.error("获取系统列表失败:", e);
  } finally {
    loading.value = false;
  }
};

// 跳转到系统详情（设备列表）
const goSystemDetail = (item) => {
  uni.setStorageSync("currentSystem", item);
  uni.navigateTo({
    url: `/pages/task/system?recordId=${item.recordId}`,
  });
};

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage.options?.id;

  if (id) {
    taskId.value = id;
    loadTaskDetail();
  } else {
    // 从缓存获取
    const cached = uni.getStorageSync("currentTask");
    if (cached) {
      taskInfo.value = cached;
      taskId.value = cached.taskId;
      loadTaskDetail();
    }
  }
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

/* 导航栏右侧 */
.nav-right {
  padding: 0 20rpx;
}

.nav-right-text {
  font-size: 28rpx;
  color: #ffffff;
}

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: calc(16px + env(safe-area-inset-top));
  overflow: hidden;
}

/* 任务标题头部 */
.task-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.task-icon {
  font-size: 36rpx;
}

.task-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

/* 系统列表 */
.system-list {
  flex: 1;
  padding: 20rpx;
}

/* 系统卡片 */
.system-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.system-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  padding-right: 150rpx;
}

.system-stats {
  display: flex;
  gap: 30rpx;
}

.stat-item {
  font-size: 26rpx;
  color: #1976d2;
}

/* 右侧状态和箭头 */
.system-right {
  position: absolute;
  top: 50%;
  right: 30rpx;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.status-text {
  font-size: 26rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.status-text.pending {
  color: #1976d2;
  background: rgba(25, 118, 210, 0.1);
}

.status-text.completed {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
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

:deep(.uni-navbar__header-btns-right) {
  z-index: 10 !important;
  position: relative !important;
}
</style>
