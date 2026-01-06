<template>
  <view class="page">
    <view class="header">
      <text class="title">消息中心</text>
    </view>
    <view class="content">
      <view class="empty">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </view>
    <view class="bottom-placeholder"></view>
    <TabBar :currentTab="1" />
  </view>
</template>

<script setup>
import TabBar from "@/components/TabBar.vue";
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

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.bottom-placeholder {
  height: 120rpx;
}
</style>
