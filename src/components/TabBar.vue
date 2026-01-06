<template>
  <view class="custom-tabbar">
    <view
      class="tab-item"
      :class="{ active: currentTab === 0 }"
      @tap="switchTab(0)"
    >
      <image
        class="tab-icon"
        src="/static/tabbar/home.png"
        mode="aspectFit"
      ></image>
      <text class="tab-text">首页</text>
    </view>
    <view
      class="tab-item"
      :class="{ active: currentTab === 1 }"
      @tap="switchTab(1)"
    >
      <image
        class="tab-icon"
        src="/static/tabbar/message.png"
        mode="aspectFit"
      ></image>
      <text class="tab-text">消息</text>
    </view>
    <view
      class="tab-item"
      :class="{ active: currentTab === 2 }"
      @tap="switchTab(2)"
    >
      <image
        class="tab-icon"
        src="/static/tabbar/socde.png"
        mode="aspectFit"
      ></image>
      <text class="tab-text">扫一扫</text>
    </view>
    <view
      class="tab-item"
      :class="{ active: currentTab === 3 }"
      @tap="switchTab(3)"
    >
      <image
        class="tab-icon"
        src="/static/tabbar/info.png"
        mode="aspectFit"
      ></image>
      <text class="tab-text">我的</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  currentTab: {
    type: Number,
    default: 0,
  },
});

const tabPages = [
  "/pages/index/index",
  "/pages/message/index",
  "/pages/scan/index",
  "/pages/mine/index",
];

const switchTab = (index) => {
  if (index === props.currentTab) return;
  // 使用 redirectTo 避免页面堆栈过深
  uni.redirectTo({ url: tabPages[index] });
};
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #e9afaa;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 22rpx;
  color: #999;
}

.tab-item.active .tab-text {
  color: #e53935;
}
</style>
