<template>
  <view class="page">
    <!-- 导航栏 -->
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      title="检查项列表"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <view class="content">
      <!-- 设备信息头部 -->
      <view class="device-header">
        <view class="device-info">
          <text class="device-name">{{ deviceInfo.deviceName || "设备" }}</text>
          <text class="device-code" v-if="deviceInfo.deviceCode"
            >编号：{{ deviceInfo.deviceCode }}</text
          >
        </view>
        <view class="device-stats">
          <text class="stat-label">完成进度</text>
          <text class="stat-value"
            >{{ completedCount }} / {{ itemList.length }}</text
          >
        </view>
      </view>

      <!-- 检查项列表 -->
      <scroll-view class="item-list" scroll-y>
        <view
          class="item-card"
          v-for="item in itemList"
          :key="item.itemId"
          @tap="toggleItem(item)"
        >
          <!-- 左侧复选框 -->
          <view
            class="item-checkbox"
            :class="{ checked: item.isComplete === '1' }"
          >
            <uni-icons
              v-if="item.isComplete === '1'"
              type="checkmarkempty"
              size="16"
              color="#fff"
            />
          </view>

          <!-- 中间内容 -->
          <view class="item-content">
            <text class="item-name">{{ item.itemName }}</text>
            <view class="item-meta" v-if="item.checkTime">
              <text class="meta-text">{{ item.checkUserName }}</text>
              <text class="meta-text">{{ formatTime(item.checkTime) }}</text>
            </view>
          </view>

          <!-- 右侧状态 -->
          <view class="item-status">
            <view
              class="status-badge"
              :class="item.isComplete === '1' ? 'completed' : 'pending'"
            >
              <text>{{ item.isComplete === "1" ? "已完成" : "未完成" }}</text>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading-state" v-if="loading">
          <text>加载中...</text>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="itemList.length === 0 && !loading">
          <text class="empty-text">暂无检查项</text>
        </view>
      </scroll-view>

      <!-- 底部操作按钮 -->
      <view class="footer" v-if="itemList.length > 0">
        <view class="btn-submit" @tap="handleSubmit">
          <text>提交检查结果</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { computed, onMounted, ref } from "vue";

const deviceId = ref(null);
const systemId = ref(null);
const taskId = ref(null);
const loading = ref(false);
const deviceInfo = ref({});
const itemList = ref([]);

// 计算已完成数量
const completedCount = computed(() => {
  return itemList.value.filter((item) => item.isComplete === "1").length;
});

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return "";
  return time.substring(0, 16);
};

// 加载检查项列表
const loadItemList = async () => {
  if (!deviceId.value) return;

  try {
    loading.value = true;
    const res = await api.getItemsByDeviceId(deviceId.value);

    if (res.code === 200 || res.code === 0) {
      itemList.value = res.data || res.rows || [];
    }
  } catch (e) {
    console.error("获取检查项列表失败:", e);
    uni.showToast({ title: "获取检查项列表失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 切换检查项状态
const toggleItem = (item) => {
  // 切换完成状态
  item.isComplete = item.isComplete === "1" ? "0" : "1";
  item.checkResult = item.isComplete;

  // 如果标记为完成，记录时间
  if (item.isComplete === "1") {
    item.checkTime = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
  }
};

// 提交检查结果
const handleSubmit = async () => {
  try {
    uni.showLoading({ title: "提交中...", mask: true });

    // 构造提交数据
    const results = itemList.value.map((item) => ({
      itemId: item.itemId,
      deviceId: item.deviceId,
      checkResult: item.checkResult || item.isComplete,
      isComplete: item.isComplete,
      faultDesc: item.faultDesc || "",
      remark: item.remark || "",
    }));

    const res = await api.batchSubmitCheckResults({
      taskId: taskId.value,
      deviceId: deviceId.value,
      items: results,
    });

    if (res.code === 200 || res.code === 0) {
      uni.showToast({ title: "提交成功", icon: "success" });
      // 通知上一页刷新
      uni.$emit("refreshDeviceList");
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({ title: res.msg || "提交失败", icon: "none" });
    }
  } catch (e) {
    console.error("提交失败:", e);
    uni.showToast({ title: "提交失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  deviceId.value = options.id;
  systemId.value = options.systemId;
  taskId.value = options.taskId;

  // 从缓存获取设备信息
  const cached = uni.getStorageSync("currentDevice");
  if (cached) {
    deviceInfo.value = cached;
  }

  // 加载检查项列表
  loadItemList();
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

/* 设备信息头部 */
.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.device-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.device-code {
  font-size: 24rpx;
  color: #999;
}

.device-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.stat-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #e53935;
}

/* 检查项列表 */
.item-list {
  flex: 1;
  background: #fff;
}

/* 检查项卡片 */
.item-card {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.item-card:active {
  background: #f9f9f9;
}

/* 复选框 */
.item-checkbox {
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.item-checkbox.checked {
  background: #4caf50;
  border-color: #4caf50;
}

/* 内容区 */
.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-name {
  font-size: 30rpx;
  color: #333;
}

.item-meta {
  display: flex;
  gap: 20rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999;
}

/* 状态区 */
.item-status {
  margin-left: 16rpx;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.status-badge text {
  font-size: 24rpx;
}

.status-badge.pending {
  background: rgba(229, 57, 53, 0.1);
}

.status-badge.pending text {
  color: #e53935;
}

.status-badge.completed {
  background: rgba(76, 175, 80, 0.1);
}

.status-badge.completed text {
  color: #4caf50;
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

/* 底部按钮 */
.footer {
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.btn-submit {
  height: 88rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-submit text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
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
