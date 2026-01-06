<template>
  <view class="page">
    <view class="header">
      <text class="title">扫一扫</text>
    </view>
    <view class="content">
      <view class="scan-area">
        <view class="scan-box">
          <text class="scan-icon">📷</text>
          <text class="scan-text">点击扫描设备二维码</text>
          <button class="scan-btn" @tap="handleScan">开始扫描</button>
        </view>
      </view>
    </view>
    <view class="bottom-placeholder"></view>
    <TabBar :currentTab="2" />
  </view>
</template>

<script setup>
import TabBar from "@/components/TabBar.vue";

const handleScan = () => {
  uni.scanCode({
    success: (res) => {
      uni.showToast({ title: "扫描成功", icon: "success" });
      console.log("扫描结果：", res.result);
    },
    fail: () => {
      uni.showToast({ title: "扫描失败", icon: "none" });
    },
  });
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  padding: 60rpx 30rpx 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.content {
  flex: 1;
}

.scan-area {
  display: flex;
  justify-content: center;
  padding-top: 100rpx;
}

.scan-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 60rpx;
  border-radius: 20rpx;
  width: 80%;
}

.scan-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.scan-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.scan-btn {
  background: linear-gradient(90deg, #e53935, #ef5350);
  color: #fff;
  font-size: 30rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}

.scan-btn::after {
  border: none;
}

.bottom-placeholder {
  height: 120rpx;
}
</style>
