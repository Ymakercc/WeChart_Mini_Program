<template>
  <view class="page">
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      title="选择操作"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <view class="content">
      <view class="task-info-card">
        <view class="task-name">{{ taskInfo.taskName || "维保任务" }}</view>
        <view class="company-name">{{
          taskInfo.companyName || "所属公司"
        }}</view>
      </view>

      <view class="action-grid">
        <view class="action-card maintenance" @tap="goToMaintenance">
          <view class="icon-wrapper">
            <uni-icons
              type="wrench-filled"
              size="40"
              color="#ffffff"
            ></uni-icons>
          </view>
          <view class="action-title">常规维保</view>
          <view class="action-desc">执行日常周期性维保检查</view>
        </view>

        <view class="action-card firetest" @tap="goToFireTest">
          <view class="icon-wrapper">
            <uni-icons type="fire-filled" size="40" color="#ffffff"></uni-icons>
          </view>
          <view class="action-title">消防测试</view>
          <view class="action-desc">执行消防设施专项测试</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

const taskId = ref(null);
const taskInfo = ref({});

onLoad((options) => {
  taskId.value = options.id;
  // 从缓存获取任务简要信息
  const currentTask = uni.getStorageSync("currentTask");
  if (currentTask && currentTask.taskId == taskId.value) {
    taskInfo.value = currentTask;
  }
});

const goBack = () => {
  uni.navigateBack();
};

const goToMaintenance = () => {
  uni.navigateTo({
    url: `/pages/task/detail?id=${taskId.value}&recordType=0`,
  });
};

const goToFireTest = () => {
  uni.navigateTo({
    url: `/pages/task/detail?id=${taskId.value}&recordType=1`,
  });
};
</script>

<style scoped>
.page {
  width: 100vw;
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 30rpx;
  padding-top: calc(16px + env(safe-area-inset-top));
}

.task-info-card {
  background-color: #ffffff;
  padding: 40rpx;
  border-radius: 24rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.task-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.company-name {
  font-size: 28rpx;
  color: #666;
}

.action-grid {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.action-card {
  height: 280rpx;
  border-radius: 28rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  transition: all 0.2s;
}

.action-card:active {
  transform: scale(0.97);
  opacity: 0.9;
}

.maintenance {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  box-shadow: 0 12rpx 30rpx rgba(33, 150, 243, 0.3);
}

.firetest {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  box-shadow: 0 12rpx 30rpx rgba(255, 152, 0, 0.3);
}

.icon-wrapper {
  margin-bottom: 16rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 20rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
  letter-spacing: 2rpx;
}

.action-desc {
  font-size: 24rpx;
  opacity: 0.85;
}

/* 覆盖 uni-nav-bar 样式 */
:deep(.uni-nav-bar-text) {
  font-size: 34rpx !important;
  font-weight: bold !important;
}
</style>
